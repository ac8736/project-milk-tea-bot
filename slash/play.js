const{ SlashCommandBuilder } = require("@discordjs/builders")
const{ EmbedBuilder } = require("discord.js")
const { QueryType } = require("discord-player")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Loads music from Youtube")
        .addSubcommand((subcommand)=>
            subcommand
            .setName("song")
            .setDescription("Loads song from Url")
            .addStringOption((option) => option.setName("url").setDescription("song url").setRequired(true))
        )
        .addSubcommand((subcommand)=>
            subcommand
            .setName("playlist")
            .setDescription("Loads a playlist from a url")
            .addStringOption((option) => option.setName("url").setDescription("playlist url").setRequired(true))
        )
        .addSubcommand((subcommand)=>
            subcommand
            .setName("search")
            .setDescription("Searches for song")
            .addStringOption((option) => option.setName("searchterms").setDescription("search keywords").setRequired(true))
        ),
        run: async({ client, interaction}) => {
            if (!interaction.member.voice.channel) return interaction.editReply("You need to be in a VC to use this command")

            const queue = await client.player.nodes.create(interaction.guild)
            if (!queue.connection) await queue.connect(interaction.member.voice.channel)

            let embed = new EmbedBuilder()

            if (interaction.options.getSubcommand() === "song") {
                let url = interaction.options.getString("url")
                const result = await client.player.search(url, {
                    requestedBy: interaction.user,
                    searchEngine: QueryType.YOUTUBE_VIDEO
                })
                if (result.tracks.length === 0)
                    return interaction.editReply("No results");
                
                const song = result.tracks[0]
                embed
                    .setDescription(`**[${song.title}](${song.url})** has been added to the Queue`)
                    .setThumbnail(song.thumbnail)
                    .setFooter({ text: `Duration: ${song.duration}`})
                if (!queue.playing) await queue.play(song);
                await interaction.editReply({
                    embeds: [embed]
                })
            } else if (interaction.options.getSubcommand() === "search") {
                let url = interaction.options.getString("searchterms")
                const result = await client.player.search(url, {
                    requestedBy: interaction.user,
                    searchEngine: QueryType.AUTO
                })
    
                if (result.tracks.length === 0)
                    return interaction.editReply("No results")
                
                const song = result.tracks[0]
                embed
                    .setDescription(`**[${song.title}](${song.url})** has been added to the Queue`)
                    .setThumbnail(song.thumbnail)
                    .setFooter({ text: `Duration: ${song.duration}`})
                if (!queue.playing) await queue.play(song);
                await interaction.editReply({
                    embeds: [embed]
                });
            }
        }
        
}
