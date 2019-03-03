

class Config {

    static getDatabaseConfig() {
        const config = require('./config.json');
        return(config.database);
    }

    static getPriceConfig() {
        const config = require('./config.json');
        return(config.prices);
    }

    static getLoggerConfig() {
        const config = require('./config.json');
        return(config.logs);
    }
}

module.exports = Config;


//console.log(Config.getDatabaseConfig());