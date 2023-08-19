const Discord = require('discord.js');
const dotenv = require('dotenv');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const { Player } = require('discord-player');
const { GatewayIntentBits } = require('discord.js');
const { YouTubeExtractor } = require('@discord-player/extractor');

dotenv.config();
const TOKEN = process.env.TOKEN;

const LOAD_SLASH = process.argv[2] == 'load';

const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const client = new Discord.Client({
    intents: [     
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
    ]
})

client.slashcommands = new Discord.Collection()
client.player = new Player(client, {
    ytdlOptions:{
        quality: "highestaudio",
        highWaterMark: 1 << 25 //Buffering up to 32KB of data
    }
});
client.player.extractors.register(YouTubeExtractor);

let commands = []

const slashFiles = fs.readdirSync('./slash').filter(file => file.endsWith('.js'));
for (const file of slashFiles) {
    const slashcmd = require(`./slash/${file}`);
    client.slashcommands.set(slashcmd.data.name, slashcmd)
    if (LOAD_SLASH) commands.push(slashcmd.data.toJSON())
}

if (LOAD_SLASH) {
    const rest = new REST({ version: '9' }).setToken(TOKEN);
    console.log('Deploying slash commands')
    rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands })
    .then(() => {
        console.log('Successfully registered application commands.'); 
        process.exit(0)
    })
    .catch((err) => {
        if (err) {
            console.error(err);
            process.exit(1)
        }
    });
} else {
    client.on('ready', () => {
        console.log(`Logged in as ${client.user.tag}!`);
    });
    client.on('interactionCreate', async interaction => {
        async function handleCommand() {
            if (!interaction.isCommand()) return;
            const slashcmd = client.slashcommands.get(interaction.commandName)
            if (!slashcmd) interaction.reply('Not valid slash command.');

            await interaction.deferReply()
            await slashcmd.run({ client, interaction })
        }
        handleCommand()
    });
    client.login(TOKEN);
}
