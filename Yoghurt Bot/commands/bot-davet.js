const Discord = require('discord.js');
const client = new Discord.Client();
const ayarlar = require('./settings.json');

exports.run = (client, message) => {
  if (message.channel.type !== 'dm') {
    const ozelmesajkontrol = new Discord.RichEmbed()
    .setColor(ayarlar.renk)
    .setTimestamp()
    .setAuthor(message.author.username, message.author.avatarURL)
    .setDescription('Özel mesajlarını kontrol et. :postbox:');
    message.channel.sendEmbed(ozelmesajkontrol) }
	const pingozel = new Discord.RichEmbed()
    .setColor(ayarlar.renk)
    .setTimestamp()
    .setAuthor(message.author.username, message.author.avatarURL)
    .setDescription('Davet Linkim: https://discord.com/oauth2/authorize?client_id=732555601900732487&scope=bot&permissions=8');
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
