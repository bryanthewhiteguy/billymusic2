const { servers, playlists } = require("../index");
const { getPlaylists } = require("./playlists");

module.exports = {
    name: 'deleteplaylist',
    description: `Deletes a playlist.`,
    usage: "(playlist name)",
    aliases: ["deletepl", "delplaylist", "delpl"],
    category: `music`,
    async execute(msg, args, client, exampleMessage, billyID) {

        const userId = msg.author.id;
        const playlistName = args.slice(1).join(" ");

        if (!args[1]) return msg.channel.send(`You need to provide the playlist name you want to delete.${exampleMessage()}`);

        const createPlaylists = await getPlaylists( userId );

        if (createPlaylists.length > 0) {
            for (let i = 0; i < createPlaylists.length; i++) {

                const pl = createPlaylists[i];

                if (pl.name.toLowerCase() === playlistName.toLowerCase()) {
                    
                    createPlaylists.splice(i, 1);

                    await playlists.set(userId, createPlaylists);

                    return msg.channel.send(`Successfully deleted the playlist **${pl.name}**.`);
                }
            }

            return msg.channel.send(`You need to provide a valid playlist name.${exampleMessage()}`);
        } else {
            return msg.channel.send("You currently don't have any created playlists.");
        }
    }
}