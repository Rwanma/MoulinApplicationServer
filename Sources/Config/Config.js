

class Config {

    static getDatabaseConfig() {
        const config = require('./config.json');
        return(config.database);
    }
}

module.exports = Config;


//console.log(Config.getDatabaseConfig());