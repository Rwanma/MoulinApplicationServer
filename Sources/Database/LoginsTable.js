let DatabaseConnection = require('./DatabaseConnection.js');


class LoginsTable {


    getLoginType(login, password, callback) {
        let dbConnection = DatabaseConnection.getConnection();
        dbConnection.query('select * from LOGINS WHERE login=?', [login], function (error, results) {
            if (error) throw error;
            dbConnection.end();

            let loginRole = '';
            if(results[0] === undefined){
                loginRole = 'wrongPassword';
            }else if(results[0].password === password){
                loginRole = results[0].role;
            }else{
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
