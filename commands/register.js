const { SlashCommandBuilder } = require('discord.js');

const SQLITE = require('better-sqlite3');
const db = new SQLITE('./db/data.db');

module.exports = {
    data: new SlashCommandBuilder()
	    .setName('register')
	    .setDescription('Includes your submissions in the leaderboard!'),
    async execute(interaction) {
        const newUser = interaction.member.user;

        try
        {
            db.prepare(`INSERT INTO Participants (username, discriminator) VALUES (\'${newUser.username}\', \'${newUser.discriminator}\')`).run();
            await interaction.reply({content: `Register received from ${newUser.username}#${newUser.discriminator}`, ephemeral: true});
        }
        catch(error)
        {
            if(error.code == "SQLITE_CONSTRAINT_PRIMARYKEY")
            {
                await interaction.reply({content: "You've already registered for the contest!", ephemeral: true});
            }
            else
            {
                await interaction.reply({content: `Error registering; go yell at Mia.\n(${error})`, ephemeral: true});
            }
        }
    },
}