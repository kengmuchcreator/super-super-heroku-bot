const Discord = require('discord.js');
var os = require('os');
const bot = new Discord.Client();
const prefix = '?';
var loop;
bot.on('ready', () => {
	console.log('Ready!');
	bot.user.setGame(`เปิดเพลงพิมพ์ "?เปิดเพลง"`);
});


bot.login('NTU4ODk2NzQzMDk4NjEzNzYx.XQeXhw.reSnAFk5D7LAa0HpRy3eS8AK7ew');
const YouTube = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const youtube = new YouTube("AIzaSyC9bUkt93L2nrq1aurjm26BAFTJCsBOIbg");
const queue = new Map();
var servers = {};


bot.on("message", async message => {
	if(message.author.bot) return;
    var args = message.content.split(" ");
  var searchString = args.slice(1).join(' ');
	var url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';
	var serverQueue = queue.get(message.guild.id);
if (args[0] == `${prefix}เปิดเพลง`||args[0]==`${prefix}play`||args[0]==`${prefix}p`){
	
    var voiceChannel = message.member.voiceChannel;
		if (!voiceChannel) return message.channel.send('คุณไม่ได้อยู่ในห้องคุย');
		var permissions = voiceChannel.permissionsFor(message.client.user);
		if (!permissions.has('CONNECT')) {
			return message.channel.send('ฉันไม่สามารถเชื่อมต่อกับช่องเสียงของคุณตรวจสอบให้แน่ใจว่าฉันมีสิทธิ์ที่เหมาะสม');
		}
		if (!permissions.has('SPEAK')) {
			return message.channel.send('ฉันไม่สามารถเชื่อมต่อกับช่องเสียงของคุณตรวจสอบให้แน่ใจว่าฉันมีสิทธิ์ที่เหมาะสม');
		}
      if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
			var playlist = await youtube.getPlaylist(url);
			var videos = await playlist.getVideos();
			for (const video of Object.values(videos)) {
				var video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
				await handleVideo(video2, message, voiceChannel, true); // eslint-disable-line no-await-in-loop
			}
			let embed = new Discord.RichEmbed()
            .setAuthor("ระบบเพลง")
			.setTitle(`✅ เพลย์ลิส : **${playlist.title}** ถูกเพิ่มในคิว!`)
			.setFooter(`ใช้คำสั่งโดย ${message.member.displayName}`, `${message.author.displayAvatarURL}`) //FOOTER AND ICON
            .setColor("#FF1800");
			message.channel.send(embed);
		} else {
			try {
				var video = await youtube.getVideo(url);
			} catch (error) {
				try {
					var videos = await youtube.searchVideos(searchString, 10);
					var index = 0;
					var videoIndex = "1";
					var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
					console.log(video);
				} catch (err) {
					console.error(err);
					return message.channel.send('🆘 I could not obtain any search results.');
				}
			}
			return handleVideo(video, message, voiceChannel);
		}
}
if (args[0]==`${prefix}เปลี่ยนเพลง`||args[0]==`${prefix}skip`||args[0]==`${prefix}s`){
		if (!message.member.voiceChannel) return message.channel.send('คุณไม่ได้อยู่ในห้องคุย');
		if (!serverQueue) return message.channel.send('ไม่มีเพลงที่เล่นอยู่');
		serverQueue.connection.dispatcher.end('เปลี่ยนเพลงแล้ว');
		return undefined;
}
		if(args[0]==`${prefix}ปิดเพลง`||args[0]==`${prefix}stop`||args[0]==`${prefix}st`){
		if(!message.member.voiceChannel) return message.channel.send('คุณไม่ได้อยู่ในห้องคุย!');
		if(!serverQueue) return message.channel.send('ไม่มีเพลงที่เล่นอยู่');
		serverQueue.songs = [];
		let embed = new Discord.RichEmbed()
            .setAuthor("ระบบเพลง")
			.setTitle(`ปิดเพลงแล้ว`)
			.setFooter(`ใช้คำสั่งโดย ${message.member.displayName}`, `${message.author.displayAvatarURL}`) //FOOTER AND ICON
            .setColor("#FF1800");
		serverQueue.connection.dispatcher.end(embed);
		return undefined;
	  }		
	  if(args[0]==`${prefix}วน`||args[0]==`${prefix}loop`){
		  if(!loop){
			  
			  let embed = new Discord.RichEmbed()
            .setAuthor("เปิดเพลงวน")
			.setTitle(`:repeat_one: **เปิด!**`)
			.setFooter(`ใช้คำสั่งโดย ${message.member.displayName}`, `${message.author.displayAvatarURL}`) //FOOTER AND ICON
            .setColor("#FF1800");
			message.channel.send(embed);
		  loop = true;
		  }else{
			  
			  let embed = new Discord.RichEmbed()
            .setAuthor("เปิดเพลงวน")
			.setTitle(`:repeat_one: **ปิด!**`)
			.setFooter(`ใช้คำสั่งโดย ${message.member.displayName}`, `${message.author.displayAvatarURL}`) //FOOTER AND ICON
            .setColor("#FF1800");
			message.channel.send(embed);

		  loop = false;
		  }
		return undefined;
	  }
	  
	  
	  if(args[0]==`${prefix}เสียง`||args[0]==`${prefix}volume`||args[0]==`${prefix}v`){
		if (!message.member.voiceChannel) return message.channel.send('คุณไม่ได้อยู่ในห้องคุย!');
		if (!serverQueue) return message.channel.send('ไม่มีเพลงที่เล่นอยู่');
		if (!args[1]) return message.channel.send(`ระดับเสียงในตอนนี้คือ **${serverQueue.volume}**`);
		serverQueue.volume = args[1];
		serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 5);
		return message.channel.send(`หนูปรับเสียงเป็น **${args[1]}** แล้ว`);
		}
	  
	  
	  if(args[0]==`${prefix}help`||args[0]==`${prefix}ช่วย`){
			  let embed = new Discord.RichEmbed()
            .setAuthor("คำสั้งบอททั้งหมด")
			.setTitle(`:repeat_one: **เปิด!**`)
			.addField(":musical_note: ?เปิดเพลง , ?play ,?p", "ใส่ลิ้งหรือใส่เพลงหลังคำสั่งเช่น __**?p ลุงเริงแดนซ์**__", true)
			.addField(":mag_right: ?คิว , ?queue ,?q", "ดูเพลงทั้งหมดที่เปิด", true)
			.addField("⏸ ?หยุด , ?pause ,?pa", "หยุดเพลง", true)
			.addField("▶ ?ต่อ , ?resume ,?re", "เปิดเพลงต่อ", true)
			.addField(":repeat_one: ?วน , ?loop", "เปิดเพลงวน ,ปิดเพลงวน", true)
			.addField(":notes: ?เปลี่ยนเพลง , ?skip ,?s", "เปลี่ยนเพลง", true)
			.setTimestamp()
			.setFooter(`ช่วยเหลือ ${message.member.displayName}`, `${message.author.displayAvatarURL}`) //FOOTER AND ICON
			.setThumbnail("https://i.imgur.com/0RaqBK2.jpg")
			.setImage("https://media.giphy.com/media/5AwCyyo8ZS9vl533IgU/giphy.gif")
            .setColor("#FF1800");
			message.channel.send(embed);

	  }
	  

		
		
      if(args[0]==`${prefix}คิว`||args[0]==`${prefix}queue`||args[0]==`${prefix}q`){
		if (!serverQueue) return message.channel.send('ไม่มีเพลงที่เล่นอยู่');
		
		
		
		let embed = new Discord.RichEmbed()
            .setTitle("Song queue")
            .addField(`${serverQueue.songs.map(song => `**-** ${song.title}`).join(`\n`)}`, `Now playing: ${serverQueue.songs[0].title}`)
            .setTimestamp()
            .setColor("#FF1800");
        return message.channel.send(embed);
      }
if(args[0]==`${prefix}หยุด`||args[0]==`${prefix}pause`||args[0]==`${prefix}pa`){
		if (serverQueue && serverQueue.playing) {
			serverQueue.playing = false;
			serverQueue.connection.dispatcher.pause();
			return message.channel.send('⏸ หยุดเพลงแล้ว');
		}
		return message.channel.send('ไม่มีเพลงที่เล่นอยู่');
}
if(args[0]==`${prefix}ต่อ`||args[0]==`${prefix}resume`||args[0]==`${prefix}re`){
		if (serverQueue && !serverQueue.playing) {
			serverQueue.playing = true;
			serverQueue.connection.dispatcher.resume();
			return message.channel.send('▶ เล่นเพลงต่อแล้ว');
		}
		return message.channel.send('ไม่มีเพลงที่เล่นอยู่');
	

	return undefined;
}
async function handleVideo(video, message, voiceChannel, playlist = false) {
	var serverQueue = queue.get(message.guild.id);
	console.log(video);
	var song = {
		id: video.id,
		title: video.title,
		url: `https://www.youtube.com/watch?v=${video.id}`
	};
	if (!serverQueue) {
		var queueConstruct = {
			textChannel: message.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true
		};
		queue.set(message.guild.id, queueConstruct);

		queueConstruct.songs.push(song);

		try {
			var connection = await voiceChannel.join();
			queueConstruct.connection = connection;
			play(message.guild, queueConstruct.songs[0]);
		} catch (error) {
			console.error(`ฉันไม่สามารถเข้าร่วมห้องได้ : ${error}`);
			queue.delete(message.guild.id);
			return message.channel.send(`ฉันไม่สามารถเข้าร่วมห้องได้ : ${error}`);
		}
	} else {
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		if (playlist) return undefined;
            let embed = new Discord.RichEmbed()
            .setAuthor("เพิ่มเพลง")
			.setTitle(`:notes: __**${song.title}**__ เพิ่มในคิวแล้วจ้าาา`)
			.setFooter(`ใช้คำสั่งโดย ${message.member.displayName}`, `${message.author.displayAvatarURL}`) //FOOTER AND ICON
            .setColor("#FF1800");
		message.channel.send(embed);
	
	}
	return undefined;
}
  function play(guild, song) {
	var serverQueue = queue.get(guild.id);

	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}
	console.log(serverQueue.songs);

	const dispatcher = serverQueue.connection.playStream(ytdl(song.url), {filter:"audioonly",quality: 'highestaudio',bitrate: 192000})
	.on('end', reason => {
            let embed = new Discord.RichEmbed()
            .setAuthor("⏸️ เพลงได้จบลงแล้วครับ")
            .setColor("#FF1800");
      message.channel.send(embed);
			if (reason === 'Stream is not generating quickly enough.') console.log('Song ended.');
			else console.log(reason);
			if(!loop){
			serverQueue.songs.shift();
			}
			play(guild, serverQueue.songs[0]);
		})
		.on('error', error => console.error(error));
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);

    let embed = new Discord.RichEmbed()
    .setAuthor("PARYUT BOT กำลังเปิด")
    .setTitle(`:notes: __**${song.title}**__`)
    .setURL(`${song.url}`)
    .setFooter(`ขอเพลงนี้โดย ${message.member.displayName}`, `${message.author.displayAvatarURL}`) //FOOTER AND ICON
	.setThumbnail("https://www.freepnglogos.com/uploads/music-logo-round-play-png-29.png")
    .setTimestamp()
    .setColor("#FF1800");
    serverQueue.textChannel.send(embed);
	
}
});

function wrap(text) {
	return '\n' + text.replace(/`/g, '`' + String.fromCharCode(8203)) + '\n';
}
