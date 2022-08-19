const { SlashCommandBuilder } = require('discord.js');
const { answerkeyTable, submissionsTable, participantTable } = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Locks in your submissions for a question, letting you view its discussion channel')
        .addStringOption(option => option.setName('question').setDescription('Enter the question').setRequired(true)),
    async execute(interaction)
    {
        await interaction.reply("lock received");
    }
}