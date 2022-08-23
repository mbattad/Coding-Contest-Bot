const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { solvedTable, questionChannels } = require('../config');

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
                        db.prepare(
                            `INSERT INTO ${solvedTable.name}
                            (${solvedTable.cols[0]}, ${solvedTable.cols[1]}, ${solvedTable.cols[2]})
                            VALUES ('${user.user.username}', ${user.user.discriminator}, '${qId}')`
                        ).run();

                        const discussion = interaction.guild.channels.cache.get(questionChannels[qId]);
                        discussion.permissionOverwrites.edit(user, { ViewChannel: true });

                        //TODO replace interaction text with actual answer
                        actionRow.components[0].setDisabled(true);
                        interaction.editReply({content: response, components: [actionRow], ephemeral: true});
                        await buttonClick.reply({content: `The answer to ${qId} is...who knows?\nenjoy the discussion channel tho`, ephemeral: true});
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