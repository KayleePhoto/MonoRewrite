# Monokubs
A small Discord bot, based around the Danganronpa series.
Created by Kaylee#9999 and Jackel.

# Features
Nothing 🙃
# Known Bugs
**Everything**
# Current Work List
- The bot
- Setup
- Different Games
	- Killing game
	- Card collecting game
	- More?
# How To Setup
**THIS IS NOT COMPLETE.**  
I'M STILL WORKING ON THIS
---

---

- create a `/secrets/.env`. This will hold all of your secrets.
	- It is possible to use a different, path. You'll just need to change the config path in files.  
	```basic
	# Bot
	Token	= '<Token from https://discord.com/developers/applications>'
	# Database
	dbName	= '<exampleDB>'
	dbUser	= '<exampleUser>'
	dbPass	= '<password>'
	host	= '<localhost or server IP>'
	# SubmitError
	server	= '<Your developing Discord server id>' # This is also used in deploy commands.
	channel	= '<Error Channel ID>'
	author	= '<Your user ID>' # for pings on errors
	# Deploy Commands
	# Guild
	client_id = '<Client ID from https://discord.com/developers/applications>'
	```
- run SQL scripts, to create a MySql Tables. **Not available yet**
- run `pnpm build` and `pnpm deploy:guild:create` | **see [Package.json](package.json) scripts**  
**Keep in mind, the `/build` folder. This folder will also need your `.env` in `/secrets`**
- run `pnpm dev` and enjoy
- Do other things to have your proper build and not just a development scripts.

## Note
**All my Database calls, are between two User and Config.**  
**If you add anymore more tables to your DB, keep that in mind, for something like "findUser" is not dynamic**
