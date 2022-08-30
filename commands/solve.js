const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { roleInfo } = require('../role');

const soName = process.env['solvedTableName'];
const soCols = [process.env['solvedTableCols0'], process.env['solvedTableCols1'], process.env['solvedTableCols2'], process.env['solvedTableCols3']];

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
const SQLITE = require('better-sqlite3');
const db = new SQLITE('./db/data.db');

module.exports =
{
  data: new SlashCommandBuilder()
    .setName('solve')
    .setDescription('Reveals the answer to a question (you will not be able to attempt this question anymore)')
    .addStringOption(option => option.setName('question').setDescription('Enter the question you want the solution to').setRequired(true)),
  async execute(interaction) {
    const user = interaction.member;
    const qId = interaction.options.getString('question');

    if (!user.roles.cache.some(role => role.name === roleInfo.name)) {
      await interaction.reply({ content: `You have to register before you can request solutions!`, ephemeral: true });
    }
    else if (!(qId in discussionChannels)) {
      await interaction.reply({ content: `Couldn't find the question ${qId}; did you use a valid argument?`, ephemeral: true });
    }
    else if (db.prepare(
      `SELECT * FROM ${akName}
            WHERE ${akCols[0]} = '${qId}'`
    ).get()[akCols[2]] > Date.now()) {
      await interaction.reply({ content: `This question hasn't been posted yet.`, ephemeral: true });
    }
    else if (db.prepare(
      `SELECT * FROM ${soName}
            WHERE ${soCols[0]} = '${user.user.username}'
            AND ${soCols[1]} = ${user.user.discriminator}
            AND ${soCols[2]} = '${qId}'`
    ).get()) {
      await interaction.reply({ content: `You've already solved this question.`, ephemeral: true });
    }
    else {
      actionRow = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId("confirm-solve-button")
            .setLabel("Show me!")
            .setStyle(ButtonStyle.Primary)
        );
      response = `You won't be able to submit any more answers to ${qId}.\nAre you sure you want to see the solution?\n`;
      const confirm = await interaction.reply({ content: response, components: [actionRow], ephemeral: true });

      const filter = (buttonClick) => buttonClick.customId === "confirm-solve-button";
      confirm.awaitMessageComponent({ filter, componentType: ComponentType.Button, time: 10000 })
        .then(async buttonClick => {
          try {
            const discussion = interaction.guild.channels.cache.get(discussionChannels[qId]);
            discussion.permissionOverwrites.edit(user, { ViewChannel: true });

            db.prepare(
              `INSERT INTO ${soName}
                            (${soCols[0]}, ${soCols[1]}, ${soCols[2]})
                            VALUES ('${user.user.username}', ${user.user.discriminator}, '${qId}')`
            ).run();

            let answer = db.prepare(
              `SELECT ${akCols[1]} FROM ${akName}
                            WHERE ${akCols[0]} = '${qId}'`
            ).get();

            actionRow.components[0].setDisabled(true);
            interaction.editReply({ content: response, components: [actionRow], ephemeral: true });
            await buttonClick.reply({ content: `The answer to ${qId} is...**${answer[akCols[1]]}**!\nSee how others solved it in the discussion channel.`, ephemeral: true });
          }
          catch (error) {
            console.log(error);
            interaction.editReply({ content: `${error.name} occurred while showing solution; go yell at Mia.`, components: [], ephemeral: true });
          }
        })
        .catch(async error => {
          interaction.editReply({ content: `Request timed out.`, components: [], ephemeral: true });
        }
        );
    }
  }
}