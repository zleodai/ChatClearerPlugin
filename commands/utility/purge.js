const { SlashCommandBuilder } = require('discord.js');
const { purgeText } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Purges')
        .addIntegerOption((option) => option.setName('depth').setDescription('How much messages should I check to purge (rounded to nearest hundred)').setRequired(true)),

	async execute(interaction) {
		await interaction.reply({ content: "Purging ...", ephemeral: true});

        const depth = interaction.options.getInteger('depth');

        const channels = await interaction.member.guild.channels;
        const channel = await channels.fetch(interaction.channelId);
        let messages = await channel.messages.fetch({limit: 100});

        let lastMsg = null;
        let purgeCount = 0;
        for (let i = 0; i < Math.floor(depth/100) +1; i++) {
            messages.forEach(async msg => {
                const text = msg.content;

                let badText = false;
                purgeText.forEach(badString => {
                    badText = badText || text.includes(badString)
                })

                if (badText) {
                    console.log(`Purging ${msg.author.tag}: ${msg.content}`);
                    
                    try {
                        await msg.delete();
                        purgeCount++;
                    } catch (error) {
                        console.log(error)
                    }
                }

                lastMsg = msg;
            });

            messages = await channel.messages.fetch({before: lastMsg.id, limit: 100})
        }

        console.log(`Purged ${purgeCount} messages`);
	},
};