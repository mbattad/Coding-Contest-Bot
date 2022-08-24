const { SlashCommandBuilder } = require('discord.js');
const { participantTable } = require('../config');
const { roleInfo } = require('../role');

const SQLITE = require('better-sqlite3');
const db = new SQLITE('./db/data.db');

module.exports = {
    data: new SlashCommandBuilder()
	    .setName('register')
	    .setDescription('Includes your submissions in the leaderboard!'),
    async execute(interaction)
    {
        const newUser = interaction.member;
        const un = newUser.user.username;
        const disc = newUser.user.discriminator;

        if(!newUser.roles.cache.some(role => role.name === roleInfo.name))
        {
            try
            {
                if(!db.prepare(
                    `SELECT * FROM ${participantTable.name}
                    WHERE ${participantTable.cols[0]} = '${un}'
                    AND ${participantTable.cols[1]} = ${disc}`
                ).get())
                {
                    db.prepare(
                        `INSERT INTO ${participantTable.name} (${participantTable.cols[0]}, ${participantTable.cols[1]}) VALUES (\'${un}\', \'${disc}\')`
                    ).run();
                }
                else
                {
                    db.prepare(
                        `UPDATE ${participantTable.name}
                        SET ${participantTable.cols[5]} = 1
                        WHERE ${participantTable.cols[0]} = '${un}'
                        AND ${participantTable.cols[1]} = ${disc}`
                    ).run();
                }
                
                newRole = interaction.guild.roles.cache.find(role => role.name === roleInfo.name);
                if(!newRole)
                {
                    newRole = interaction.guild.roles.create(roleInfo);
                }

                interaction.member.roles.add(newRole, `${un}#${disc} used /register command`);
                await interaction.reply({content: `Registered ${un}#${disc} for the contest.\nHappy coding :dancer:`, ephemeral: true});
            }
            catch(error)
            {
                await interaction.reply({content: `${error.name} while registering; go yell at Mia.`, ephemeral: true});
            }
        }
        else
        {
            await interaction.reply({content: `You've already registered for the contest!`, ephemeral: true});
        }
    },
}