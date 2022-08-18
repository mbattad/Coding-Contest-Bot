const { SlashCommandBuilder } = require('discord.js');
const { participantTable } = require('../config');

const SQLITE = require('better-sqlite3');
const db = new SQLITE('./db/data.db');

module.exports = {
    data: new SlashCommandBuilder()
	    .setName('deregister')
	    .setDescription('Removes you from the contest'),
    async execute(interaction)
    {
        const user = interaction.member.user;
        const un = user.username;
        const disc = user.discriminator;

        try
        {
            info = db.prepare(
                `DELETE FROM ${participantTable.name} 
                WHERE (${participantTable.cols[0]}, ${participantTable.cols[1]}) = (\'${un}\', \'${disc}\')`
            ).run();

            // TODO add confirmation check
            if(info.changes > 0)
            {
                await interaction.reply({content: `Deregistered ${un}#${disc} from the contest.\nSorry to see you go :heart:`, ephemeral: true});
            }
            else
            {
                await interaction.reply({content: `You aren't registered for the contest.`, ephemeral: true});
            }
        }
        catch(error)
        {
            console.log(error);
            await interaction.reply({content: `${error.name} while deregistering; go yell at Mia.`, ephemeral: true});
        }
    },
}