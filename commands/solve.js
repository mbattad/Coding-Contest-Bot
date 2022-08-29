const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { answerkeyTable, solvedTable, discussionChannels } = require('../config');

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
        const user = interaction.member;
        const qId = interaction.options.getString('question');

        if(!(qId in discussionChannels))
        {
            await interaction.reply({content: `Couldn't find the question ${qId}; did you use a valid argument?`, ephemeral: true});
        }
        else if(db.prepare(
            `SELECT * FROM ${answerkeyTable.name}
            WHERE ${answerkeyTable.cols[0]} = '${qId}'`
        ).get()[answerkeyTable.cols[2]] > Date.now())
        {
            await interaction.reply({content: `This question hasn't been posted yet.`, ephemeral: true});
        }
        else if(db.prepare(
            `SELECT * FROM ${solvedTable.name}
            WHERE ${solvedTable.cols[0]} = '${user.user.username}'
            AND ${solvedTable.cols[1]} = ${user.user.discriminator}
            AND ${solvedTable.cols[2]} = '${qId}'`
        ).get())
        {
            await interaction.reply({content: `You've already solved this question.`, ephemeral: true});
        }
        else
        {
            actionRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("confirm-solve-button")
                        .setLabel("Show me!")
                        .setStyle(ButtonStyle.Primary)
                );
            response = `You won't be able to submit any more answers to ${qId}.\nAre you sure you want to see the solution?\n`;
            const confirm = await interaction.reply({content: response, components: [actionRow], ephemeral: true});

            const filter = (buttonClick) => buttonClick.customId === "confirm-solve-button";
            confirm.awaitMessageComponent({ filter, componentType: ComponentType.Button, time: 10000 })
                .then(async buttonClick => {
                    try
                    {
                        const discussion = interaction.guild.channels.cache.get(discussionChannels[qId]);
                        discussion.permissionOverwrites.edit(user, { ViewChannel: true });

                        db.prepare(
                            `INSERT INTO ${solvedTable.name}
                            (${solvedTable.cols[0]}, ${solvedTable.cols[1]}, ${solvedTable.cols[2]})
                            VALUES ('${user.user.username}', ${user.user.discriminator}, '${qId}')`
                        ).run();

                        let answer = db.prepare(
                            `SELECT ${answerkeyTable.cols[1]} FROM ${answerkeyTable.name}
                            WHERE ${answerkeyTable.cols[0]} = '${qId}'`
                        ).get();

                        actionRow.components[0].setDisabled(true);
                        interaction.editReply({content: response, components: [actionRow], ephemeral: true});
                        await buttonClick.reply({content: `The answer to ${qId} is...**${answer[answerkeyTable.cols[1]]}**!\nSee how others solved it in the discussion channel.`, ephemeral: true});
                    }
                    catch(error)
                    {
                        console.log(error);
                        interaction.editReply({content: `${error.name} occurred while showing solution; go yell at Mia.`, components: [], ephemeral: true});
                    }
                })
                .catch(async error => {
                    interaction.editReply({content: `Request timed out.`, components: [], ephemeral: true});
                }
            );
        }
    }
}