let mysql = require('mysql');
let Config = require('../Config/Config');
let Logger = require('../../Sources/Logger/Logger');
let logger = new Logger();

class DatabaseConnection {

    static getConnection() {
        let databaseConfig = Config.getDatabaseConfig();
        return mysql.createConnection({
            host: databaseConfig.host,
            user: databaseConfig.user,
            password: databaseConfig.password,
            database: databaseConfig.name
        });
    }

    static query(query, callback) {
        console.log('******************** New Query ********************');
        logger.log('DatabaseConnection query : ' + query);

        let dbConnection = DatabaseConnection.getConnection();
        dbConnection.query(query, function (error, results) {
            let returnQuery = results;
            if (error) {
                console.log('Query FAILED');
                console.log(error);
                returnQuery = null;
            }
            console.log('******************** End Query ********************');
            dbConnection.end();
            callback(returnQuery);
        });
    }


}

module.exports = DatabaseConnection;
