const keepAlive = require('./server.js');
const botToken = process.env['botToken'];
const serverId = process.env['serverId'];
const infoChannel = process.env['infoChannel'];
const questionChannels = [process.env['qc1'], process.env['qc2'], process.env['qc3']];
const questionInfo = require('./db/question_info.json');
const path = require('node:path');
const fs = require('node:fs');
const SQLITE = require('better-sqlite3');
const { Client, Collection, GatewayIntentBits, Partials, ActivityType } = require('discord.js');
const akName = process.env['answerkeyTableName'];
const akCols = [process.env['answerkeyTableCols0'], process.env['answerkeyTableCols1'], process.env['answerkeyTableCols2'], process.env['answerkeyTableCols3'], process.env['answerkeyTableCols4']];

const db = new SQLITE('./db/data.db');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel]
});

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

  console.log("Finished setting up!");
  client.user.setActivity("/contest", { type: ActivityType.Competing });
});

client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    }
    catch (error) {
      console.error(error);
      await interaction.reply({ content: `${error.name} while executing the command.`, ephemeral: true });
    }
  }
  else return;
});

const postQuestions = async () => {
  let server = client.guilds.cache.get(serverId);
  let ping = "\n\nHave fun!\n<@&1014022855199047690>";

  let questions = db.prepare(
    `SELECT * FROM ${akName}
    WHERE ${akCols[2]} < ${Date.now()}
    AND ${akCols[4]} = 0`
  ).all();

  if (questions.length > 0) {
    for (q of questions) {
      let qId = q[akCols[0]];
      let qc = server.channels.cache.get(questionChannels[q[akCols[3]] - 1]);
      await qc.send({ embeds: questionInfo[qId].embeds });
      await qc.send({ content: questionInfo[qId].content, files: questionInfo[qId].files });
      db.prepare(
        `UPDATE ${akName}
          SET ${akCols[4]} = 1
          WHERE ${akCols[0]} = '${qId}'`
      ).run();
    }

    await server.channels.cache.get(infoChannel).send("Today's questions have been posted!" + ping);
  } else console.log("no questions found");
}

setInterval(postQuestions, 30000);
keepAlive();
client.login(botToken);