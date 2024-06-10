const Vec3 = require("vec3");
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const mineflayer = require("mineflayer");
require("dotenv").config();
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/////////////////////////////////
const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("I'm running");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
/////////////////////////////////
let isEating = false;
let reconnectAttempts = 0;
let bot;
let maxReconnectAttempts = 10;

const allowedChannelId = "1245908223891083274";
let bot2
let reconnectAttempts2 = 0;
let maxReconnectAttempts2 = 10;
// let entityTrackName = "wither_skeleton"; //This word in lowercase ensure
// let radiusToDetect = 6; //Default and bypass any suspicious


function createBot() {
  bot = mineflayer.createBot({
    host: "pandorab.org",
    username: "elteno",
  });

  bot.once("physicsTick", () => {
    console.log("Bot conectado y listo para la acción!");
    checkHunger();
    attackNearestZombie();
  });

  bot.on("health", () => {
    console.log("mI vida: " + bot.health);
    console.log("mI cOMIDA: " + bot.food);

    if (bot.food < 14) {
      eatFood()
        .then(() => {
          setTimeout(checkHunger, 1000); // Revisa de nuevo después de comer
        })
        .catch((err) => {
          console.error("Error comiendo: ", err);
          setTimeout(checkHunger, 1000); // Intenta de nuevo si hubo un error
        });
    } else {
      setTimeout(checkHunger, 1000); // Sigue revisando el hambre cada segundo
    }
  });
  // Modificar la función eatFood para imprimir el mensaje cada vez que se invoca
  async function eatFood() {
    const foodItem = bot.inventory?.items().find(item => item.name.includes("cooked_porkchop"));
    if (foodItem) {
      try {
        await bot.equip(foodItem, "hand");
        await bot.consume();
      } catch (err) {
        console.log(`Error al comer: ${err.message}`);
      }
    }
  }
  function checkHunger() {
    if (bot.food < 20 && !isEating) {
      isEating = true;
      eatFood()
        .then(() => {
          isEating = false;
          setTimeout(checkHunger, 2000); // Revisa de nuevo después de comer
        })
        .catch((err) => {
          isEating = false;
          console.error("Error comiendo: ", err);
          setTimeout(checkHunger, 2000); // Intenta de nuevo si hubo un error
        });
    } else {
      setTimeout(checkHunger, 2000); // Sigue revisando el hambre cada segundo
    }
  }

  function attack(entity) {
    bot.attack(entity);
  }

  function attackNearestZombie() {
    function equipBestSword() {
      // find swords in the inventory with 'sword'
      const swords = bot.inventory?.items().filter((item) => item.name.includes("sword"));

      // order by damage
      swords.sort((a, b) => {
        const getDamage = (item) => {
          // here for determine the best sword for future
          return 0; // return default 0, and really it doest affect nothing
        };

        return getDamage(b) - getDamage(a);
      });

      if (swords.length > 0) {
        const bestSword = swords[0];
        bot.equip(bestSword, "hand", (err) => {
          if (err) {
            console.log("Error al equipar la espada:", err);
          } else {
            console.log("Espada equipada:", bestSword.name);
          }
        });
      } else {
        console.log("No se encontraron espadas en el inventario.");
      }
    }

    const intervalId = setInterval(() => {
      if (isEating || bot.food < 20) return;
      equipBestSword(); // ensure for equip best Sword
        let blacklist = ['experience_orb', 'player', 'wolf']
        try {
          // let target = bot.entityAtCursor();
          // if (!target) bot.swingArm(); // Just swing at air
          // bot.attack(target);
          var entity = bot.entityAtCursor(3.5);
          if (!entity) return;
          if(blacklist.includes(entity.name)) return;
          bot.attack(entity, true)

        } catch (error) {
          console.error("Error al atacar:", error.message);
        }

      // const entityToTrack = bot.nearestEntity((entity) => {
      //   return (
      //     entity.name.toLowerCase() == entityTrackName &&
      //     entity.position.distanceTo(bot.entity.position) <= radiusToDetect
      //   ); // track entity name and && only radius default i recommend 5
      // });

      // if (entityToTrack) {
      //   const entityToTrackPosition = new Vec3(
      //     entityToTrack.position.x,
      //     entityToTrack.position.y,
      //     entityToTrack.position.z
      //   );

      //   console.log(`There is an ${entityToTrack} nearby. I am attacking it`);
      //   bot.lookAt(
      //     entityToTrackPosition.offset(0, entityToTrack.height, 0),
      //     true,
      //     attack(entityToTrack)
      //   );
      // } else {
      //   console.log(`There is no ${entityToTrack} nearby.`);
      // }

      // LO HICE LA PEDO XDDDD //
    }, 1000); // Repeat every second
  }

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
        if (username.includes("elteno")) {
          return;
        }
        channel.send(`${clan}${username}: ${message}`);
        console.log(`${clan}${username}: ${message}`);
      } else {
        const channel = client.channels.cache.get(allowedChannelId);
        const username = parsedMessage.unsigned.with[0].extra[0].text;
        const message = parsedMessage.unsigned.with[0].extra[2].text;
        if (username.includes("elteno")) {
          return;
        }
        channel.send(`${username}: ${message}`);
        console.log(`${username}: ${message}`);
      }
    }
  });

  bot.on("spawn", () => {
    const channel = client.channels.cache.get(allowedChannelId);
    if (channel) {
      channel.send(
        ":white_check_mark: Bot encendido y conectado al servidor. "
      );
    }

    bot.chat("/login [OCULTO]");
  });

  bot.on("kicked", async (reason, loggedIn) => {
    const channel = client.channels.cache.get(allowedChannelId);
    let reason_value;
    try {
      reason_value = reason.value.translate.value;
    } catch (e) {
      reason_value = reason.value;
    }
    console.log(reason_value);
    if (channel) {
      const embed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle(
          `:octagonal_sign: Bot botado del servidor por: ${reason_value} `
        );

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
  });

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

function createBot2(){
  bot2 = mineflayer.createBot({
    host: "pandorab.org",
    username: "RisingetT3Q",
  });

  bot2.on("spawn", () => {
    const channel = client.channels.cache.get(allowedChannelId);
    if (channel) {
      channel.send(
        ":white_check_mark: Bot encendido y conectado al servidor. "
      );
    }

    bot2.chat("/login [OCULTO]");
  });

  bot2.on("kicked", async (reason, loggedIn) => {
    const channel = client.channels.cache.get(allowedChannelId);
    let reason_value;
    try {
      reason_value = reason.value.translate.value;
    } catch (e) {
      reason_value = reason.value;
    }
    console.log(reason_value);
    if (channel) {
      const embed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle(
          `:octagonal_sign: RisingetT3Q Bot botado del servidor por: ${reason_value} `
        );

      channel.send({ embeds: [embed] });
    }

    if (reconnectAttempts2 < maxReconnectAttempts2) {
      reconnectAttempts2++;
      await delay(2 * 60 * 1000); // Espera 2 minutos antes de intentar reconectar
      createBot2(); // Intenta reconectar
    } else {
      console.log("Máximo número de intentos de reconexión alcanzado.");
      if (channel) {
        channel.send("Máximo número de intentos de reconexión alcanzado.");
      }
    }
  });

  bot2.on("end", async () => {
    console.log("Bot desconectado del servidor.");
    if (reconnectAttempts2 < maxReconnectAttempts2) {
      reconnectAttempts2++;
      await delay(2 * 60 * 1000); // Espera 2 minutos antes de intentar reconectar
      createBot2(); // Intenta reconectar
    } else {
      console.log("Máximo número de intentos de reconexión alcanzado.");
      const channel = client.channels.cache.get(allowedChannelId);
      if (channel) {
        channel.send("Máximo número de intentos de reconexión alcanzado. RisingetT3Q");
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

client.once("ready",async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  createBot(); // Crear y conectar el bot de Minecraft al iniciar el bot de Discord
  await delay(5000);
  createBot2();
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

    if (message.content === "!playerlist" || message.content.includes("!")) {
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
