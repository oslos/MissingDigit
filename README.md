add commands to nightbot
!add 
$(urlfetch http://xxx.xxx.xxx.xxx:xxxx/add?num=$(1)&text=$(2)&user=$(user)&userid=$(userid)&userLevel=$(userlevel)&streamTime=$(twitch $(channel) "{{uptimeLength}}"))
!sum
$(urlfetch http://xxx.xxx.xxx.xxx:xxxx/sum)
