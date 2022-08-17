const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
	    .setName('deregister')
	    .setDescription('Removes you from the contest'),
    async execute(interaction) {
        await interaction.reply("Deregister received");
    },
}