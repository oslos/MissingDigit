const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const moment = require('moment-timezone');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

let data = [];

function loadData() {
  try {
    const jsonData = fs.readFileSync('data.json');
    data = JSON.parse(jsonData);
    data.forEach((row) => {
      row.channel = row.channel || 'default'; // default channel if not already specified
    });
  } catch (err) {
    console.error(err);
  }
}


loadData();

fs.readFile('data.json', (err, jsonData) => {
  if (err) {
    console.error(err);
  } else {
    try {
      data = JSON.parse(jsonData);
    } catch (err) {
      console.error(err);
    }
  }
});

app.get('/add', (req, res) => {
  var num = eval(req.query.num);
  const text = req.query.text;
  const user = req.query.user;
  const userId = Number(req.query.userid);
  const userLevel = req.query.userLevel;
  const streamTime = req.query.streamtime;
  const channel = req.query.channel || 'default'; // default channel if not already specified

  if (!['moderator', 'owner'].includes(userLevel.toLowerCase())) {
    return res.status(401).send('Unauthorized');
  }

  const lastRow = data[data.length - 1];
  const id = (lastRow ? lastRow.id + 1 : 1);

  const date = moment().tz('America/Chicago').format('YYYY-MM-DDTHH:mm:ss.SSSZ');
  data.push({ id, num, text, user, userId, userLevel, date, streamTime, channel });
  saveData();
  const filteredData = data.filter((row) => row.channel === channel);
  const sum = filteredData.reduce((acc, row) => acc + row.num, 0);
  res.send(`Added number: ${num}, comment: "${text}". Current total: ${sum}`);
});


app.get('/sum', (req, res) => {
  const channel = req.query.channel || 'default'; // default channel if not already specified
  const sum = data.filter((row) => row.channel === channel).reduce((acc, row) => acc + row.num, 0);
  res.send(`Current total: ${sum}`);
});

app.get('/data', (req, res) => {
  const channel = req.query.channel || 'default'; // default channel if not already specified
  const filteredData = data.filter((row) => row.channel === channel);
  res.send(filteredData);
});

app.get('/datacsv', (req, res) => {
  const channel = req.query.channel || 'default'; // default channel if not already specified
  const filteredData = data.filter((row) => row.channel === channel);
  const rows = [];
  const header = Object.keys(filteredData[0]);
  
  filteredData.forEach((obj) => {
    const values = Object.values(obj);
    const row = values.join(",");
    rows.push(row);
  });
  
  let csv = header.join(",") + "\n";
  csv += rows.join("\n");

  const filename = `${uuidv4()}.csv`;

  // Write CSV to file
  fs.writeFile(filename, csv, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error writing file');
    }

    // Return file as response
    res.download(filename, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error sending file');
      }

      // Delete file after response sent
      fs.unlinkSync(filename);
    });
  });
});

app.get('/undo', (req, res) => {
  const userId = Number(req.query.userid);
  const channel = req.query.channel || 'default'; // default channel if not already specified

  if (userId === undefined) {
    return res.status(400).send('Missing userid parameter');
  }

  const rowsToDelete = data.filter((row) => row.userId === userId && row.channel === channel);


  if (rowsToDelete.length === 0) {
    return res.status(404).send('No rows found for given userid');
  }

  const lastRowToDelete = rowsToDelete[rowsToDelete.length - 1];
  data = data.filter((row) => row !== lastRowToDelete);
  saveData();
  res.send(`Deleted row: id: ${lastRowToDelete.id}, num: ${lastRowToDelete.num}, text: "${lastRowToDelete.text}", user: "${lastRowToDelete.user}", date: "${lastRowToDelete.date}", streamTime: "${lastRowToDelete.streamTime}" }`);
});

function saveData() {
  const jsonData = JSON.stringify(data);
  fs.writeFile('data.json', jsonData, (err) => {
    if (err) {
      console.error(err);
    }
  });
}

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
