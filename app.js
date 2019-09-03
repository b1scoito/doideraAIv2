var axios = require("axios");
var discord = require("discord.js"), bot = new discord.Client();
var config = require("./config.json");
var guilds = require('./guilds.json');
var log = require("./log.js");
var max_rage = 0.0;
var lang_atual = 'pt';

function embedC00L(title, desc, color) {
    var embed = new discord.RichEmbed().setTimestamp().setTitle(title).setDescription(desc).setColor(color);
    return embed;
}

function say(msgvar, msgtext) {
    setTimeout(() => {
        msgvar.channel.send(msgtext);
        msgvar.channel.stopTyping(true);
    }, 100 * msgtext.split(" ").length);
}

bot.login(config.token);

bot.on('ready', () => {
    log.debug(`BOT Started on ${config.token} name ${bot.user.username}`, "ready");
});

bot.on('message', (msg) => {
    const args = msg.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    if (msg.author.id !== bot.user.id && msg.content.startsWith(config.prefix)) {
        switch (command) {
            case 'rage':
                if (!args[0]) {
                    msg.channel.send(embedC00L("Rage", `Valor atual => ${max_rage}`, "#007acc"));
                    return;
                }
                switch (args[0].toLowerCase()) {
                    case 'padrao':
                        max_rage = 0.0;
                        msg.channel.send(embedC00L("Rage", "Valor alterado!", "#007acc"));
                        break;
                    case 'medio':
                        max_rage = 0.3;
                        msg.channel.send(embedC00L("Rage", "Valor alterado!", "#007acc"));
                        break;
                    case 'alto':
                        max_rage = 0.6;
                        msg.channel.send(embedC00L("Rage", "Valor alterado!", "#007acc"));
                        break;
                    case 'puto':
                        max_rage = 0.8;
                        msg.channel.send(embedC00L("Rage", "Valor alterado!", "#007acc"));
                        break;
                    case 'putasso':
                        max_rage = 1.0;
                        msg.channel.send(embedC00L("Rage", "Valor alterado!", "#007acc"));
                        break;
                    default:
                        msg.channel.send(embedC00L("Rage", "Valor de Rage Incorreto Disponiveis: (Padrao => 0.0, Medio => 0.3, Alto => 0.6, Puto => 0.8, PUTASSO => 1.0)", "#007acc"));
                }
                break;
            case 'lang':
                if (!args[0]) {
                    msg.channel.send(embedC00L("Lang", `Valor atual => ${lang_atual}`, "#007acc"));
                    return;
                }
                switch (args[0].toLowerCase()) {
                    case 'en':
                        lang_atual = 'en';
                        msg.channel.send(embedC00L("Lang", "Valor alterado!", "#007acc"));
                        break;
                    case 'pt':
                        lang_atual = 'pt';
                        msg.channel.send(embedC00L("Lang", "Valor alterado!", "#007acc"));
                        break;
                    default:
                        msg.channel.send(embedC00L("Lang", "Valor de Lang Incorreto Disponiveis: (EN, PT)", "#007acc"));
                }
                break;
        }
    } else if (msg.author.id !== bot.user.id && msg.channel.id === guilds[msg.guild.id].channel && !msg.content.startsWith(config.prefix)) {
        if (msg.content.startsWith("#")) {
            msg.react("👀");
            return;
        }
        msg.channel.startTyping();
        axios({
            method: 'POST',
            url: 'https://wsapi.simsimi.com/190410/talk/',
            headers:
            {
                'x-api-key': config.AI.apikey,
                'Content-Type': 'application/json'
            },
            data: { utext: msg.content, lang: lang_atual, atext_bad_prob_max: max_rage },
            json: true
        }).then((response) => {
            switch (response.data['status']) {
                case 200: // OK : Normal
                    log.debug(`OK : Normal Q: ${msg.content} A: ${response.data['atext']} L: ${response.data['lang']} Took ${100 * response.data['atext'].split(" ").length}ms typing from ${msg.author.username}`, "response");
                    say(msg, response.data['atext']);
                    break;
                case 228: // Do Not Understand : There is no proper answer to the question you asked
                    log.debug(`Do Not Understand : There is no proper answer to the question you asked Q: ${msg.content}`, "response");
                    say(msg, "Pode repetir?");
                    break;
                case 403: // Unauthorized : Invalid API Key
                    log.debug("Unauthorized : Invalid API Key", "that was unexpected");
                    say(msg, "Aparentemente o server da API se fudeu. 1");
                    msg.channel.stopTyping(true);
                    break;
                case 429: // Limit Exceeded
                    log.debug("Limit Exceeded", "that was unexpected");
                    say(msg, "Aparentemente o server da API se fudeu. 2");
                    msg.channel.stopTyping(true);
                    break;
                case 500: // Server error
                    log.debug("Server error", "that was unexpected");
                    say(msg, "Aparentemente o server da API se fudeu. 3");
                    msg.channel.stopTyping(true);
                    break;
            }
        })
    }
});