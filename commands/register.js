const { SlashCommandBuilder } = require('discord.js');
const pName = process.env['participantTableName'];
const pCols = [process.env['participantTableCols0'], process.env['participantTableCols1'], process.env['participantTableCols2'],
process.env['participantTableCols3'], process.env['participantTableCols4'], process.env['participantTableCols5']]
const { roleInfo } = require('../role');

const SQLITE = require('better-sqlite3');
const db = new SQLITE('./db/data.db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('register')
    .setDescription('Includes your submissions in the leaderboard!'),
  async execute(interaction) {
    const newUser = interaction.member;
    const un = newUser.user.username;
    const disc = newUser.user.discriminator;

    //toggle for maintenance check
    // if (newUser.id != "528053306665336872") {
    //   await interaction.reply({ content: "**I'm almost ready!**\nRegistration opens on September 30th.", ephemeral: true });
    // }
    if (!newUser.roles.cache.some(role => role.name === roleInfo.name)) {
      try {
        if (!db.prepare(
          `SELECT * FROM ${pName}
                    WHERE ${pCols[0]} = '${un}'
                    AND ${pCols[1]} = ${disc}`
        ).get()) {
          db.prepare(
            `INSERT INTO ${pName} (${pCols[0]}, ${pCols[1]}) VALUES (\'${un}\', \'${disc}\')`
          ).run();
        }
        else {
          db.prepare(
            `UPDATE ${pName}
                        SET ${pCols[5]} = 1
                        WHERE ${pCols[0]} = '${un}'
                        AND ${pCols[1]} = ${disc}`
          ).run();
        }

        newRole = interaction.guild.roles.cache.find(role => role.name === roleInfo.name);
        if (!newRole) {
          newRole = interaction.guild.roles.create(roleInfo);
        }

        interaction.member.roles.add(newRole, `${un}#${disc} used /register command`);
        await interaction.reply({ content: `Registered ${un}#${disc} for the contest.\nHappy coding :dancer:`, ephemeral: true });
      }
      catch (error) {
        await interaction.reply({ content: `${error.name} while registering; go yell at Mia.`, ephemeral: true });
      }
    }
    else {
      await interaction.reply({ content: `You've already registered for the contest!`, ephemeral: true });
    }
  },
}