const Discord = require('discord.js');
const client = new Discord.Client();

exports.run = (client, message) => {
    var requestify = require('requestify');
    requestify.get('https://api.emirkabal.com/espri').then(function(response) {
    var veri = response.getBody();
    message.channel.send({embed: {
       color: 0x6A197D,
       description: '**' + veri.mesaj + '**',
      }
  })
  });

};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ['Sogutucu'],
  permLevel: 0
};

exports.help = {
  name: 'sogutucu',
  description: 'Ortamı buz gibi yapmak için birebir',
  usage: 'sogutucu'
};
