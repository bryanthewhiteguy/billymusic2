const { servers, playlists } = require("../index");
const { getPlaylists } = require("./playlists");

async function addplaylist( msg, userId, name ) {

    const playlistObject = { name: name, songs: [] }

    let allPlaylists = await playlists.get(userId);

    if (!allPlaylists) {
        await playlists.set(userId, []);
        allPlaylists = await favorites.get(userId);
    }

    allPlaylists.push(playlistObject);

    await playlists.set(userId, allPlaylists);

    msg.channel.send(`Successfully creted a new playlist called **\"${name}\"**.`);

}

module.exports = {
    name: 'createplaylist',
    description: `creates a new playlist to add songs to.`,
    usage: "(new playlist name)",
    aliases: ["newplaylist", "createpl"],
    category: `music`,
    async execute(msg, args, client, exampleMessage, billyID) {

        const userId = msg.author.id;
        const playlistName = args.slice(1).join(" ");

        if (!args[1]) return msg.channel.send(`You need to provide a name for your new playlist.${exampleMessage()}`);

        const createPlaylists = await getPlaylists( userId );

        if (createPlaylists.length > 0) {
            createPlaylists.forEach((pl, i) => {
                if (pl.name.toLowerCase() === playlistName.toLowerCase()) {
                    return msg.channel.send(`You already have a playlist created named **\"${playlistName}\"**.`);
                }
            })
        }

        addplaylist( msg, userId, playlistName );
    }
}