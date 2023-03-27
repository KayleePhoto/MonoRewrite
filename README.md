# Monokubs
A small Discord bot, based around the Danganronpa series.
Created by Kaylee#9999 and Jackel.

# Something to note for myself.
Don't ever use git in command line. I made two commits by accident and it aggrivates me.

# Features
- Games
	- "Killing" game
		> where a user is found "dead" then the people with the game role,  
		> do what they can, because it's text, to find the killer.  
		> Once ready, the `/vote` command, will being a 5 minute timer.  
		> After that, a chart graphing the killers and their votes will be listed.
- Config
	- Activate games by setting up their settings.
# Known Bugs
**Everything**
# Current Work List
- Config Command
	- Proper compatibility with other games
	- Including the Database.
- Killing Game
	- Selectable punishment settings
		- the annoying task of getting user ids before finished the killing game for punishments.
- Different Games
	- Card collecting game
	- More?
# How To Setup
**THIS IS NOT COMPLETE.**  
I'M STILL WORKING ON THIS
---

---

- create a `src/secrets/.env`. This will hold all of your secrets.
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
	server	= '<Your developing Discord server id>' # This is also used in guild deploy command.
	channel	= '<Error Channel ID>'
	author	= '<Your user ID>' # for pings on errors
	# Deploy Commands
	client_id = '<Client ID from https://discord.com/developers/applications>'
	```
- run sql scripts | `mysql> source (path to bot)/src/database/db.sql`  
> Note that I used pnpm. The -lock is not included, so you can use whatever package manager you want.
- run `pnpm build` and `pnpm deploy:guild:create` | **see [Package.json](package.json) scripts**  
**The `/build` folder will also need your `.env` in `/secrets`**
- run `pnpm dev` and enjoy | **This command does recompile the code.**
- Do other things to have your proper build and not just a development scripts.

## Note
**All my Database calls, are between two User and Config.**  
**If you add anymore more tables to your DB, keep that in mind, for something like "findUser" is not dynamic**
