let Config = require('../Config/Config');






class Logger {
    constructor(){
        let logConfig=Config.getLoggerConfig();
        const pino = require('pino');
        this.logger = require('pino')( pino.destination('./moulinApp.log'));
    }

    log(textToLog){
        this.logger.info(textToLog);
    }

}


module.exports = Logger;
