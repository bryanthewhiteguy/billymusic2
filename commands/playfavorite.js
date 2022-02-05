const { servers, favorites } = require("../index");
const { play, processQuery } = require("./play");
const { getFavorites } = require("./favorites");

module.exports = {
    name: 'playfavorite',
    description: `Plays a song that you have favorated.`,
    usage: "(song number) (now / None.)",
    aliases: ["playfav", "pf"],
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

        if (!args[1]) return msg.channel.send(`You need to provide the number for the favorite song that you want to play.${exampleMessage()}`);
        if (isNaN(args[1]) || args[1] <= 0) return msg.channel.send(`You need to provide a valid number for the favorite song that you want to play.${exampleMessage()}`);

        const favorites = await getFavorites(userId);

        if (favorites.length === 0) return msg.channel.send("You currently have no favorite songs. Use the \`\"favorite\"\` command to add a favorite song.");
        if (favorites.length < args[1]) return msg.channel.send("You don't have that many favorite songs.");

        const song = favorites[args[1] - 1].title;

        if (args[2] && args[2].toLowerCase() === "now") servers[msg.guild.id].playNow = true;

        args = `${args[0]} ${song}`.split(" ");
        
        processQuery( msg, args, client, exampleMessage, billyID );
    }
}