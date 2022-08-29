const { SlashCommandBuilder } = require('discord.js');
const { solvedTable, submissionsTable, participantTable, answerkeyTable, discussionChannels } = require('../config');
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

        if(!submitter.roles.cache.some(role => role.name === roleInfo.name))
        {
            await interaction.reply({content: `You have to register before you can submit solutions!`, ephemeral: true});
        }
        else if(!(question in discussionChannels))
        {
            await interaction.reply({content: `Couldn't find the question ${question}; did you use a valid argument?`, ephemeral: true});
        }
        else if(db.prepare(
            `SELECT * FROM ${answerkeyTable.name}
            WHERE ${answerkeyTable.cols[0]} = '${question}'`
        ).get()[answerkeyTable.cols[2]] > Date.now())
        {
            await interaction.reply({content: `This question hasn't been posted yet.`, ephemeral: true});
        }
        else
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
                    await interaction.reply({content: `You can't submit answers to this question anymore.`, ephemeral: true});
                }
                else
                {
                    const answer = db.prepare(
                        `SELECT * FROM ${answerkeyTable.name}
                        WHERE ${answerkeyTable.cols[0]} = '${question}'`
                    ).get();

                    if(answer[answerkeyTable.cols[1]] == solution)
                    {
                        now = new Date(Date.now());
                        timestamp = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} at ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

                        db.prepare(
                            `INSERT INTO ${solvedTable.name}
                            (${solvedTable.cols[0]}, ${solvedTable.cols[1]}, ${solvedTable.cols[2]}, ${solvedTable.cols[3]})
                            VALUES ('${submitter.user.username}', ${submitter.user.discriminator}, '${question}', ${now.getTime()})`
                        ).run();

                        db.prepare(
                            `UPDATE ${participantTable.name}
                            SET ${participantTable.cols[1 + answer[answerkeyTable.cols[3]]]} = ${participantTable.cols[1 + answer[answerkeyTable.cols[3]]]} + 1
                            WHERE ${participantTable.cols[0]} = '${submitter.user.username}'
                            AND ${participantTable.cols[1]} = ${submitter.user.discriminator}`
                        ).run();

                        const discussion = interaction.guild.channels.cache.get(discussionChannels[question]);
                        discussion.permissionOverwrites.edit(submitter, { ViewChannel: true });
                        
                        await interaction.reply({content: `Correct answer!\nReceived at ${timestamp}`, ephemeral: true});
                    }
                    else
                    {
                        db.prepare(
                            `INSERT INTO ${submissionsTable.name}
                            (${submissionsTable.cols[0]}, ${submissionsTable.cols[1]}, ${submissionsTable.cols[2]})
                            VALUES ('${submitter.user.username}', ${submitter.user.discriminator}, '${question}')`
                        ).run();

                        await interaction.reply({content: `Incorrect answer. Try again!`, ephemeral: true});
                    }
                }
            }
            catch(error)
            {
                console.log(error);
                if(error instanceof SQLITE.SqliteError)
                {
                    await interaction.reply({content: `SQLite error: ${error.code}`, ephemeral: true});
                }
                else
                {
                    await interaction.reply({content: `${error.name} while submitting; go yell at Mia.`, ephemeral: true});
                }
            }
        }
    },
}