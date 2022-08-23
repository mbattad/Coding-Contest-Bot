const { SlashCommandBuilder } = require('discord.js');
const { participantTable } = require('../config');

const SQLITE = require('better-sqlite3');
const db = new SQLITE('./db/data.db');

module.exports =
{
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Shows the top participants of the contest'),
    async execute(interaction)
    {
        try
        {
            const scores = db.prepare(
                `SELECT * FROM ${participantTable.name}
                WHERE ${participantTable.cols[3] = 1}
                ORDER BY ${participantTable.cols[2]} DESC`
            ).all();
            if(scores)
            {
                msg = '**Leaderboard**:';
                counter = 1;
                for(user of scores)
                {
                    msg += `\n${counter}. ${user[participantTable.cols[0]]}: ${user[participantTable.cols[2]]} points`;
                    counter ++;
                }
    
                await interaction.reply(msg);
            }
            else
            {
                await interaction.reply({content: `No records found.`, ephemeral: true});
            }
        }
        catch(error)
        {
            console.log(error);
            await interaction.reply({content: `${error.name} while showing leaderboard; go yell at Mia.`, ephemeral: true});
        }
    }
}