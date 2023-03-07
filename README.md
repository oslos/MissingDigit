add commands to nightbot
!add 
$(urlfetch http://3.127.108.128:3000/add?num=$(1)&text=$(2)&user=$(user)&userid=$(userid)&userLevel=$(userlevel)&streamTime=$(twitch $(channel) "{{uptimeLength}}"))
!sum
$(urlfetch http://3.127.108.128:3000/sum)
