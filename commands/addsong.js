const { servers, playlists } = require("../index");
const { getSongInfo } = require("./play");
const { getPlaylists } = require("./playlists");

async function addSongToPlaylist(msg, userId, playlistName, songInfo) {

    const object = { title: songInfo.title, time: songInfo.time };

    let createdPlaylists = await playlists.get(userId);

    if (!createdPlaylists) {
        await playlists.set(userId, []);
        createdPlaylists = await playlists.get(userId);
    }

    createdPlaylists.forEach((pl) => {
        if (pl.name.toLowerCase() === playlistName.toLowerCase()) {
            pl.songs.push( object );
        }
    })

    console.log(createdPlaylists)

    await playlists.set(userId, createdPlaylists);

    msg.channel.send(`Successfully added **${songInfo.title}** to your playlist **${playlistName}**.`);

}

async function getPlaylistNameIndex(args, playlists) {

    let index = null;

    for (let i = 0; i < args.length; i++) {

        let findName = args.slice(0, i + 1).join(" ");

        if (playlists.length > 0) {
            playlists.forEach((pl) => {
                console.log(pl)
                console.log(pl.name.toLowerCase())
                console.log(findName)
                console.log(pl.name.toLowerCase() === findName.toLowerCase())
                if (pl.name.toLowerCase() === findName.toLowerCase()) {
                    index = i + 1;
                }
            })
        }
    }

    return index;
}

module.exports = {
    name: 'addsong',
    description: `Adds a song to a chosen playlist that you've created.`,
    usage: "(playlist name) (song / None.)",
    aliases: ["newsong", "plsong", "playlistsong"],
    category: `music`,
    async execute(msg, args, client, exampleMessage, billyID) {

        const userId = msg.author.id;
        const arguments = args.slice(1);

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

        if (!args[1]) return msg.channel.send(`You need to provide a playlist name in order to add songs to it.${exampleMessage()}`);

        const createdPlaylists = await getPlaylists(userId);

        let playlistNameIndex = await getPlaylistNameIndex(arguments, createdPlaylists);

        console.log(playlistNameIndex)

        if (playlistNameIndex === null) return msg.channel.send("No valid playlist name found.");

        const songNameIndex = playlistNameIndex + 1;
        const playlistname = args.slice(1, songNameIndex).join(" ").toLowerCase();
        const query = args.slice(songNameIndex);

        console.log(query)
        console.log(songNameIndex)
        console.log(playlistname)

        if (!args[songNameIndex] && servers[msg.guild.id].queue.length === 0) return msg.channel.send(`There is currently no song playing to favorite.${exampleMessage()}`);

        if (args[songNameIndex]) {

            const songInfo = await getSongInfo(msg, query);

            if (songInfo === null) return msg.channel.send("Not a valid song given to favorite.");

            for (song in songInfo) {
                song = songInfo[song];
                await addSongToPlaylist(msg, userId, playlistname, song);
            }
        } else {

            const songInfo = servers[msg.guild.id].queue[0];

            await addSongToPlaylist(msg, userId, playlistname, songInfo);
        }
    }
}