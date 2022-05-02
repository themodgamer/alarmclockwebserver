const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const https = require("https");
const urlencodedParser = bodyParser.urlencoded({extended: false});
app.set('view engine', 'pug');
const jsonfunctions = require('./editjson.js')
const path = require('path');
const fs = require('fs');
const commoncode = require('./commoncode.js')

//implements http to https
app.enable('trust proxy')
app.use((req, res, next) => {
    req.secure ? next() : res.redirect('https://' + req.headers.host + req.url)
})

//renders all of the pages that must be rendered
commoncode.foerachfile('./renderpages',renderpages)
function renderpages(filename) {
    try {
        var json = new jsonfunctions.Jsonedit(filename)
        app.get(json.JSON.address, function (req, res) {
            commoncode.Log(commoncode.iptranslate(req.ip.toString()),"GET " + json.JSON.name);
            res.cookie('ALL', '_ALL_COOKIES', { sameSite: 'none', secure: true})
            res.render(json.JSON.filename, updateinputs(req,res) )
        })
    } catch(e) {
        console.warn(e.message);
    }
}

//shares all files that it is supposed to share
commoncode.foerachfile('./sharedfilles',sharefile)
function sharefile(filename) {
    try {
        var json = new jsonfunctions.Jsonedit(filename)
        app.get(json.JSON.address, function (req, res) {
            commoncode.Log(commoncode.iptranslate(req.ip.toString()),"GET " + json.JSON.name);
            res.sendFile(path.join(__dirname, json.JSON.filename));
        })
    } catch(e) {
        console.warn(e.message);
    }
}

function refreshweather() {
    setTimeout(refreshweather,1800000)//relaunches it in like 30 minutes
    var jsonfile = new jsonfunctions.Jsonedit("./inputs/Weather.json")
    for (var index = 0; index < 2; index++) {
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
function updateinputs(req, res) {
    var Common = require('./inputs/Common.json');
    var UserData = require('./inputs/UserData.json');
    
    //find one with the closets hour

    var selectedindex 
    //set variables
    Common.clientip = commoncode.iptranslate(req.ip.toString())
    //render everything on server and send to client
    var Weather = require('./inputs/Weather.json');
    var UserData = require('./inputs/UserData.json');
    return { Common, Weather, UserData }
}

app.post('/settingsupdate', urlencodedParser, function (req, res) {
    res.set("Content-Security-Policy", "default-src 'self'");
    commoncode.Log(req.ip.toString(),"POST /settingsupdate");
    console.log(req.body)
    var jsonfile = new jsonfunctions.Jsonedit('./inputs/UserData.json')
    jsonfile.applychanges();
    res.redirect('/');
})

https.createServer({key: fs.readFileSync(path.join(__dirname, 'secure.key')),cert: fs.readFileSync(path.join(__dirname, 'secure.cert'))},app).listen(443);
app.listen(80);