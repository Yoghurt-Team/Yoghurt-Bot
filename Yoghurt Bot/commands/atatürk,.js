const Discord = require('discord.js');
const client = new Discord.Client();
const ayarlar = require('./settings.json');

exports.run = (client, message) => {
    var requestify = require('requestify');
    requestify.get('https://api.emirkabal.com/ataturk').then(function(response) {
    var veri = response.getBody();
    message.channel.send({files: [veri.mesaj], embed: {
        color: ayarlar.renk,
        title: "Türkiye Cumhuriyeti Kurucusu",
        description: ":heart: Kurucumuz Mustafa Kemal Atatürk'ü özlemle anıyoruz.",
              }
  })
  });

};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ['Atatürk'],
  permLevel: 0
};

exports.help = {
  name: 'atatürk',
  description: 'Rastgale Atatürk resimleri gösterir.',
  usage: 'atatürk'
};
