const Discord = require('discord.js');
const client = new Discord.Client();


exports.run = (client, message) => {
  if (message.channel.type !== 'dm') {
    const ozelmesajkontrol = new Discord.RichEmbed()
    .setColor(0x6A197D)
    .setTimestamp()
    .setAuthor(message.author.username, message.author.avatarURL)
    .setDescription('Özel mesajlarını kontrol et. :postbox:');
    message.channel.sendEmbed(ozelmesajkontrol) }
	const pingozel = new Discord.RichEmbed()
    .setColor(0x6A197D)
    .setTimestamp()
    .setAuthor(message.author.username, message.author.avatarURL)
    .setDescription('Davet Linkim: ' + ayarlar.davet);
    return message.author.sendEmbed(pingozel)
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ['botuekle', 'botudavetet', 'invite'],
  permLevel: 0
};

exports.help = {
  name: 'botdavet',
  description: 'Botun davet linkini gönderir.',
  usage: 'botdavet'
};
