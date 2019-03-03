let DatabaseConnection = require('./DatabaseConnection.js');
let Logger = require('../../Sources/Logger/Logger');
let logger = new Logger();

class HoursTable {


    getAllHours(callback) {
        logger.log('HOURS_TABLE - getAllHours');
        let dbConnection = DatabaseConnection.getConnection();
        dbConnection.query('select * from EMPLOYEE_HOURS order by employee_id, payment_type', function (error, results) {
            if (error){
                logger.log('HOURS_TABLE - DATABASE ERROR getAllHours: ' + error.sqlMessage);
            }
            dbConnection.end();
            callback(results);
        });
    }


    getDatabaseHoursForEmployee(employee_id, callback) {
        logger.log('HOURS_TABLE - getDatabaseHoursForEmployee');
        let dbConnection = DatabaseConnection.getConnection();
        dbConnection.query('select * from EMPLOYEE_HOURS WHERE  employee_id=?', [employee_id], function (error, results) {
            if (error){
                logger.log('HOURS_TABLE - DATABASE ERROR getDatabaseHoursForEmployee: ' + error.sqlMessage);
            }
            dbConnection.end();
            callback(results);
        });
    }


    updateHours(employee_id, work_date, payment_type, hours, callback) {
        logger.log('HOURS_TABLE - updateHours');
        let date = work_date.getDateInDatabaseFormat();
        let hoursThis = this;
        let dbConnection = DatabaseConnection.getConnection();
        dbConnection.query('SELECT hours FROM EMPLOYEE_HOURS WHERE  employee_id=? AND  payment_type=? AND work_date = ? ', [employee_id, payment_type, date], function (error, results) {
            if (error){
                logger.log('HOURS_TABLE - DATABASE ERROR updateHours (select): ' + error.sqlMessage);
            }

            if (results.length === 0) {
                if (hours !== 0) {
                    dbConnection.query('INSERT INTO EMPLOYEE_HOURS(employee_id, payment_type, work_date, hours) VALUES (?,?,?,?)', [employee_id, payment_type, date, hours], function (error) {
                        if (error){
                            logger.log('HOURS_TABLE - DATABASE ERROR updateHours (insert): ' + error.sqlMessage);
                        }
                        dbConnection.end();
                        callback();
                    });
                } else {
                    dbConnection.end();
                    hoursThis.getAllHours(callback);
                }
            } else {
                if (hours === 0) {
                    dbConnection.query('DELETE FROM EMPLOYEE_HOURS WHERE  employee_id=? AND  payment_type=? AND work_date = ? ', [employee_id, payment_type, date], function (error) {
                        if (error){
                            logger.log('HOURS_TABLE - DATABASE ERROR updateHours (delete): ' + error.sqlMessage);
                        }
                        dbConnection.end();
                        callback();
                    });
                } else {
                    dbConnection.query('UPDATE EMPLOYEE_HOURS SET ? WHERE employee_id=? AND payment_type=? AND work_date = ? ', [{ hours: hours }, employee_id, payment_type, date], function (error) {
                        if (error){
                            logger.log('HOURS_TABLE - DATABASE ERROR updateHours (update): ' + error.sqlMessage);
                        }
                        dbConnection.end();
                        callback();
                    });
                }
            }
        });
    }


}


module.exports = HoursTable;

/*let hoursTable = new HoursTable();
hoursTable.updateHours(1,'cash', '2019-01-01', 108, function (results) {
    console.log(results);
});*/

/* {
    console.log(results);
});*/

/*hoursTable.modifyHour(1, 'transfer', '2019-01-07', 0, function (results) {
    console.log(results);
});*/

