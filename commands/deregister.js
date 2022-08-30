const { SlashCommandBuilder } = require('discord.js');
const pName = process.env['participantTableName']
const pCols = [process.env['participantTableCols0'], process.env['participantTableCols1'], process.env['participantTableCols2'],
process.env['participantTableCols3'], process.env['participantTableCols4'], process.env['participantTableCols5']]
const { roleInfo } = require('../role');

const SQLITE = require('better-sqlite3');
const db = new SQLITE('./db/data.db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deregister')
    .setDescription('Removes you from the contest'),
  async execute(interaction) {
    const user = interaction.member;
    const un = user.user.username;
    const disc = user.user.discriminator;
    compRole = user.roles.cache.find(role => role.name === roleInfo.name);

    if (compRole) {
      try {
        db.prepare(
          `UPDATE ${pName}
                    SET ${pCols[5]} = 0
                    WHERE ${pCols[0]} = '${un}'
                    AND ${pCols[1]} = ${disc}`
        ).run();

        user.roles.remove(compRole, `${un}#${disc} used /deregister command`);
        await interaction.reply({ content: `Deregistered ${un}#${disc} from the contest.\nSorry to see you go :heart:`, ephemeral: true });
      }
      catch (error) {
        console.log(error);
        await interaction.reply({ content: `${error.name} occured while deregistering; go yell at Mia.`, ephemeral: true });
      }
    }
    else {
      await interaction.reply({ content: `You aren't registered for the contest.`, ephemeral: true });
    }
  },
}