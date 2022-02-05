const { servers, favorites } = require("../index");
const { getSongInfo } = require("./play");

async function addSong( msg, userId, songInfo ) {

    const object = { title: songInfo.title, time: songInfo.time };

    let savedFavorites = await favorites.get(userId);

    if (!savedFavorites) {
        await favorites.set(userId, []);
        savedFavorites = await favorites.get(userId);
    }

    savedFavorites.push( object );

    await favorites.set(userId, savedFavorites);

    msg.channel.send(`Successfully added **${songInfo.title}** to your favorites list.`);

}

module.exports = {
    name: 'favorite',
    description: `Adds a song to your favorites list. (Using the command alone favorite the current playing song, if any.)`,
    usage: "(song / None.)",
    aliases: ["addfav", "fav"],
    category: `music`,
    async execute(msg, args, client, exampleMessage, billyID) {

        const userId = msg.author.id;
        const query = args.slice(1);

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

        if (!args[1] && servers[msg.guild.id].queue.length === 0) return msg.channel.send(`There is currently no song playing to favorite.${exampleMessage()}`);

        if (args[1]) {

            const songInfo = await getSongInfo( msg, query );

            if (songInfo === null) return msg.channel.send("Not a valid song given to favorite.");

            for (song in songInfo) {
                song = songInfo[song];
                addSong( msg, userId, song );
            }
        } else {

            const songInfo = servers[msg.guild.id].queue[0];

            addSong( msg, userId, songInfo );
        }
    }
}