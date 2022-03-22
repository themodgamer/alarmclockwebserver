const fs = require('fs');
const path = require('path');

class Jsonedit {
    constructor(Path) {
        this.Path = Path
        this.JSON = require(Path)
    }

    applychanges() {
        try {
            fs.writeFileSync(path.join(__dirname,this.Path), JSON.stringify(this.JSON,null,2))
        } catch (err) {
            console.error(err)
        }
    }
}


module.exports = {Jsonedit}