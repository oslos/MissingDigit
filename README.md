!add	$(urlfetch http://xxx.xxx.xxx.xxx:xxxx/add?num=$(1)&text=$(2)&user=$(user)&userid=$(userid)&userLevel=$(userlevel)&streamTime=$(twitch $(channel) "{{uptimeLength}}"))	Moderator	 
!sum	$(urlfetch http://xxx.xxx.xxx.xxx:xxxx/sum)	Moderator	 
!undo	$(urlfetch http://xxx.xxx.xxx.xxx:xxxx/undo?userid=$(userid))	Moderator	 

