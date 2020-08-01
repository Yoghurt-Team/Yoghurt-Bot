const Discord = require('discord.js');


      exports.run = function(client, message, args) {
            if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send({embed: {
                     color: 0x6A197D,
                     description: "**Yetkiniz bulunamadı**",
            } });
            if(!args[0]) return message.channel.send({embed: {
                     color: 0x6A197D,
                     description: "**Lütfen silinecek mesaj adetini yazınız**",
            } });
            if(args[0] > 100) return message.channel.send({embed: {
                     color: 0x6A197D,
                     description: "**Lütfen silinecek mesaj adetini 100'den az yazınız**",
            } });
            message.channel.bulkDelete(args[0]).then(() => {
              message.channel.send({embed: {
                       color: 0x6A197D,
                       description: ` ** ${args[0]} Adet Mesajı Sildim**`,
              } })
              .then(msg => msg.delete(10000));
            })
      }

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ['sil','temizle','süpür'],
  permLevel: 2,
};

exports.help = {
  name:'temizle',
  description: 'Belirlenen miktarda mesajı siler.',
  usage: 'temizle <silinicek mesaj sayısı>'
};
