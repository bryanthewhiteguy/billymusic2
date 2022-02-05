const { servers, favorites } = require("../index");
const { getSongInfo } = require("./play");
const { getFavorites } = require("./favorites");

async function deleteSong( msg, userId, songNumber ) {

    let savedFavorites = await favorites.get(userId);
    
    const songTitle = savedFavorites[songNumber - 1].title;

    savedFavorites.splice(songNumber - 1, 1);

    await favorites.set(userId, savedFavorites);

    msg.channel.send(`Successfully deleted **${songTitle}** to your favorites list.`);

}

module.exports = {
    name: 'deletefavorite',
    description: `Deletes a song that you have favorited.`,
    usage: "(song number)",
    aliases: ["delfav", "deletefav"],
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

        if (!args[1]) return msg.channel.send(`You need to provide the number for the favorite song that you want to play.${exampleMessage()}`);
        if (isNaN(args[1]) || args[1] <= 0) return msg.channel.send(`You need to provide a valid number for the favorite song that you want to play.${exampleMessage()}`);

        const favorites = await getFavorites(userId);

        if (favorites.length === 0) return msg.channel.send("You currently have no favorite songs. Use the \"addfavorite\" command to add a favorite song.");
        if (favorites.length < args[1]) return msg.channel.send("You don't have that many favorite songs.");

        deleteSong( msg, userId, args[1] );
    }
}