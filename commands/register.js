const { SlashCommandBuilder } = require('discord.js');
const { participantTable } = require('../config');

const SQLITE = require('better-sqlite3');
const db = new SQLITE('./db/data.db');

module.exports = {
    data: new SlashCommandBuilder()
	    .setName('register')
	    .setDescription('Includes your submissions in the leaderboard!'),
    async execute(interaction)
    {
        const newUser = interaction.member.user;
        const un = newUser.username;
        const disc = newUser.discriminator;

        try
        {
            db.prepare(
                `INSERT INTO ${participantTable.name} (${participantTable.cols[0]}, ${participantTable.cols[1]}) VALUES (\'${un}\', \'${disc}\')`
            ).run();

            await interaction.reply({content: `Registered ${un}#${disc} for the contest.\nHappy coding :dancer:`, ephemeral: true});
        }
        catch(error)
        {
            if(error instanceof SQLITE.SqliteError)
            {
                if(error.code == "SQLITE_CONSTRAINT_PRIMARYKEY")
                {
                    await interaction.reply({content: `You've already registered for the contest!`, ephemeral: true});
                }
            }
            else
            {
                await interaction.reply({content: `${error.name} while registering; go yell at Mia.`, ephemeral: true});
            }
        }
    },
}