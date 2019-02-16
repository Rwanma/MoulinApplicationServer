let mysql = require('mysql');
let Config = require('../Config/Config');


class DatabaseConnection {



    static getConnection() {
        let databaseConfig=Config.getDatabaseConfig();

        //console.log(databaseConfig.name);

        let connection = mysql.createConnection({
            host: databaseConfig.host,
            user: databaseConfig.user,
            password: databaseConfig.password,
            database: databaseConfig.name
        });

        //console.log(connection);
        return connection;
    }
}

module.exports = DatabaseConnection;

// DatabaseConnection.getConnection();