const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const express = require('express');
const mongoose = require('mongoose')
const port = process.env.PORT || 4000;
require('dotenv').config();

const token = process.env.TOKEN;
const nightApiToken = process.env.NIGHT_API_TOKEN;
const prefix = process.env.PREFIX;
const mongoUrl = process.env.MONGO_URI;

const categoryChannels = {
    boobs: `1263136134188240946`,
    pussy: `1263136242179117208`,
    ass: '1263136321178701927',
    gonewild: '1263136465140056084',
    anal: '1263136564062588978',
    neko: '1263136707868491827',
    thigh: '1263136816710815787',
    hentai: '1263137882248314911',
    hanal: '1263138248209727519',
    hass: '1263138340962832426',
    hboobs: '1263138406414684203',
    hneko: '1263138460647297127',
    hthigh: '1263138504263729224'
};


let categoryChannelsArray = []
for (a in categoryChannels) {
    categoryChannelsArray.push(a);
}


const redditChannels = {
    gonewild: '1263140118659727381',
    rule34: '1263140255993827439',
    realgirls: '1263140285743890472',
    porn: '1263140374625648774',
    ass: '1263140324667166742',
};

let redditChannelsArray = [];
for (a in redditChannels) {
    redditChannelsArray.push(a);
}

const app = express();
app.get("/", (req, res) => {
    res.status(200).send({
        success: "true"
    });
});

app.get("start", (req, res) => {
    res.send({ running: true });
    client.login(token);
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
    start();
});


async function start() {
    try {
        setInterval(() => {
            sendRandomFromNightApi()
        }, randomNumber(60000 * 45, 60000 * 60));


        setInterval(() => {
            sendRandomFromRedditApi();
        }, randomNumber(60000 * 15, 60000 * 30));
    } catch (err) {
        console.log(err);
    }
}


client.on('messageCreate', async (message) => {
    const args = await message.content.slice(prefix.length).trim().split(/ +/);
    const msgCommand = await args.shift().toLowerCase();

    if (message.author.id == "808318773257437216" && msgCommand == 'send') {
        sendRandomFromNightApi();
    } else if (message.author.id == "808318773257437216" && msgCommand == 'reddit') {

        sendRandomFromRedditApi();
    } else if (message.author.id == "808318773257437216" && msgCommand == 'start') {
        start();
    }

})


main().catch(err => console.log(err));

async function main() {
    await mongoose.connect(mongoUrl);
    console.log("Connected to db")

    client.login(token);
}


const nightApiSchema = new mongoose.Schema({
    id: {
        type: Number,
    }
})
const nightApiModel = mongoose.model('nightApi', nightApiSchema);
const redditApiSchema = new mongoose.Schema({
    link: {
        type: String,
    }
})

const redditApiModel = mongoose.model('redditApi', redditApiSchema);



async function sendRandomFromNightApi() {

    try {
        while(true){

            const randomNum = (Math.floor(Math.random() * categoryChannelsArray.length))
            let i = 0;
            var randomCategoryName, randomCategoryId;
            for (let category in categoryChannels) {
                if (i == randomNum) {
                    randomCategoryName = category;
                    randomCategoryId = categoryChannels[category];
                }
                i++;
            }
            var nsfw = await fetchFromNightApi(randomCategoryName);
            let isUnique = await isUniqueNightApi(nsfw.content.id);
            if(isUnique){
                break;
            }
        }


        const channel = await client.channels.cache.get(randomCategoryId);

        await channel.send(nsfw.content.url)

    } catch (error) {
        console.error("Fetch error:", error);
    }

}

async function isUniqueNightApi(id) {
    let queryResult = await nightApiModel.findOne({ id: id });
    if (queryResult) {
        return false;
    } else {
        let newDoc = new nightApiModel({
            id: id,
        })
        await newDoc.save();
        return true;
    }
}


async function fetchFromNightApi(category) {
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

        return data;

    } catch (error) {
        console.error("Fetch error:", error);
    }
}


async function sendRandomFromRedditApi() {
    try {
        while(true){
            const randomNum = (Math.floor(Math.random() * redditChannelsArray.length))
            let i = 0;
            var randomCategoryName, randomCategoryId;
            for (let category in redditChannels) {
                if (i == randomNum) {
                    randomCategoryName = category;
                    randomCategoryId = redditChannels[category];
                }
                i++;
            }
            var nsfw = await fetchFromRedditApi(randomCategoryName);
            if(isUniqueRedditApi(nsfw.postLink)){
                break;
            }
        }

        const channel = await client.channels.cache.get(randomCategoryId);

        await channel.send(nsfw.preview[(nsfw.preview.length) - 1])

    } catch (error) {
        console.error("Fetch error:", error);

    }

}

async function isUniqueRedditApi(link) {
    let queryResult = await redditApiModel.findOne({ link: link });
    if (queryResult) {
        return false;
    } else {
        let newDoc = new redditApiModel({
            link: link,
        })
        await newDoc.save();
        return true;
    }
}

async function fetchFromRedditApi(subreddit) {
    try {
        console.log(subreddit)
        const response = await fetch(`https://meme-api.com/gimme/${subreddit}`);

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

