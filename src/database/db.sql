CREATE TABLE monokubs.config (
	server varchar(30) NOT NULL PRIMARY KEY,
	channel varchar(30) NULL,
	`role` varchar(30) NULL,
	pingable tinyint(1) DEFAULT 1 NOT NULL,
	hasGame tinyint(1) DEFAULT 0 NOT NULL,
	started tinyint(1) DEFAULT 0 NOT NULL,
	isVoting tinyint(1) DEFAULT 0 NOT NULL,
	votedKillers json NULL
);

CREATE TABLE monokubs.`user` (
	id varchar(30) NOT NULL PRIMARY KEY,
	sucKill int DEFAULT 0 NOT NULL,
	caught int DEFAULT 0 NOT NULL,
	victim int DEFAULT 0 NOT NULL,
	isKiller tinyint(1) DEFAULT 0 NOT NULL,
	isVictim tinyint(1) DEFAULT 0 NOT NULL,
	gameServer varchar(30) NULL
);
