const { SlashCommandBuilder } = require('discord.js');

const pName = process.env['participantTableName'];
const pCols = [process.env['participantTableCols0'], process.env['participantTableCols1'], process.env['participantTableCols2'], process.env['participantTableCols3'], process.env['participantTableCols4'], process.env['participantTableCols5']];

const soName = process.env['solvedTableName'];
const soCols = [process.env['solvedTableCols0'], process.env['solvedTableCols1'], process.env['solvedTableCols2'], process.env['solvedTableCols3']];

const suName = process.env['submissionsTableName'];
const suCols = [process.env['submissionsTableCols0'], process.env['submissionsTableCols1'], process.env['submissionsTableCols2']];

const akName = process.env['answerkeyTableName'];
const akCols = [process.env['answerkeyTableCols0'], process.env['answerkeyTableCols1'], process.env['answerkeyTableCols2'], process.env['answerkeyTableCols3']];

const discussionChannels = {
  "1-1": process.env['1-1d'],
  "1-2": process.env['1-2d'],
  "1-3": process.env['1-3d'],
  "1-4": process.env['1-4d'],
  "1-5": process.env['1-5d'],
  "1-6": process.env['1-6d'],
  "1-7": process.env['1-7d'],
  "1-8": process.env['1-8d'],
  "2-1": process.env['2-1d'],
  "2-2": process.env['2-2d'],
  "2-3": process.env['2-3d'],
  "2-4": process.env['2-4d'],
  "2-5": process.env['2-5d'],
  "2-6": process.env['2-6d'],
  "2-7": process.env['2-7d'],
  "2-8": process.env['2-8d'],
  "3-1": process.env['3-1d'],
  "3-2": process.env['3-2d'],
  "3-3": process.env['3-3d'],
  "3-4": process.env['3-4d'],
  "3-5": process.env['3-5d'],
  "3-6": process.env['3-6d'],
  "3-7": process.env['3-7d'],
  "3-8": process.env['3-8d'],
};

const { roleInfo } = require('../role');

const SQLITE = require('better-sqlite3');
const db = new SQLITE('./db/data.db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('submit')
    .setDescription('Submits a solution to a problem')
    .addStringOption(option => option.setName('question').setDescription('Enter the question you are solving').setRequired(true))
    .addIntegerOption(option => option.setName('solution').setDescription('Enter your solution').setRequired(true)),
  async execute(interaction) {
    const submitter = interaction.member;
    const question = interaction.options.getString('question');
    const solution = interaction.options.getInteger('solution');

    if (!submitter.roles.cache.some(role => role.name === roleInfo.name)) {
      await interaction.reply({ content: `You have to register before you can submit solutions!`, ephemeral: true });
    }
    else if (!(question in discussionChannels)) {
      await interaction.reply({ content: `Couldn't find the question ${question}; did you use a valid argument?`, ephemeral: true });
    }
    else if (db.prepare(
      `SELECT * FROM ${akName}
            WHERE ${akCols[0]} = '${question}'`
    ).get()[akCols[2]] > Date.now()) {
      await interaction.reply({ content: `This question hasn't been posted yet.`, ephemeral: true });
    }
    else {
      try {
        if (db.prepare(
          `SELECT * FROM ${soName}
                    WHERE ${soCols[0]} = '${submitter.user.username}'
                    AND ${soCols[1]} = ${submitter.user.discriminator}
                    AND ${soCols[2]} = '${question}'`
        ).get()) {
          await interaction.reply({ content: `You can't submit answers to this question anymore.`, ephemeral: true });
        }
        else {
          const answer = db.prepare(
            `SELECT * FROM ${akName}
                        WHERE ${akCols[0]} = '${question}'`
          ).get();

          if (answer[akCols[1]] == solution) {
            now = new Date(Date.now());

            db.prepare(
              `INSERT INTO ${soName}
                            (${soCols[0]}, ${soCols[1]}, ${soCols[2]}, ${soCols[3]})
                            VALUES ('${submitter.user.username}', ${submitter.user.discriminator}, '${question}', ${now.getTime()})`
            ).run();

            db.prepare(
              `UPDATE ${pName}
                            SET ${pCols[1 + answer[akCols[3]]]} = ${pCols[1 + answer[akCols[3]]]} + 1
                            WHERE ${pCols[0]} = '${submitter.user.username}'
                            AND ${pCols[1]} = ${submitter.user.discriminator}`
            ).run();

            const discussion = interaction.guild.channels.cache.get(discussionChannels[question]);
            discussion.permissionOverwrites.edit(submitter, { ViewChannel: true });
          now.setTime(now.getTime() - 300*60000)
            await interaction.reply({ content: `Correct answer!\nReceived ${now.toLocaleString()}`, ephemeral: true });
          }
          else {
            db.prepare(
              `INSERT INTO ${suName}
                            (${suCols[0]}, ${suCols[1]}, ${suCols[2]})
                            VALUES ('${submitter.user.username}', ${submitter.user.discriminator}, '${question}')`
            ).run();

            await interaction.reply({ content: `Incorrect answer. Try again!`, ephemeral: true });
          }
        }
      }
      catch (error) {
        console.log(error);
        if (error instanceof SQLITE.SqliteError) {
          await interaction.reply({ content: `SQLite error: ${error.code}`, ephemeral: true });
        }
        else {
          await interaction.reply({ content: `${error.name} while submitting; go yell at Mia.`, ephemeral: true });
        }
      }
    }
  },
}