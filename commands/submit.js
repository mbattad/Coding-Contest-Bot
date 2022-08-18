const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
	    .setName('submit')
	    .setDescription('Submits a response to a problem')
        .addStringOption(option => option.setName('question').setDescription('Enter the question you are solving').setRequired(true))
        .addIntegerOption(option => option.setName('solution').setDescription('Enter your solution').setRequired(true)),
    async execute(interaction) {
        const question = interaction.options.getString('question');
        const solution = interaction.options.getInteger('solution');

        //TODO db support
        await interaction.reply(`Submitted answer to ${question.toLowerCase()}: ${solution}`);
    },
}