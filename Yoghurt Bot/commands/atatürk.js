const Discord = require('discord.js');
const client = new Discord.Client();


exports.run = (client, message) => {
    var requestify = require('requestify');
    requestify.get('https://api.emirkabal.com/ataturk').then(function(response) {
    var veri = response.getBody();
    message.channel.send({files: [veri.mesaj], embed: {
        color: 0x6A197D,
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
