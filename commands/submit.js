const { SlashCommandBuilder } = require('discord.js');
const { solvedTable } = require('../config');
const { roleInfo } = require('../role');

const SQLITE = require('better-sqlite3');
const db = new SQLITE('./db/data.db');

module.exports = {
    data: new SlashCommandBuilder()
	    .setName('submit')
	    .setDescription('Submits a solution to a problem')
        .addStringOption(option => option.setName('question').setDescription('Enter the question you are solving').setRequired(true))
        .addIntegerOption(option => option.setName('solution').setDescription('Enter your solution').setRequired(true)),
    async execute(interaction) {
        const submitter = interaction.member;
        const question = interaction.options.getString('question');
        const solution = interaction.options.getInteger('solution');

        if(submitter.roles.cache.some(role => role.name === roleInfo.name))
        {
            try
            {
                if(db.prepare(
                    `SELECT * FROM ${solvedTable.name}
                    WHERE ${solvedTable.cols[0]} = '${submitter.user.username}'
                    AND ${solvedTable.cols[1]} = ${submitter.user.discriminator}
                    AND ${solvedTable.cols[2]} = '${question}'`
                ).get())
                {
                    await interaction.reply(`You can't submit answers to this question anymore.`);
                }
                else
                {
                    now = new Date(Date.now());
    
                    db.prepare(
                        `INSERT INTO ${solvedTable.name}
                        (${solvedTable.cols[0]}, ${solvedTable.cols[1]}, ${solvedTable.cols[2]})
                        VALUES ('${submitter.user.username}', ${submitter.user.discriminator}, '${question}')`
                    ).run();
    
                    receipt = `**Submitter:** ${submitter.user.username}#${submitter.user.discriminator}\n**Question:** ${question}\n**Solution:** ${solution}`;
                    timestamp = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} at ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
                    await interaction.reply(`Submission received!\n${receipt}\n${timestamp}`);
                }
            }
            catch(error)
            {
                console.log(error);
                if(error instanceof SQLITE.SqliteError)
                {
                    await interaction.reply(`SQLite error: ${error.code}`);
                }
                else
                {
                    await interaction.reply(`${error.name} while submitting; go yell at Mia.`);
                }
            }
        }
        else
        {
            await interaction.reply(`You have to register before you can submit solutions!`);
        }
    },
}