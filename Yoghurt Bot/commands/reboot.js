const Discord = require('discord.js');
const moment = require('moment');

exports.run = (client, message, args) => {
  message.channel.send({embed: {
           color: 0x6A197D,
 		  description: "**Botu yeniden başlatmak için 15 saniye içinde [evet] yazınız! **"
    }}).then(() => {
    message.channel.awaitMessages(response => response.content === "evet", {
      max: 1,
      time: 15000,
      errors: ['time'],
    }).then((collected) => {
    message.channel.send({embed: {
             color: 0x6A197D,
        description: "**Bot yeniden başlatılıyor. **"
      }}).then(message => {
      console.log(`Bot yeniden başlatılıyor...`)
      process.exit(1);
    }).catch(console.error)
    })
    .catch(() => {
      message.channel.send({embed: {
               color: 0x6A197D,
          description: "**Bot yeniden başlatma iptal edildi. **"
        }}).then(msg => {
          msg.delete(5000)
      });
    });
});
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 4
};

exports.help = {
  name: 'reboot',
  description: 'Botu yeniden başlatır.',
  usage: 'reboot'
};
