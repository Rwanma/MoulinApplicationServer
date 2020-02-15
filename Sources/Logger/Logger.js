

class Logger {
    constructor(){
        this.logger = require('../../node_modules/logger').createLogger('./moulinApp.log'); // logs to a file
    }

    log(textToLog){
        console.log(textToLog);
    }
}


module.exports = Logger;
