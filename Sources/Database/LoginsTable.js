let DatabaseConnection = require('./DatabaseConnection.js');
let Logger = require('../../Sources/Logger/Logger');
let logger = new Logger();
let SqlString = require('sqlstring');


class LoginsTable {
    getLoginType(login, password, callback) {
        logger.log('LOGIN_TABLE - getLoginType');
        DatabaseConnection.query(SqlString.format('select * from LOGINS WHERE login=?', [login]), function (results) {
            let loginRole = '';
            if (results == null || results[0] === undefined) {
                loginRole = 'wrongPassword';
            } else if (results[0].password === password) {
                loginRole = results[0].role;
            } else {
                loginRole = 'wrongPassword';
            }
            callback(loginRole);
        });
    }
}

module.exports = LoginsTable;

/*let loginsTable = new LoginsTable();
loginsTable.getLoginType('Parents', 'Bakas', function (data) {
    console.log(data);
});*/
