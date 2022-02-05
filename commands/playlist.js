const { servers, playlists } = require("../index");
const { play, processQuery } = require("./play");
const { getPlaylists } = require("./playlists");

module.exports = {
    name: 'playlist',
    description: `Plays all the songs from a playlist that you have created.`,
    usage: "(playlist name)",
    aliases: ["pl"],
    category: `music`,
    async execute(msg, args, client, exampleMessage, billyID) {

        const userId = msg.author.id;

        if (!servers[msg.guild.id]) servers[msg.guild.id] = {
            queue: [],
            previousQueue: [],
            skipping: false,
            queueing: false,
            previous: false,
            playNow: false,
            seek: null,
            loop: false,
            connection: null,
            resource: null
        }

        if (!args[1]) return msg.channel.send(`You need to provide a valid playlist name that you created..${exampleMessage()}`);

        const playlistName = args.slice(1).join(" ");
        const createdPlaylists = await getPlaylists(userId);

        if (createdPlaylists.length === 0) return msg.channel.send("You currently have no playlists. Use the \`\"createplaylist\"\` command to add a favorite song.");

        let songs;

        createdPlaylists.forEach((pl) => {
            if (pl.name.toLowerCase() === playlistName.toLowerCase()) {
                songs = pl.songs;
            }
        })

        if (!songs) return msg.channel.send(`You need to provide a valid playlist name that you created..${exampleMessage()}`);

        songs.forEach((song) => {

            const songTitle = song.title;

            args = `${args[0]} ${songTitle}`.split(" ");

            processQuery(msg, args, client, exampleMessage, billyID, true);
        })
    }
}