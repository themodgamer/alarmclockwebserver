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
    https.get('https://api.weatherapi.com/v1/forecast.json?key=8c048176fc0d405e80192210221403&q=Bodo&alerts=yes&days=3',res => {
        let data = [];
        res.on('data', chunk => {
            data.push(chunk)
        });
        res.on('end', () => {
            var weatherdata = JSON.parse(Buffer.concat(data).toString());
            var jsonfile = new jsonfunctions.Jsonedit("./inputs/index.json")

            jsonfile.JSON.weathersrc[0] = weatherdata.forecast.forecastday[0].day.condition.icon
            jsonfile.JSON.weathersrc[1] = weatherdata.forecast.forecastday[1].day.condition.icon
            jsonfile.JSON.weathersrc[2] = weatherdata.forecast.forecastday[2].day.condition.icon

            jsonfile.JSON.weathertoptext[0] = weatherdata.forecast.forecastday[0].day.condition.text
            jsonfile.JSON.weathertoptext[1] = weatherdata.forecast.forecastday[1].day.condition.text
            jsonfile.JSON.weathertoptext[2] = weatherdata.forecast.forecastday[2].day.condition.text

            jsonfile.JSON.weatherbottomtext[0] = weatherdata.forecast.forecastday[0].day.avgtemp_c + "°c  " + weatherdata.forecast.forecastday[0].day.maxwind_kph + "kmh"
            jsonfile.JSON.weatherbottomtext[1] = weatherdata.forecast.forecastday[1].day.avgtemp_c + "°c  " + weatherdata.forecast.forecastday[1].day.maxwind_kph + "kmh"
            jsonfile.JSON.weatherbottomtext[2] = weatherdata.forecast.forecastday[2].day.avgtemp_c + "°c  " + weatherdata.forecast.forecastday[2].day.maxwind_kph + "kmh"
            jsonfile.applychanges()
        })
    })
    
}
refreshweather();


app.get('/', function (req, res) {
    Log(req.ip.toString(),"GET /");
    var renderinput = require('./inputs/index.json')
    var settings = require('./inputs/settings.json');
    var date_ob = new Date();
    thattime = new Date("2022-01-01T" + settings.daysvalue[date_ob.getDay()-1] + ":00")
    var selectedTime = "Alarm Disabled"
    if (thattime.getHours() < date_ob.getHours()) {
        selectedTime = "Alarm Disabled Tomorrow"
        if (settings.daysactive[date_ob.getDay()] == "on") {
            selectedTime = "Next Alarm Tomorrow " + settings.daysvalue[date_ob.getDay()] + ".";
        }
    } else {
        if (settings.daysactive[date_ob.getDay()-1] == "on") {
            selectedTime = "Next Alarm " + settings.daysvalue[date_ob.getDay()-1] + ".";
        }
    }
    renderinput.examplesubclocktime = selectedTime;
    renderinput.clientip = iptranslate(req.ip.toString())
    
    res.render('index', renderinput)
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
    res.render('settings', require('./inputs/settings.json'))
})

app.get('/alarm.mp3', function (req, res) {
    Log(req.ip.toString(),"GET /alarm");
    res.sendFile(path.join(__dirname,"./site/alarm.mp3"))
})

app.get('/service-worker', function (req, res) {
    Log(req.ip.toString(),"GET /service-worker");
    res.sendFile(path.join(__dirname,"./site/service-worker.js"))
})

app.get('/offline.html', function (req, res) {
    Log(req.ip.toString(),"GET /offline.html");
    res.sendFile(path.join(__dirname,"./site/offline.html"))
})

app.get('/manifest', function (req, res) {
    Log(req.ip.toString(),"GET /manifest");
    res.sendFile(path.join(__dirname,"./site/main.webmanifest"))
})

app.get('/favicon.png', function (req, res) {
    Log(req.ip.toString(),"GET /favicon.png");
    res.sendFile(path.join(__dirname,"./site/favicon.png"))
})

app.get('/favicon512.png', function (req, res) {
    Log(req.ip.toString(),"GET /favicon512.png");
    res.sendFile(path.join(__dirname,"./site/favicon512.png"))
})

app.get('/favicon.ico', function (req, res) {
    Log(req.ip.toString(),"GET /favicon.ico");
    res.sendFile(path.join(__dirname,"./site/favicon.png"))
})

app.post('/settingsupdate', urlencodedParser, function (req, res) {
    Log(req.ip.toString(),"POST /settingsupdate");
    var settings = require('./inputs/settings.json');
    settings.daysvalue[0] = req.body.Mondaytime;
    settings.daysvalue[1] = req.body.Tuesdaytime;
    settings.daysvalue[2] = req.body.Wednesdaytime;
    settings.daysvalue[3] = req.body.Thursdaytime;
    settings.daysvalue[4] = req.body.Fridaytime;
    settings.daysvalue[5] = req.body.Saturdaytime;
    settings.daysvalue[6] = req.body.Sundaytime;
    settings.daysactive[0] = req.body.Monday;
    settings.daysactive[1] = req.body.Tuesday;
    settings.daysactive[2] = req.body.Wednesday;
    settings.daysactive[3] = req.body.Thursday;
    settings.daysactive[4] = req.body.Friday;
    settings.daysactive[5] = req.body.Saturday;
    settings.daysactive[6] = req.body.Sunday;
    
    try {
        fs.writeFileSync(path.join(__dirname,"./inputs/settings.json"), JSON.stringify(settings))
    } catch (err) {
        console.err(err)
    }

    res.redirect('/');
})

app.get('/style', function (req, res) {
    Log(req.ip.toString(),"GET /style");
    res.sendFile(path.join(__dirname, './site/main.css'));
})

app.get('/font', function (req, res) {
    Log(req.ip.toString(),"GET /font");
    res.sendFile(path.join(__dirname, './site/Smooch.ttf'));
})

app.get('/code', function (req, res) {
    Log(req.ip.toString(),"GET /code");
    res.sendFile(path.join(__dirname, './site/webpage.js'));
})

app.get('/settingscode', function (req, res) {
    Log(req.ip.toString(),"GET /settingscode");
    res.sendFile(path.join(__dirname, './site/settings.js'));
})

https.createServer({key: fs.readFileSync(path.join(__dirname, 'secure.key')),cert: fs.readFileSync(path.join(__dirname, 'secure.cert'))},app).listen(443);

function Log(ip,action) {
    var date_ob = new Date();
    console.log("[" + date_ob.getHours() + ":" + date_ob.getMinutes() + "] [" + iptranslate(ip.toString()) + "] [" + action.toString() + "]")
}