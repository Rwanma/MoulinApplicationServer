let mysql = require('mysql');


class DatabaseConnection {
    constructor() {


    }


    getConnection() {
        let connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Sqlpass01',
            database: 'test_database'
        });
        return connection;
    }
}

module.exports = DatabaseConnection;
