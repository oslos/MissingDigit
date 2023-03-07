const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const moment = require('moment-timezone');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

let data = [];

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
  const num = Number(req.query.num);
  const text = req.query.text;
  const user = req.query.user;
  const userId = Number(req.query.userid);
  const userLevel = req.query.userLevel;
  const streamTime = req.query.streamtime;

  if (!['moderator', 'owner'].includes(userLevel.toLowerCase())) {
    return res.status(401).send('Unauthorized');
  }

  const lastRow = data[data.length - 1];
  const id = (lastRow ? lastRow.id + 1 : 1);

  const date = moment().tz('America/Chicago').format('YYYY-MM-DDTHH:mm:ss.SSSZ');
  data.push({ id, num, text, user, userId, userLevel, date, streamTime });
  saveData();
  res.send(`Added row: { id: ${id}, num: ${num}, text: "${text}", user: "${user}", userId: ${userId}, userLevel: "${userLevel}", date: "${date}", streamTime: "${streamTime}" }`);
});

app.get('/sum', (req, res) => {
  const sum = data.reduce((acc, row) => acc + row.num, 0);
  res.send(`The sum is: ${sum}`);
});

app.get('/data', (req, res) => {
  res.send(data);
});

app.get('/undo', (req, res) => {
  const userId = Number(req.query.userid);

  if (userId === undefined) {
    return res.status(400).send('Missing userid parameter');
  }

  const rowsToDelete = data.filter((row) => row.userId === userId);

  if (rowsToDelete.length === 0) {
    return res.status(404).send('No rows found for given userid');
  }

  const lastRowToDelete = rowsToDelete[rowsToDelete.length - 1];
  data = data.filter((row) => row !== lastRowToDelete);
  saveData();
  res.send(`Deleted row: { id: ${lastRowToDelete.id}, num: ${lastRowToDelete.num}, text: "${lastRowToDelete.text}", user: "${lastRowToDelete.user}", userId: ${lastRowToDelete.userId}, userLevel: "${lastRowToDelete.userLevel}", date: "${lastRowToDelete.date}", streamTime: "${lastRowToDelete.streamTime}" }`);
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