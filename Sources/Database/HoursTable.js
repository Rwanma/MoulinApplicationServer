let DatabaseConnection = require('./DatabaseConnection.js');
let Logger = require('../../Sources/Logger/Logger');
let logger = new Logger();
let SqlString = require('sqlstring');


class HoursTable {


    getAllHours(callback) {
        logger.log('HOURS_TABLE - getAllHours');
        DatabaseConnection.query(SqlString.format('select * from EMPLOYEE_HOURS order by employee_id, payment_type'), function (results) {
            if (results === null) {
                logger.log('HOURS_TABLE - DATABASE ERROR getAllHours');
            }
            callback(results);
        });
    }


    getDatabaseHoursForEmployee(employee_id, callback) {
        logger.log('HOURS_TABLE - getDatabaseHoursForEmployee');
        DatabaseConnection.query(SqlString.format('select * from EMPLOYEE_HOURS WHERE  employee_id=?', [employee_id]), function (results) {
            if (results === null) {
                logger.log('HOURS_TABLE - DATABASE ERROR getDatabaseHoursForEmployee');
            }
            callback(results);
        });
    }


    updateHours(employee_id, work_date, payment_type, hours, callback) {
        logger.log('HOURS_TABLE - updateHours');
        let date = work_date.getDateInDatabaseFormat();

        let sqlQuery = '';
        if (hours === 0) {
            sqlQuery = SqlString.format('DELETE FROM EMPLOYEE_HOURS WHERE  employee_id=? AND  payment_type=? AND work_date = ? ', [employee_id, payment_type, date]);
        }
        else {
            sqlQuery = SqlString.format('INSERT INTO EMPLOYEE_HOURS(employee_id, payment_type, work_date, hours) VALUES (?,?,?,?)' +
                'ON DUPLICATE KEY UPDATE hours=?', [employee_id, payment_type, date, hours, hours])
        }

        DatabaseConnection.query(sqlQuery, function (results) {
            if (results === null) {
                logger.log('HOURS_TABLE - DATABASE ERROR updateHours');
            }
            callback(results);
        });
    }

    getEmployeeTotalInJson(jsonObj, beginDate, endDate, paymentType, callback) {
        logger.log('HOURS_TABLE - setEmployeeTotalInJson');
        let sqlQuery = SqlString.format('SELECT ROUND(SUM(H.hours * E.salary_' + paymentType +'),2) AS \'total\' FROM EMPLOYEE_HOURS H, EMPLOYEES E WHERE H.employee_id = E.employee_id AND H.work_date >= ? AND H.work_date <= ? AND H.payment_type = ?',
            [beginDate, endDate, paymentType]);

        DatabaseConnection.query(sqlQuery, function (results) {
            if (results === null) {
                logger.log('HOURS_TABLE - DATABASE ERROR setEmployeeTotalInJson');
            } else {
                paymentType === 'cash' ? jsonObj.employeeCashTotal = results[0].total : jsonObj.employeeTransferTotal = results[0].total;
            }
            callback();
        });
    }
}


module.exports = HoursTable;


/*
let hoursTable = new HoursTable();

hoursTable.getEmployeeTotalInJson(jsonObj, '2019-08-01', '2019-08-30', 'cash', function (results) {
  console.log(results.employeeCashTotal);
});
*/


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

