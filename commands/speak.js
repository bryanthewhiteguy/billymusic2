const tts = require("google-tts-api");
const pdl = require("play-dl")
const { joinVoiceChannel, createAudioPlayer, createAudioResource, entersState, VoiceConnectionStatus, AudioPlayer, AudioPlayerStatus } = require("@discordjs/voice")

async function connectToChannel(channel, msg) {

    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: msg.guild.voiceAdapterCreator
    });

    try {
        await entersState(connection, VoiceConnectionStatus.Ready, 30e3);
        return connection;
    } catch (error) {
        connection.destroy();
        throw error;
    }
}

async function getSong(song, msg) {
    try {
        // const stream = await pdl.stream(`${song.query}`, { seek: song.seek });
        const resource = createAudioResource(song.query, {  });

        return resource;
    } catch (e) {
        console.log(e)
        Player[msg.guild.id].stop();
        msg.channel.send("An error occured while trying to play your song. Song possibly removed or age restricted.");

        servers[msg.guild.id].queue.shift();

        if (servers[msg.guild.id].queue.length === 0) {
            // servers[msg.guild.id].connection.destroy();
            // servers[msg.guild.id].connection = null;
            Player[msg.guild.id].removeAllListeners("stateChange");
            // Player[msg.guild.id] = null;
            return null;
        }

        return getSong(servers[msg.guild.id].queue[0], msg);
    }
}

module.exports = {
    name: 'speak',
    description: `Make the bot say something.`,
    usage: "(text)",
    category: `test`,
    async execute(msg, args, client, exampleMessage, billyID) {

        if (!args[1]) return msg.channel.send(`You need to type something for the bot to speak.${exampleMessage()}`);

        const text = args.slice(1).join(" ");

        const url = tts.getAudioUrl(text, {
            lang: "en",
            slow: false,
            host: "https://translate.google.com"
        })

        let player = createAudioPlayer();

        const connection = await connectToChannel(msg.member.voice.channel, msg);

        connection.subscribe(player);

        let resource = await getSong({ query: url, seek: 0 }, msg);

        player.play(resource, { volume: 1.0 });
    }
}

