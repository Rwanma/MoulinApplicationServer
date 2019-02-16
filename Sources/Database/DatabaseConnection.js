let mysql = require('mysql');
let Config = require('../Config/Config');


class DatabaseConnection {



    static getConnection() {
        let databaseName=Config.getDatabaseName();

        let connection = mysql.createConnection({
            host: 'localhost',
            user: 'marwan',
            password: 'Findumonde01',
            database: databaseName
        });
        return connection;
    }
}

module.exports = DatabaseConnection;
