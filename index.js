const { botToken, participantTable, answerkeyTable, submissionsTable } = require('./config');
const path = require('node:path');
const fs = require('node:fs');
const SQLITE = require('better-sqlite3');
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');

const db = new SQLITE('./db/data.db');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds
  ],
  partials: [Partials.Channel] });
  
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}
  
client.on("ready", () => {
  //initialize the database if it doesn't exist
  const participants = db.prepare(`SELECT * FROM ${participantTable.name}`).all();
  console.log('found participants:');
  for(u of participants)
  {
	console.log(`\t${u[participantTable.cols[0]]}`);
  }
  
  db.pragma("synchronous = 1");
  db.pragma("journal_mode = wal");

  console.log("I am ready!");
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.login(botToken);