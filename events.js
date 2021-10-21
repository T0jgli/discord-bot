module.exports.registerPlayerEvents = (player) => {
    player.on("error", (queue, error) => {
        queue.metadata.send("Hogy rohadjak meg: ", error.message);
        console.log(`[${queue.guild.name}] Error emitted from the queue: ${error.message}`);
    });
    player.on("connectionError", (queue, error) => {
        queue.metadata.send("Hogy rohadjak meg: ", error.message);
        console.log(`[${queue.guild.name}] Error emitted from the connection: ${error.message}`);
    });

    player.on("trackStart", (queue, track) => {
        // queue.metadata.send(`▶ | Started playing: **${track.title}** in **${queue.connection.channel.name}**!`);
        queue.metadata.send({
            embeds: [
                {
                    author: {
                        name: "🎵 | Started playing",
                    },
                    title: `${track.title}`,
                    fields: [
                        {
                            name: "Channel",
                            value: track.author,
                            inline: true,
                        },
                        {
                            name: "Duration",
                            value: track.duration,
                            inline: true,
                        },
                    ],
                    url: track.url,
                    thumbnail: {
                        url: track.thumbnail,
                    },
                },
            ],
        });
    });

    player.on("trackAdd", (queue, track) => {
        if (queue.playing) {
            queue.metadata.send(`🎶 | Track **${track.title}** queued!`);
        }
    });

    player.on("botDisconnect", (queue) => {
        queue.metadata.send("❌ | I was manually disconnected from the voice channel, clearing queue!");
    });

    player.on("channelEmpty", (queue) => {
        queue.metadata.send("❌ | Nobody is in the voice channel, leaving...");
    });

    // player.on("queueEnd", (queue) => {
    //     queue.metadata.send("✅ | Queue finished!");
    // });
};
