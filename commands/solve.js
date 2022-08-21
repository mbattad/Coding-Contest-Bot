const { SlashCommandBuilder } = require('discord.js');
const { solvedTable, questionChannels } = require('../config');
const { roleInfo } = require('../role');

const SQLITE = require('better-sqlite3');
const db = new SQLITE('./db/data.db');

module.exports =
{
    data: new SlashCommandBuilder()
        .setName('solve')
        .setDescription('Reveals the answer to a question (you will not be able to attempt this question anymore)')
        .addStringOption(option => option.setName('question').setDescription('Enter the question you want the solution to').setRequired(true)),
    async execute(interaction)
    {
        //TODO add confirmation check
        const user = interaction.member;
        const qId = interaction.options.getString('question');

        if(db.prepare(
            `SELECT * FROM ${solvedTable.name}
            WHERE ${solvedTable.cols[0]} = '${user.user.username}'
            AND ${solvedTable.cols[1]} = ${user.user.discriminator}
            AND ${solvedTable.cols[2]} = '${qId}'`
        ).get())
        {
            await interaction.reply(`You've already solved this question.`);
        }
        else
        {
            try
            {
                db.prepare(
                    `INSERT INTO ${solvedTable.name}
                    (${solvedTable.cols[0]}, ${solvedTable.cols[1]}, ${solvedTable.cols[2]})
                    VALUES ('${user.user.username}', ${user.user.discriminator}, '${qId}')`
                ).run();

                const discussion = interaction.guild.channels.cache.get(questionChannels[qId]);
                discussion.permissionOverwrites.edit(user, { ViewChannel: true });

                await interaction.reply({content: `Received request to solve ${qId} from ${user.user.username}#${user.user.discriminator}`, ephemeral: true});
            }
            catch(error)
            {
                console.log(error);
                await interaction.reply({content: `${error.name} occurred while solving; go yell at Mia.`, ephemeral: true});
            }
        }
    }
}