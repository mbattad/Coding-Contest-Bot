const { SlashCommandBuilder } = require('discord.js');
const { roleInfo } = require('../role');

module.exports = {
    data: new SlashCommandBuilder()
	    .setName('submit')
	    .setDescription('Submits a response to a problem')
        .addStringOption(option => option.setName('question').setDescription('Enter the question you are solving').setRequired(true))
        .addIntegerOption(option => option.setName('solution').setDescription('Enter your solution').setRequired(true)),
    async execute(interaction) {
        const submitter = interaction.member;
        const question = interaction.options.getString('question');
        const solution = interaction.options.getInteger('solution');

        //TODO db support
        if(submitter.roles.cache.some(role => role.name === roleInfo.name))
        {
            receipt = `**Submitter:** ${submitter.user.username}#${submitter.user.discriminator}\n**Question:** ${question}\n**Solution:** ${solution}`;
            now = new Date(Date.now());
            timestamp = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} at ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
            await interaction.reply(`Submission received!\n${receipt}\n${timestamp}`);
        }
        else
        {
            await interaction.reply(`You have to register before you can submit solutions!`);
        }
    },
}