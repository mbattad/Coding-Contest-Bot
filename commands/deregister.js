const { SlashCommandBuilder } = require('discord.js');
const { participantTable } = require('../config');
const { roleInfo } = require('../role');

const SQLITE = require('better-sqlite3');
const db = new SQLITE('./db/data.db');

module.exports = {
    data: new SlashCommandBuilder()
	    .setName('deregister')
	    .setDescription('Removes you from the contest'),
    async execute(interaction)
    {
        const user = interaction.member;
        const un = user.user.username;
        const disc = user.user.discriminator;
        compRole = user.roles.cache.find(role => role.name === roleInfo.name);

        if(compRole)
        {
            try
            {
                db.prepare(
                    `UPDATE ${participantTable.name}
                    SET ${participantTable.cols[3]} = 0
                    WHERE ${participantTable.cols[0]} = '${un}'
                    AND ${participantTable.cols[1]} = ${disc}`
                ).run();
                
                user.roles.remove(compRole, `${un}#${disc} used /deregister command`);
                await interaction.reply({content: `Deregistered ${un}#${disc} from the contest.\nSorry to see you go :heart:`, ephemeral: true});
            }
            catch(error)
            {
                console.log(error);
                await interaction.reply({content: `${error.name} occured while deregistering; go yell at Mia.`, ephemeral: true});
            }
        }
        else
        {
            await interaction.reply({content: `You aren't registered for the contest.`, ephemeral: true});
        }
    },
}