

class Config {

    static getDatabaseConfig() {
        const config = require('./config.json');
        return(config.database);
    }

    static getPriceConfig() {
        const config = require('./config.json');
        return(config.prices);
    }
}

module.exports = Config;


//console.log(Config.getDatabaseConfig());