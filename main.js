const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const https = require("https");
const urlencodedParser = bodyParser.urlencoded({extended: false});
app.set('view engine', 'pug');
const jsonfunctions = require('./editjson.js')
const path = require('path');
const fs = require('fs');

function refreshweather() {
    setTimeout(refreshweather,1800000)

    var jsonfile = new jsonfunctions.Jsonedit("./inputs/Weather.json")
    for (var index = 0; index < 1; index++) {
        var item = jsonfile.JSON[index]
        try {
            https.get('https://api.weatherapi.com/v1/forecast.json?key=8c048176fc0d405e80192210221403&alerts=no&days=3&q=' + item.location,res => {
            let data = [];
            res.on('data', chunk => {
                data.push(chunk)
            });
            res.on('end', () => {
                var weatherdata = JSON.parse(Buffer.concat(data).toString());
                item.src[0] = weatherdata.forecast.forecastday[0].day.condition.icon
                item.src[1] = weatherdata.forecast.forecastday[1].day.condition.icon
                item.src[2] = weatherdata.forecast.forecastday[2].day.condition.icon
                item.toptext[0] = weatherdata.forecast.forecastday[0].day.condition.text
                item.toptext[1] = weatherdata.forecast.forecastday[1].day.condition.text
                item.toptext[2] = weatherdata.forecast.forecastday[2].day.condition.text
            })})
        } catch (error) {
            console.log(error)
        }
        
    
    }
    jsonfile.applychanges()
}

refreshweather()

app.get('/', function (req, res) {
    Log(req.ip.toString(),"GET /");
    res.cookie('ALL', '_ALL_COOKIES', { sameSite: 'none', secure: true})

    var Common = require('./inputs/Common.json');
    var UserData = require('./inputs/UserData.json');
    
    
    //if today
    // - add prefix today
    // - if alarm enabled today then
    // - - set selectedTime today at that time
    //if tomorrow
    // - add prefix tomorrow
    // - if alarm enabled tomorrow then
    // - - set selectedtime tomorrow at 07:30


    //set variables
    Common.clientip = iptranslate(req.ip.toString())
    //render everything on server and send to client
    var Weather = require('./inputs/Weather.json');
    var Todolist = require('./inputs/Todolist.json');
    res.render('index', { Common, Weather, Todolist } )
})

function iptranslate(ip) {
    var translatedip = ip;
    if (ip === "::1" || ip === "::ffff:127.0.0.1") {
        translatedip = Object.values(require("os").networkInterfaces())
        .flat()
        .filter((item) => !item.internal && item.family === "IPv4")
        .find(Boolean).address;
    }
    return translatedip;
}

app.get('/settings', function (req, res) {
    Log(req.ip.toString(),"GET /settings");
    res.set("Content-Security-Policy", "default-src 'self'");

    res.render('settings', require('./inputs/UserData.json'))
})

app.get('/alarm.mp3', function (req, res) {
    Log(req.ip.toString(),"GET /alarm");
    res.set("Content-Security-Policy", "default-src 'self'");

    res.sendFile(path.join(__dirname,"./site/alarm.mp3"))
})

app.get('/service-worker', function (req, res) {
    Log(req.ip.toString(),"GET /service-worker");
    res.set("Content-Security-Policy", "default-src 'self'");

    res.sendFile(path.join(__dirname,"./site/service-worker.js"))
})

app.get('/offline.html', function (req, res) {
    res.set("Content-Security-Policy", "default-src 'self'");

    Log(req.ip.toString(),"GET /offline.html");
    res.sendFile(path.join(__dirname,"./site/offline.html"))
})

app.get('/manifest', function (req, res) {
    res.set("Content-Security-Policy", "default-src 'self'");

    Log(req.ip.toString(),"GET /manifest");
    res.sendFile(path.join(__dirname,"./site/main.webmanifest"))
})

app.get('/favicon.png', function (req, res) {
    res.set("Content-Security-Policy", "default-src 'self'");
    Log(req.ip.toString(),"GET /favicon.png");
    res.sendFile(path.join(__dirname,"./site/favicon.png"))
})

app.get('/favicon512.png', function (req, res) {
    res.set("Content-Security-Policy", "default-src 'self'");
    Log(req.ip.toString(),"GET /favicon512.png");
    res.sendFile(path.join(__dirname,"./site/favicon512.png"))
})

app.get('/favicon.ico', function (req, res) {
    res.set("Content-Security-Policy", "default-src 'self'");
    Log(req.ip.toString(),"GET /favicon.ico");
    res.sendFile(path.join(__dirname,"./site/favicon.png"))
})

app.post('/settingsupdate', urlencodedParser, function (req, res) {
    res.set("Content-Security-Policy", "default-src 'self'");
    Log(req.ip.toString(),"POST /settingsupdate");
    var jsonfile = new jsonfunctions.Jsonedit('./inputs/UserData.json')
    jsonfile.applychanges();
    res.redirect('/');
})

app.get('/style', function (req, res) {
    Log(req.ip.toString(),"GET /style");
    res.sendFile(path.join(__dirname, './site/main.css'));
})

app.get('/font', function (req, res) {
    res.set("Content-Security-Policy", "default-src 'self'");
    Log(req.ip.toString(),"GET /font");
    res.sendFile(path.join(__dirname, './site/Smooch.ttf'));
})

app.get('/code', function (req, res) {
    res.set("Content-Security-Policy", "default-src 'self'");
    Log(req.ip.toString(),"GET /code");
    res.sendFile(path.join(__dirname, './site/webpage.js'));
})

app.get('/settingscode', function (req, res) {
    res.set("Content-Security-Policy", "default-src 'self'");
    Log(req.ip.toString(),"GET /settingscode");
    res.sendFile(path.join(__dirname, './site/settings.js'));
})

https.createServer({key: fs.readFileSync(path.join(__dirname, 'secure.key')),cert: fs.readFileSync(path.join(__dirname, 'secure.cert'))},app).listen(443);

function Log(ip,action) {
    var date_ob = new Date();
    console.log("[" + date_ob.getHours() + ":" + date_ob.getMinutes() + "] [" + iptranslate(ip.toString()) + "] [" + action.toString() + "]")
}