let mysql = require('mysql');


class DatabaseConnection {



    static getConnection() {
        let connection = mysql.createConnection({
            host: 'localhost',
            user: 'marwan',
            password: 'Findumonde01',
            database: 'test_database2'
        });
        return connection;
    }
}

module.exports = DatabaseConnection;
