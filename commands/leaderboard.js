const { SlashCommandBuilder } = require('discord.js');
const { participantTable, solvedTable } = require('../config');

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
                .setDescription('Enter the difficulty level to show results for')
                .setRequired(true)
                .addChoices(
                    {name: "all", value: 0},
                    {name: "level 1", value: 1},
                    {name: "level 2", value: 2},
                    {name: "level 3", value: 3}
                ))
            )
        .addSubcommand(command => command
            .setName('speed')
            .setDescription('Get results by completion time')
            .addStringOption(option => option.setName('question').setDescription('Enter the question to show results for (leave blank to view by average time)'))
        ),
    async execute(interaction)
    {
        try
        {
            const group = interaction.options.getSubcommand();
            let table, statement, unit;
            if(group === 'points')
            {
                table = participantTable;
                statement =
                    `SELECT *, SUM(${participantTable.cols[2]} + ${participantTable.cols[3]} + ${participantTable.cols[4]}) AS score FROM ${participantTable.name}
                    GROUP BY ${participantTable.cols[0]}, ${participantTable.cols[1]}
                    ORDER BY score DESC`;
                unit = `points`;
            }
            else if(group === 'speed')
            {
                table = solvedTable;
                statement = 
                    `SELECT *, AVG(${solvedTable.cols[3]}) AS score FROM ${solvedTable.name}
                    WHERE ${solvedTable.cols[3]}
                    GROUP BY ${solvedTable.cols[0]}, ${solvedTable.cols[1]}
                    ORDER BY score DESC`;

                unit = `ms`;
            }

            const scores = db.prepare(statement).all();
            if(scores)
            {
                //TODO fix leaderboard formatting
                msg = "**Leaderboard**";
                for(var i = 0; i < Math.min(5, scores.length); i++)
                {
                    msg += `\n${i+1}. **${scores[i][table.cols[0]]}**: ${scores[i]['score']} ${unit}`;
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