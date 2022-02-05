const { MessageEmbed } = require(`discord.js`);
const { pages } = require("../functions");
const urloptions = { "format": "png", "dynamic": true };

const { servers, playlists } = require("../index");

async function getPlaylists(userId) {

    let allPlaylists = await playlists.get(userId);

    if (!allPlaylists) {
        await playlists.set(userId, []);
        allPlaylists = await playlists.get(userId);
    }

    return allPlaylists;
}

module.exports = {
    name: 'getsongs',
    description: `Gets all of a user's playlist's songs.`,
    usage: "(playlist name)",
    aliases: ["getplaylistsongs", "getplsongs"],
    category: `music`,
    async execute(msg, args, client, exampleMessage, billyID) {

        const userId = msg.author.id;
        const filter = (reaction, User) => User.id === msg.author.id && [`▶️`, `◀️`].includes(reaction.emoji.name)

        if (!args[1]) return msg.channel.send(`You need to provide a valid playlist name that you have created.${exampleMessage()}`);

        const playlistName = args.slice(1).join(" ");

        const createPlaylists = await getPlaylists(userId);

        let songs;

        createPlaylists.forEach((pl) => {
            if (pl.name.toLowerCase() === playlistName.toLowerCase()) {
                songs = pl.songs;
            }
        })

        let allSongs = [];

        if (!songs) return msg.channel.send(`You need to provide a valid playlist name that you have created.${exampleMessage()}`);

        if (songs.length === 0) {
            allSongs.push("No added songs.");
        } else {
            allSongs = songs
                .map((song, i) => `**${i + 1}.** ${song.title} - \`(${song.time})\``);
        }

        const totalPages = Math.ceil(allSongs.length / 10)

        let pageNumber = 1;
        let page = pages(allSongs, 10, pageNumber)

        const embed = new MessageEmbed()
            .setColor(808080)
            .setAuthor({ name: msg.author.username, iconURL: msg.author.displayAvatarURL(urloptions) })
            .setTitle(`${playlistName} song list:`)
            .setDescription(`${page.join(`\n`)}`)
            .setFooter({ text: `Page: (${pageNumber}/${totalPages})`, iconURL: client.user.displayAvatarURL(urloptions) });

        msg.channel.send({ embeds: [embed] }).then(async (message) => {
            await message.react(`◀️`)
            message.react(`▶️`)

            const collector = message.createReactionCollector({ filter, time: 300000, idle: 60000, dispose: true });

            function movePage(page) {

                message.edit({
                    embeds: [embed
                        .setDescription(`${page.join(`\n`)}`)
                        .setFooter({ text: `Page: (${pageNumber}/${totalPages})`, iconURL: client.user.displayAvatarURL(urloptions) })]
                })
            }

            collector.on(`remove`, r => {

                const forwards = r.emoji.name === "▶️" ? true : false;

                if (pageNumber !== (forwards ? totalPages : 1)) {

                    forwards ? pageNumber++ : pageNumber--;

                    page = pages(allSongs, (pageNumber === 1 ? 11 : 10), pageNumber);

                    movePage(page);
                }
            })

            collector.on(`collect`, r => {

                const forwards = r.emoji.name === "▶️" ? true : false;

                if (pageNumber !== (forwards ? totalPages : 1)) {

                    forwards ? pageNumber++ : pageNumber--;

                    page = pages(allSongs, (pageNumber === 1 ? 11 : 10), pageNumber);

                    movePage(page);
                }
            })
        }).catch((e) => {
            console.log(e)
            return msg.channel.send(`An error occured.`)
        })
    },
    getPlaylists
}