

class Config {

    static getDatabaseName() {
        const config = require('./config.json');
        console.log(config);
        return(config.database.name);
    }
}

module.exports = Config;


//console.log(Config.getDatabaseName());