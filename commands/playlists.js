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
    name: 'playlists',
    description: `Gets all of a user's playlists.`,
    usage: "(User)",
    aliases: ["pls"],
    category: `music`,
    async execute(msg, args, client, exampleMessage, billyID) {

        const text = args.slice(1).join(" ");

        const theUser = msg.mentions.members.first()
            || msg.guild.members.cache.find(m => m.displayName.toLowerCase() === text)
            || msg.guild.members.cache.find(m => m.user.username.toLowerCase() === text)
            || msg.guild.members.cache.find(m => m.user.tag.toLowerCase() === text)
            || msg.guild.members.cache.find(m => m.user.id === text)
            || msg.member

        const userId = theUser.id;
        const filter = (reaction, User) => User.id === msg.author.id && [`▶️`, `◀️`].includes(reaction.emoji.name)

        const createPlaylists = await getPlaylists(userId);

        let allPlaylists = [];

        if (createPlaylists.length === 0) {
            allPlaylists.push("No created playlists.");
        } else {
            allPlaylists = createPlaylists
                .map((pl, i) => `**${i + 1}.** ${pl.name}`);
        }

        const totalPages = Math.ceil(allPlaylists.length / 10)

        let pageNumber = 1;
        let page = pages(allPlaylists, 10, pageNumber)

        const embed = new MessageEmbed()
            .setColor(808080)
            .setAuthor({ name: theUser.user.username, iconURL: theUser.user.displayAvatarURL(urloptions) })
            .setTitle(`${theUser.user.username}'s playlists:`)
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

                    page = pages(allPlaylists, (pageNumber === 1 ? 11 : 10), pageNumber);

                    movePage(page);
                }
            })

            collector.on(`collect`, r => {

                const forwards = r.emoji.name === "▶️" ? true : false;

                if (pageNumber !== (forwards ? totalPages : 1)) {

                    forwards ? pageNumber++ : pageNumber--;

                    page = pages(allPlaylists, (pageNumber === 1 ? 11 : 10), pageNumber);

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