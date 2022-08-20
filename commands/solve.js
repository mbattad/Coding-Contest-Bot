const { SlashCommandBuilder } = require('discord.js');
const { submissionsTable } = require('../config');
const { roleInfo } = require('../role');

const SQLITE = require('better-sqlite3');
const db = new SQLITE('./db/data.db');

module.exports =
{
    data: new SlashCommandBuilder()
        .setName('solve')
        .setDescription('Reveals the answer to a question (no more submissions to this question will be accepted from you)')
        .addStringOption(option => option.setName('question').setDescription('Enter the question you want the solution to').setRequired(true)),
    async execute(interaction)
    {
        //TODO add confirmation check
        const user = interaction.member;
        const qId = interaction.options.getString('question');

        await interaction.reply(`Received request to solve ${qId} from ${user.user.username}#${user.user.discriminator}`);
    }
}