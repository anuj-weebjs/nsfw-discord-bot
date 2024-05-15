const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const express = require('express');
const mongoose = require('mongoose')
const port = process.env.PORT || 4000;
require('dotenv').config();

const token = process.env.TOKEN;
const nightApiToken = process.env.NIGHT_API_TOKEN;
const prefix = process.env.PREFIX;

const categoryChannels = {
    boobs: `1240086165109866527`,
    pussy: `1240096604694773780`,
    ass: '1240100073111814187',
    gonewild: '1240124489459564554',
    anal: '1240124444484304926',
    neko: '1240124847892205719',
    thigh: '1240128537965498378',
    hentai: '1240124671869849693',
    hanal: '1240124537404657748',
    hass: '1240124603309752373',
    hboobs: '1240124643550040108',
    hneko: '1240124777948250153',
    hthigh: '1240124820583354498'
};
let categoryChannelsArray = []
for (a in categoryChannels) {
    categoryChannelsArray.push(a);
}

const app = express();
app.get("/", (req, res) => {
    res.status(200).send({
        success: "true"
    });
});
app.listen(port);





const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ]
})

client.on('ready', async (client) => {
    console.log(`Logged In as ${client.user.tag}`);
    setInterval(() => {
        sendRandom()
    }, randomNumber(60000 * 45, 60000 * 60));
});

client.on('messageCreate', async (message) => {
    const args = await message.content.slice(prefix.length).trim().split(/ +/);
    const msgCommand = await args.shift().toLowerCase();

})


client.login(token);



async function sendRandom() {
    // const b = categoryChannels.categoryChannelsArray[(Math.floor(Math.random() * categoryChannelsArray.length))]
    const randomNum = (Math.floor(Math.random() * categoryChannelsArray.length))
    let i = 0;
    let randomCategoryName, randomCategoryId;
    for(let category in categoryChannels){
        if(i == randomNum){
            randomCategoryName = category;
            randomCategoryId = categoryChannels[category];
        }
        i++;
    }
    const nsfw = await fetchNsfwImage(randomCategoryName);
    const channel = await client.channels.cache.get(randomCategoryId);
    
    // console.log(nsfw)
    await channel.send(nsfw.content.url)



}


async function fetchNsfwImage(category) {
    try {
        const response = await fetch(`https://api.night-api.com/images/nsfw/${category}`, {
            headers: {
                'authorization': `${nightApiToken}`,
            }
        });

        if (!response) {
            throw new Error(`No Response from api`);
        }
        const data = await response.json();
        data.code = 200;
        console.log(data)
        return data;

    } catch (error) {
        console.error("Fetch error:", error);
    }
}

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}