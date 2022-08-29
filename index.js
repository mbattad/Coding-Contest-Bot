const { botToken, testServerId, questionChannel } = require('./config');
const path = require('node:path');
const fs = require('node:fs');
const SQLITE = require('better-sqlite3');
const schedule = require('node-schedule');
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const questionInfo = require('./db/question_info.json');

const db = new SQLITE('./db/data.db');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
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
  db.pragma("synchronous = 1");
  db.pragma("journal_mode = wal");
  let server = client.guilds.cache.get(testServerId);

  //placeholder for testing
  //schedule.scheduleJob(questionInfo.test.postAt, () => {
  //  server.channels.cache.get(questionChannel).send(questionInfo.test.message + questionInfo.ping);
  //});
  
  // for(batch in questionInfo)
  // {
  //   schedule.scheduleJob(batch.postAt, () =>
  //   {
  //     server.channels.cache.get(questionChannel).send(batch.message + questionInfo.ping);
  //   });
  // }

  console.log("Finished setting up!");
});

client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand())
  {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
  
    try
    {
      await command.execute(interaction);
    }
    catch (error)
    {
      console.error(error);
      await interaction.reply({ content: `${error.name} while executing the command.`, ephemeral: true });
    }
  }
  else return;
});

client.login(botToken);