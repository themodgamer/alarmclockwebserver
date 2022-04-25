const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

function foerachfile(folderpath,callfunction) {
    var files = fs.readdirSync(folderpath);

    for (var file in files) {
        if (callfunction != null) {
            callfunction(path.join(__dirname,path.join(folderpath,files[file])));
        }
    }
}

function Log(ip,action) {
    var date_ob = new Date();
    console.log(chalk.green("[" + addzero(date_ob.getHours()) + ":" + addzero(date_ob.getMinutes()) + "] [" + iptranslate(ip.toString()) + "] [" + action.toString() + "]"))
}

function addzero(num) {
    if (num < 10) {
        return "0" + num.toString();
    }
    return num.toString();
}

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

module.exports = {foerachfile,Log,iptranslate};