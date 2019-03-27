

class Logger {
    constructor(){
        this.logger = require('../../node_modules/logger').createLogger('./moulinApp.log'); // logs to a file
    }

    log(textToLog){
        this.logger.info(textToLog);
    }
}


module.exports = Logger;
