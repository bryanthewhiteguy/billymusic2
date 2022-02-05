const Discord = require('discord.js');
const Keyv = require("keyv");
const favorites = new Keyv("mongodb://billy:awesomeB1!@music-shard-00-00.dompl.mongodb.net:27017,music-shard-00-01.dompl.mongodb.net:27017,music-shard-00-02.dompl.mongodb.net:27017/music?ssl=true&replicaSet=atlas-5e8i2c-shard-0&authSource=admin&retryWrites=true&w=majority");
const playlists = new Keyv("mongodb://billy:awesomeB1!@music-shard-00-00.dompl.mongodb.net:27017,music-shard-00-01.dompl.mongodb.net:27017,music-shard-00-02.dompl.mongodb.net:27017/playlists?ssl=true&replicaSet=atlas-5e8i2c-shard-0&authSource=admin&retryWrites=true&w=majority");
const { prefix, urloptions } = require("./botconfig.json")

favorites.on('error', err => console.log('Connection Error', err));

const token = process.env.TOKEN || require("./botconfig.json").token;

const client = new Discord.Client({
    intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MESSAGES,
        Discord.Intents.FLAGS.GUILD_VOICE_STATES,
        Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Discord.Intents.FLAGS.GUILD_VOICE_STATES
    ]
})

client.login(token);

const fs = require(`fs`)
const ms = require(`ms`)

const billyID = `303195470568751108`

let Player = [];
let servers = {};

module.exports = { servers, Player, favorites, playlists };

client.commands = new Discord.Collection()
client.aliases = new Discord.Collection()
client.cooldowns = new Discord.Collection()
client.globalTimeout = new Discord.Collection()

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
    if (command.aliases) command.aliases.forEach(a => client.aliases.set(a, command));
}

client.on(`ready`, () => {
    require(`./events/client/ready`)(client, prefix)
})

client.on(`message`, msg => {
    require(`./events/client/message`)(billyID, client, prefix, msg)
})
