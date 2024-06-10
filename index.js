const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const mineflayer = require("mineflayer");
require("dotenv").config();
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Configuración del bot de Minecraft
let bot;
let reconnectAttempts = 0;
const maxReconnectAttempts = 10;
const allowedChannelId = "1245851041212141629";

function createBot() {
  bot = mineflayer.createBot({
    host: "pandorab.org",
    username: "elteno",
  });


  bot.on(`playerJoined`, (player) => {
    const channel = client.channels.cache.get(allowedChannelId);
    if (channel) {
      // Crear un embed con el color especificado y el autor
      const embed = {
        color: 49959, // Color en decimal (en este caso, verde)
        author: {
          name: `${player.username} ha entrado`,
          icon_url: `https://cravatar.eu/helmavatar/${player.username}/128.png`,
        },
      };

      channel.send({ embeds: [embed] });
    }
  });

  bot.on(`playerLeft`, (player) => {
    const channel = client.channels.cache.get(allowedChannelId);
    if (channel) {
      // Crear un embed con el color especificado y el autor
      const embed = {
        color: 16711680, // Color en decimal (en este caso, rojo) 49959
        author: {
          name: `${player.username} se ha ido`,
          icon_url: `https://cravatar.eu/helmavatar//${player.username}/128.png`,
        },
      };

      
      channel.send({ embeds: [embed] });
    }
  });


  bot.on("message", (message) => {
    // Convertir el mensaje a JSON
    const messageJson = JSON.stringify(message, null, 2);
    // Parsear el JSON de nuevo a un objeto para acceder a las propiedades
    const parsedMessage = JSON.parse(messageJson);

    if (parsedMessage.unsigned) {
      // Acceder a la propiedad unsigned

      if (
        parsedMessage.unsigned.with[0] &&
        parsedMessage.unsigned.with[0].extra[3]
      ) {
        const channel = client.channels.cache.get(allowedChannelId);
        const clan = parsedMessage.unsigned.with[0].extra[0].text;
        const username = parsedMessage.unsigned.with[0].extra[1].text;
        const message = parsedMessage.unsigned.with[0].extra[3].text;
        if (username.includes('elteno')) {
          return;
        }
        channel.send(`${clan}${username}: ${message}`);
        console.log(`${clan}${username}: ${message}`);
      } else {
        const channel = client.channels.cache.get(allowedChannelId);
        const username = parsedMessage.unsigned.with[0].extra[0].text;
        const message = parsedMessage.unsigned.with[0].extra[2].text;
        if (username.includes('elteno')) {
          return;
        } 
        channel.send(`${username}: ${message}`)
        console.log(`${username}: ${message}`);
      }
    }
  });

  bot.on("spawn", () => {
    const channel = client.channels.cache.get(allowedChannelId);
    if (channel) {
      channel.send(":white_check_mark: Bot encendido y conectado al servidor. ");
    }

    bot.chat("/login [OCULTO]");
  });

  bot.on("kicked", async (reason, loggedIn) => {
    const channel = client.channels.cache.get(allowedChannelId);
    let reason_value;
    try {
     reason_value = reason.value.translate.value;
    }catch(e){
        reason_value = reason.value;
    }
    console.log(reason_value);
    if (channel) {
      const embed = new EmbedBuilder().setColor("#FF0000")
        .setTitle(`:octagonal_sign: Bot botado del servidor por: ${reason_value} `);

      channel.send({ embeds: [embed] });
    }

    if (reconnectAttempts < maxReconnectAttempts) {
      reconnectAttempts++;
      await delay(2 * 60 * 1000); // Espera 2 minutos antes de intentar reconectar
      createBot(); // Intenta reconectar
    } else {
      console.log("Máximo número de intentos de reconexión alcanzado.");
      if (channel) {
        channel.send("Máximo número de intentos de reconexión alcanzado.");
      }
    }
  }
);

  bot.on("end", async () => {
    console.log("Bot desconectado del servidor.");
    if (reconnectAttempts < maxReconnectAttempts) {
      reconnectAttempts++;
      await delay(2 * 60 * 1000); // Espera 2 minutos antes de intentar reconectar
      createBot(); // Intenta reconectar
    } else {
      console.log("Máximo número de intentos de reconexión alcanzado.");
      const channel = client.channels.cache.get(allowedChannelId);
      if (channel) {
        channel.send("Máximo número de intentos de reconexión alcanzado.");
      }
    }
  });
}

// Configuración del bot de Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});


client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  createBot(); // Crear y conectar el bot de Minecraft al iniciar el bot de Discord
});

client.on("messageCreate", (message) => {
  if (message.channel.id === allowedChannelId) {
    if (message.author.tag === client.user.tag) {
      return;
    }
    if (message.content.includes("/")) {
      console.log("ignoring command");
      return;
    }

    if(message.content === "!playerlist" || message.content.includes('!')){
       try {
         const players = bot.players;
         const playerNames = Object.keys(players).map(
           (key) => players[key].username
         );

         const channel = client.channels.cache.get(allowedChannelId);
         if (channel) {
           channel.send(`Jugadores online: ${playerNames}`);
         }
         return;

       } catch (error) {
          const channel = client.channels.cache.get(allowedChannelId);
          if (channel) {
            channel.send(`Error al obtener la lista de jugadores :x:`);
          }
          return;
       }
    }


    console.log(`Message from ${message.author.tag}: ${message.content}`);
    bot.chat(`${message.author.tag}: ${message.content}`);
  }
});




client.login(process.env.DISCORD_TOKEN);

