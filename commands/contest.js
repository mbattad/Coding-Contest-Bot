const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { reportChannel } = require('../config');

module.exports =
{
    data: new SlashCommandBuilder()
        .setName('contest')
        .setDescription('Get an overview of contest bot commands'),
    async execute(interaction)
    {
        const thumbnails = [
            'https://cdn.discordapp.com/emojis/901999702596259892.webp?size=32&quality=lossless',
            'https://cdn.discordapp.com/emojis/974340642983530496.webp?size=32&quality=lossless',
            'https://cdn.discordapp.com/emojis/827184703589187654.webp?size=32&quality=lossless',
            'https://cdn.discordapp.com/emojis/827182878483152906.webp?size=32&quality=lossless',
            'https://cdn.discordapp.com/emojis/825509085168402482.webp?size=32&quality=lossless',
            'https://cdn.discordapp.com/emojis/825491761873944657.webp?size=32&quality=lossless',
            'https://cdn.discordapp.com/emojis/825482785867169792.webp?size=32&quality=lossless',
            'https://cdn.discordapp.com/emojis/760617252125933578.webp?size=32&quality=lossless',
            'https://cdn.discordapp.com/emojis/805536502145875999.webp?size=32&quality=lossless',
            'https://cdn.discordapp.com/emojis/825498044211658752.webp?size=32&quality=lossless'];

        const help = new EmbedBuilder()
            .setColor('LuminousVividPink')
            .setTitle("Welcome to the Fall 2022 Countdown Contest!")
            .setDescription("*What can I do, anyway?*")
            .setThumbnail(thumbnails[Math.floor(Math.random()*thumbnails.length)])
            .addFields(
                {name: "/register", value: "Gives you the contest role and lets you submit answers", inline: true},
                {name: "/deregister", value: "Removes your contest role, but doesn't erase your progress", inline: true},
                {name: "\u200B", value: "\u200B"},
                {name: "/submit [question] [answer]", value: "Submits an answer to a question; if correct, lets you view its discussion channel", inline: true},
                {name: "/solve [question]", value: "Reveals the solution to a question and lets you view its discussion channel", inline: true},
                {name: "\u200B", value: "\u200B"},
                {name: "/leaderboard points", value: "Display the participants with the 10 highest scores", inline: true},
                {name: "/leaderboard speed", value: "Display the participants with the 10 fastest completion times", inline: true},
                {name: "\u200B", value: "\u200B"},
                {name: "Got an error?", value: `Let us know in <#${reportChannel}>!`}
            )
            .setFooter({text: "made with love by Mia", iconURL: "https://cdn.discordapp.com/avatars/528053306665336872/45d65cd6edb2465f9597d34d57b2aadf.webp?size=80"});

        await interaction.reply({embeds: [help], ephemeral: true});
    }
}