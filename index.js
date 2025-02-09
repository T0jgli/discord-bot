const fs = require('fs');
const Discord = require('discord.js');
const Client = require('./client/Client');
const config = require('./config.json');
const {Player} = require('discord-player');
require('dotenv').config();

const client = new Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

console.log(client.commands);

const player = new Player(client);

player.on('error', (queue, error) => {
  queue.metadata.send('Hogy rohadjak meg: ', error.message);
  console.log(`[${queue.guild.name}] Error emitted from the queue: ${error.message}`);
});

player.on('connectionError', (queue, error) => {
  queue.metadata.send('Hogy rohadjak meg: ', error.message);
  console.log(`[${queue.guild.name}] Error emitted from the connection: ${error.message}`);
});

player.on('trackStart', (queue, track) => {
  // queue.metadata.send(`▶ | Started playing: **${track.title}** in **${queue.connection.channel.name}**!`);
  queue.metadata.send({
    embeds: [
      {
        author: {
          name: '🎵 | Started playing',
        },
        title: `${track.title}`,
        fields: [
          {
            name: 'Channel',
            value: track.author,
            inline: true,
          },
          {
            name: 'Duration',
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

player.on('trackAdd', (queue, track) => {
  if (queue.playing) {
    queue.metadata.send(`🎶 | Track **${track.title}** queued!`);
  }
});

player.on('botDisconnect', queue => {
  queue.metadata.send('❌ | I was manually disconnected from the voice channel, clearing queue!');
});

player.on('channelEmpty', queue => {
  queue.metadata.send('❌ | Nobody is in the voice channel, leaving...');
});

// player.on('queueEnd', queue => {
//   queue.metadata.send('✅ | Queue finished!');
// });

client.once('ready', async () => {
  console.log('Ready!');
});

client.on('ready', function () {
  client.user.setActivity(config.activity, {type: config.activityType});
});

client.once('reconnecting', () => {
  console.log('Reconnecting!');
});

client.once('disconnect', () => {
  console.log('Disconnect!');
});

client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild) return;
  if (!client.application?.owner) await client.application?.fetch();

  if (message.content === '!deploy') {
    try {
      await message.guild.commands.set(client.commands);
      message.reply('Deployed!');
    } catch (error) {
      message.reply('Could not deploy commands! Make sure the bot has the application.commands permission!');
      console.error(err);
    }
  }
});

client.on('interactionCreate', async interaction => {
  const command = client.commands.get(interaction.commandName.toLowerCase());

  try {
    command.execute(interaction, player);
  } catch (error) {
    console.error(error);
    interaction.followUp({
      content: 'There was an error trying to execute that command!',
    });
  }
});

client.login(process.env.TOKEN);
