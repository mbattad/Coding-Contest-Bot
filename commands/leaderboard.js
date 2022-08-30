const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const pName = process.env['participantTableName'];
const pCols = [process.env['participantTableCols0'], process.env['participantTableCols1'], process.env['participantTableCols2'],
process.env['participantTableCols3'], process.env['participantTableCols4'], process.env['participantTableCols5']];

const soName = process.env['solvedTableName'];
const soCols = [process.env['solvedTableCols0'], process.env['solvedTableCols1'], process.env['solvedTableCols2'], process.env['solvedTableCols3']];

const akName = process.env['answerkeyTableName'];
const akCols = [process.env['answerkeyTableCols0'], process.env['answerkeyTableCols1'], process.env['answerkeyTableCols2'], process.env['answerkeyTableCols3']];

const SQLITE = require('better-sqlite3');
const db = new SQLITE('./db/data.db');

module.exports =
{
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Shows the top participants of the contest')
    .addSubcommand(command => command
      .setName('points')
      .setDescription('Get results by number of points')
      .addIntegerOption(option => option
        .setName('level')
        .setDescription('Enter the difficulty level to show results for (leave blank to view by total score)')
        .addChoices(
          { name: "level 1", value: 2 },
          { name: "level 2", value: 3 },
          { name: "level 3", value: 4 }
        ))
    )
    .addSubcommand(command => command
      .setName('speed')
      .setDescription('Get results by completion time')
      .addStringOption(option => option.setName('question').setDescription('Enter the question to show results for (leave blank to view by average time)'))
    ),
  async execute(interaction) {
    const thumbnails = [
      'https://cdn.discordapp.com/emojis/901999702596259892.webp?size=32&quality=lossless',
      'https://cdn.discordapp.com/emojis/974340642983530496.webp?size=32&quality=lossless',
      'https://cdn.discordapp.com/emojis/827184703589187654.webp?size=32&quality=lossless',
      'https://cdn.discordapp.com/emojis/827182878483152906.webp?size=32&quality=lossless',
      'https://cdn.discordapp.com/emojis/825509085168402482.webp?size=32&quality=lossless',
      'https://cdn.discordapp.com/emojis/825491761873944657.webp?size=32&quality=lossless',
      'https://cdn.discordapp.com/emojis/825482785867169792.webp?size=32&quality=lossless',
      'https://cdn.discordapp.com/emojis/760617252125933578.webp?size=32&quality=lossless',
      'https://cdn.discordapp.com/emojis/805536502145875999.webp?size=32&quality=lossless',
      'https://cdn.discordapp.com/emojis/825498044211658752.webp?size=32&quality=lossless'];

    try {
      const group = interaction.options.getSubcommand();
      let tableCols, statement, desc, unit;
      if (group === 'points') {
        desc = "Most problems solved";
        const lvl = interaction.options.getInteger('level');
        let sum = `${pCols[2]} + ${pCols[3]} + ${pCols[4]}`;
        if (lvl) {
          sum = `${pCols[lvl]}`
          desc += ` (level ${lvl - 1})`;
        }

        tableCols = pCols;
        statement =
          `SELECT *, SUM(${sum}) AS score FROM ${pName}
            WHERE ${pCols[5]} = 1
                    GROUP BY ${pCols[0]}, ${pCols[1]}
                    ORDER BY score DESC`;

        unit = ` solved`;
      }
      else if (group === 'speed') {
        desc = "Fastest completion times";
        const qId = interaction.options.getString('question');
        let condition = ``;
        if (qId) {
          condition = `AND ${soName}.${soCols[2]} = '${qId}'`;
          desc += ` (${qId})`;
        }

        tableCols = soCols;
        statement =
          `SELECT *, AVG(${soCols[3]} - ${akCols[2]}) / 3600000 AS score
                    FROM ${soName} JOIN ${akName}
                    ON ${soName}.${soCols[2]} = ${akName}.${akCols[0]}
                    JOIN ${pName} ON (${soName}.${soCols[0]}, ${soName}.${soCols[1]}) = (${pName}.${pCols[0]},${pName}.${pCols[1]})
                    WHERE ${soCols[3]}
                    AND ${pCols[5]} = 1
                    ${condition}
                    GROUP BY ${soCols[0]}, ${soCols[1]}
                    ORDER BY score ASC`;

        unit = ` hours`;
      }

      const scores = db.prepare(statement).all();
      if (scores.length > 0) {
        const leaderboard = new EmbedBuilder()
          .setColor('LuminousVividPink')
          .setTitle(`Leaderboard: ${desc}`)
          .setThumbnail(thumbnails[Math.floor(Math.random() * thumbnails.length)]);

        for (let i = 0; i < Math.min(10, scores.length); i++) {
          leaderboard.addFields({ name: `${i + 1}. ${scores[i][tableCols[0]]}#${scores[i][tableCols[1]]}`, value: `${scores[i]['score']}${unit}` });
        }

        await interaction.reply({ embeds: [leaderboard] });
      }
      else {
        await interaction.reply({ content: `No records found.\nDid you use valid arguments?`, ephemeral: true });
      }
    }
    catch (error) {
      console.log(error);
      await interaction.reply({ content: `${error.name} while showing leaderboard; go yell at Mia.`, ephemeral: true });
    }
  }
}