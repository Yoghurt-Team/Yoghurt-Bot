const Discord = require('discord.js');
const Util = require('discord.js');
const client = new Discord.Client();
const moment = require('moment');
const fs = require('fs');
const ytdl = require('ytdl-core-discord');
const ayarlar = require('./settings.json'); ///Ayarlar.json dosyasını çektik
require('./util/eventLoader')(client);
const prefix = ayarlar.prefix;
const queue = new Map();


const log = message => {
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${message}`); ///Log mesajlarını tarih ve saate çevirdik
};

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir('./commands/', (err, files) => {
  if (err) console.error(err);
  log(`${files.length} komut yüklenecek.`);
  files.forEach(f => {
    let props = require(`./commands/${f}`);
    log(`Yüklenen komut: ${props.help.name}.`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      client.aliases.set(alias, props.help.name);
    });
  });
});

client.reload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./commands/${command}`)];
      let cmd = require(`./commands/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

client.load = command => {
  return new Promise((resolve, reject) => {
    try {
      let cmd = require(`./commands/${command}`);
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

client.unload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./commands/${command}`)];
      let cmd = require(`./commands/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

client.elevation = message => {
  if(!message.guild) {
	return; }
  let permlvl = 0;
  if (message.member.hasPermission("BAN_MEMBERS")) permlvl = 2;
  if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 3;
  if (message.author.id === ayarlar.sahip) permlvl = 4;
  return permlvl;
};


async function play(guild, song) {
 const serverQueue = queue.get(guild.id)
 if(!song) {
   serverQueue.voiceChannel.leave()
   queue.delete(guild.id)
   return
  }
 const dispatcher = serverQueue.connection.play(await ytdl(song.url), { type: 'opus' })
.on('finish', () => {
 serverQueue.songs.shift()
  play(guild, serverQueue.songs[0])
})
 .on('error', error => {
  log(error)
})
dispatcher.setVolume(serverQueue.volume / 100 )
}


client.on('message', async message => {
  if(message.author.bot) return
  if(!message.content.startsWith(prefix)) return

  const args = message.content.substring(prefix.length).split(" ")
  const serverQueue =  queue.get(message.guild.id)

  if(message.content.startsWith(prefix + 'play')){
    const voiceChannel = message.member.voice.channel
    if(!voiceChannel) return  message.channel.send({embed: {
           color: ayarlar.renk,
           description: '**Ses kanalında olman gerekiyor**',
        } })
    const permissions = voiceChannel.permissionsFor(message.client.user)
    if(!permissions.has('CONNECT')) return message.channel.send({embed: {
           color: ayarlar.renk,
           description: '**Ses kanalına bağlanma yetkim yok**',
          } })
    if(!permissions.has('SPEAK')) return message.channel.send({embed: {
           color: ayarlar.renk,
           description: '**Ses kanalında konuşma yetkim yok**',
          } })
    if(!args[1]) return  message.channel.send({embed: {
                 color: ayarlar.renk,
                 description: '**Hatalı kullanım:** y!play (YT Link)',
    } })
    if(!ytdl.validateURL(args[1])) return  message.channel.send({embed: {
             color: ayarlar.renk,
             description: '**Lütfen linki kontrol ediniz**',
      } })

    const songInfo= await ytdl.getInfo(args[1])
    const song = {
      title: Util.escapeMarkdown(songInfo.title),
      url: songInfo.video_url
    }

    if(!serverQueue) {
        const queueConstruct = {
          textChannel: message.channel,
          voiceChannel: voiceChannel,
          connection: null,
          songs: [],
          volume: 100,
          playing: true
        }
        queue.set(message.guild.id, queueConstruct)
        queueConstruct.songs.push(song)

      try{
        const video = await ytdl.getInfo(args[1])
        message.channel.bulkDelete(1)
        message.channel.send({embed: {
               color: ayarlar.renk,
               description: '**Şarkı çalınmaya başladı: **' +  video.title,
        } })
        var connection = await voiceChannel.join()
        queueConstruct.connection = connection
        play(message.guild, queueConstruct.songs[0])
      } catch (error) {
        log('Bir hata tespit edildi ' + error)
        queue.delete(message.guild.id)
      }
    } else {
      serverQueue.songs.push(song)
      message.channel.bulkDelete(1)
      return message.channel.send({embed: {
        color: ayarlar.renk,
        description: '**Şarkı başarıyla sıraya eklendi: **' +  song.title,
      } })
    }
    return undefined

  } else if (message.content.startsWith(prefix + 'stop')) {
    if(!message.member.voice.channel) return  message.channel.send({embed: {
           color: ayarlar.renk,
           description: '**Ses kanalında olman gerekiyor**',
      } })
    if(!serverQueue) return message.channel.send({embed: {
           color: ayarlar.renk,
           description: '**Çalan bir şarkı bulunamadı**',
      } })
      serverQueue.songs = []
      serverQueue.connection.dispatcher.end()
      message.channel.bulkDelete(1)
      message.channel.send({embed: {
             color: ayarlar.renk,
             description: '**Şarkılar durduruldu ve ses kanalından çıkıldı**',
        } })
    return undefined
  } else if (message.content.startsWith(prefix + 'skip')) {
    if(!message.member.voice.channel) return  message.channel.send({embed: {
           color: ayarlar.renk,
           description: '**Ses kanalında olman gerekiyor**',
      } })
      if(!serverQueue) return message.channel.send({embed: {
             color: ayarlar.renk,
             description: '**Çalan bir şarkı bulunamadı**',
        } })
        serverQueue.connection.dispatcher.end()
        message.channel.bulkDelete(1)
        message.channel.send({embed: {
               color: ayarlar.renk,
               description: '**Bir sonraki şarkıya geçildi**',
          } })
        return undefined
  }else if (message.content.startsWith(prefix + 'volume')) {
    if(!message.member.voice.channel) return  message.channel.send({embed: {
           color: ayarlar.renk,
           description: '**Ses kanalında olman gerekiyor**',
      } })
      if(!serverQueue) return message.channel.send({embed: {
             color: ayarlar.renk,
             description: '**Çalan bir şarkı bulunamadı**',
        } })
        if(!args[1]) return message.channel.send({embed: {
               color: ayarlar.renk,
               description: '**Şu anki ses:** '+ serverQueue.volume,
        } })
        if(isNaN(args[1])) return message.channel.send({embed: {
               color: ayarlar.renk,
               description: '**Girdiğiniz veri ses için uygun değildir**',
          } })
        if(args[1] > 200) return message.channel.send({embed: {
                 color: ayarlar.renk,
                 description: "**Ses seviyesi 200'den fazla olamaz.**",
        } })
        serverQueue.volume = args[1]
        serverQueue.connection.dispatcher.setVolume(args[1] / 100)
        message.channel.bulkDelete(1)
        message.channel.send({embed: {
               color: ayarlar.renk,
               description: '**Ses seviyesi değiştirildi:** ' + serverQueue.volume,
          } })
        return undefined
  } else if (message.content.startsWith(prefix + 'np')) {
      if(!serverQueue) return message.channel.send({embed: {
             color: ayarlar.renk,
             description: '**Çalan bir şarkı bulunamadı**',
        } })
        message.channel.bulkDelete(1)
        message.channel.send({embed: {
               color: ayarlar.renk,
               description: '**Çalan şarkı: **' + serverQueue.songs[0].title,
        } })
        return undefined
  } else if (message.content.startsWith(prefix + 'list')) {
      if(!serverQueue) return message.channel.send({embed: {
             color: ayarlar.renk,
             description: '**Çalan bir şarkı bulunamadı**',
        } })
        message.channel.bulkDelete(1)
        let index = 0
        message.channel.send(new Discord.MessageEmbed()
        .setColor(ayarlar.renk)
        .setTitle("Şarkı Kuyruğu")
        .setDescription(
            `${serverQueue.songs
              .map(song => `**${++index} -** ${song.title}`).join("\n")}`
          )
         .addField("Şu Anda Çalınan: " + `${serverQueue.songs[0].title}`)
         .setTimestamp())
        return undefined
  } else if (message.content.startsWith(prefix + 'pause')) {
    if(!message.member.voice.channel) return  message.channel.send({embed: {
           color: ayarlar.renk,
           description: '**Ses kanalında olman gerekiyor**',
      } })
      if(!serverQueue) return message.channel.send({embed: {
             color: ayarlar.renk,
             description: '**Çalan bir şarkı bulunamadı**',
        } })
        if(!serverQueue.playing) return message.channel.send({embed: {
               color: ayarlar.renk,
               description: '**Şarkı zaten durdurulmuş**',
          } })
        serverQueue.playing = false
        serverQueue.connection.dispatcher.pause()
        message.channel.bulkDelete(1)
        message.channel.send({embed: {
               color: ayarlar.renk,
               description: '**Şarkı durduruldu**',
          } })
        return undefined
  }else if (message.content.startsWith(prefix + 'resume')) {
    if(!message.member.voice.channel) return  message.channel.send({embed: {
           color: ayarlar.renk,
           description: '**Ses kanalında olman gerekiyor**',
      } })
      if(!serverQueue) return message.channel.send({embed: {
             color: ayarlar.renk,
             description: '**Çalan bir şarkı bulunamadı**',
        } })
        if(serverQueue.playing) return message.channel.send({embed: {
               color: ayarlar.renk,
               description: '**Şarkı zaten devam ediyor**',
          } })
        serverQueue.playing = true
        serverQueue.connection.dispatcher.resume()
        message.channel.bulkDelete(1)
        message.channel.send({embed: {
               color: ayarlar.renk,
               description: '**Şarkı devam ediyor**',
          } })
        return undefined
  }
})


client.login(ayarlar.token);
