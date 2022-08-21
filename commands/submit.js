const { SlashCommandBuilder } = require('discord.js');
const { solvedTable, answerkeyTable, questionChannels } = require('../config');
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
                    // const correct = db.prepare(
                    //     `SELECT ${answerkeyTable.cols[1]} FROM ${answerkeyTable.name}
                    //     WHERE ${answerkeyTable.cols[0]} = ${question}`
                    // ).get();

                    //PLACEHOLDER WHILE WE WAIT FOR QUESTIONS
                    correct = solution;
                    //END PLACEHOLDER

                    if(correct == solution)
                    {
                        db.prepare(
                            `INSERT INTO ${solvedTable.name}
                            (${solvedTable.cols[0]}, ${solvedTable.cols[1]}, ${solvedTable.cols[2]})
                            VALUES ('${submitter.user.username}', ${submitter.user.discriminator}, '${question}')`
                        ).run();

                        now = new Date(Date.now());
                        timestamp = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} at ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

                        //TODO calculate scoring based on time & difficulty

                        //TODO grant user access to discussion channel
                        interaction.guild.channels.fetch(questionChannels[question])
                        .then(channel => channel.permissionOverwrites.create(submitter, ['SEND_MESSAGES']))
                        .catch(await interaction.reply(`${error} occurred while managing permissions.`));
                        
                        await interaction.reply(`Correct answer!\nReceived at ${timestamp}`);
                    }
                    else
                    {
                        await interaction.reply(`Incorrect answer. Try again!`);
                    }
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