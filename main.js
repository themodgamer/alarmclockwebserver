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

app.use((req, res, next) => {
    commoncode.Log(commoncode.iptranslate(req.ip.toString()),req.method +  " " + req.path);
    res.cookie('ALL', '_ALL_COOKIES', { sameSite: 'none', secure: true})
    next()
  })

//renders all of the pages that must be rendered
commoncode.foerachfile('./renderpages',renderpages)
function renderpages(filename) {
    commoncode.fuse(function () {
        var json = new jsonfunctions.Jsonedit(filename)
        app.get(json.JSON.address, function (req, res) {
            res.render(json.JSON.filename, updateinputs(req,res) )
        })
    });
}

//shares all files that it is supposed to share
commoncode.foerachfile('./sharedfilles',sharefile)
function sharefile(filename) {
    commoncode.fuse(function () {
        var json = new jsonfunctions.Jsonedit(filename)
        app.get(json.JSON.address, function (req, res) {
            res.set("Content-Security-Policy", "default-src 'self'");
            res.sendFile(path.join(__dirname, json.JSON.filename));
        })
    });
}

function refreshweather() {
    setTimeout(refreshweather,1800000)//relaunches it in like 30 minutes
    var jsonfile = new jsonfunctions.Jsonedit("./inputs/Weather.json")
    for (var index = 0; index < 2; index++) {
        var item = jsonfile.JSON[index]
        commoncode.fuse(function () {
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
        });
    }
    jsonfile.applychanges()
}
refreshweather()

function updateinputs(req, res) {
    var Common = require('./inputs/Common.json');
    var UserData = require('./inputs/UserData.json');

    var currentdate = new Date();
    var currentday = currentdate.getDay()-1;
    var currenthour = currentdate.getHours();
    var currentminutes = currentdate.getMinutes()

    var alarmstoday = [];
    Common.subclocktime = "No Alarms Today";

    UserData.Alarms.forEach(element => {
        if (parseInt(element.Day) == currentday) {
            alarmstoday.push({"Day": element.Day, "Time":element.Time})
        }
    });
    

    var closesthour = 90;
    var closestminutes = 90;
    if (alarmstoday.length > 0) {
        alarmstoday.forEach(element => {
            var splitobject = String(element.Time).split(":");
            var hour = parseInt(splitobject[0]);
            var minute = parseInt(splitobject[1]);

            //if hour is larger or same as current time
            if (closestminutes < currentminutes)
                closestminutes = 90;
            if (hour > currenthour || hour == currenthour) {
                
                if (hour == closesthour) {
                    if (minute >= currentminutes && minute < closestminutes) {
                        closestminutes = minute;
                        Common.subclocktime = "Next Alarm " + commoncode.addzero(closesthour) + ":" + commoncode.addzero(closestminutes) + ".";
                    }
                }
                if (hour < closesthour) {
                    closesthour = hour;
                    closestminutes = minute;
                    Common.subclocktime = "Next Alarm " + commoncode.addzero(closesthour) + ":" + commoncode.addzero(closestminutes) + ".";
                }
            }
        });
    }

    //set variables
    Common.clientip = commoncode.iptranslate(req.ip.toString())
    //render everything on server and send to client
    var Weather = require('./inputs/Weather.json');
    var UserData = require('./inputs/UserData.json');
    return { Common, Weather, UserData }
}

app.post('/settingsupdate', urlencodedParser, function (req, res) {
    var jsonfile = new jsonfunctions.Jsonedit('./inputs/UserData.json')
    if (req.body.newalarmdaynum != null && req.body.newalarmtime != null && req.body.newalarmtime != "NaN" && req.body.newalarmdaynum != "Nan" && req.body.newalarmtime != "" && req.body.newalarmdaynum != "") {
        jsonfile.JSON.Alarms.push({"Day":Math.max(Math.min(parseInt(req.body.newalarmdaynum),6),0).toString(),"Time": req.body.newalarmtime });
    }
    jsonfile.applychanges();
    res.redirect('/');
})

https.createServer({key: fs.readFileSync(path.join(__dirname, 'secure.key')),cert: fs.readFileSync(path.join(__dirname, 'secure.cert'))},app).listen(443);
app.listen(80);