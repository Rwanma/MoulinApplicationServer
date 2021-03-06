let DatabaseConnection = require('./DatabaseConnection.js');
let Logger = require('../../Sources/Logger/Logger');
let logger = new Logger();
let SqlString = require('sqlstring');
let Helper = require('../Helpers/Helpers.js');



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
        if (hours === 0 || hours === '0') {
            sqlQuery = SqlString.format('DELETE FROM EMPLOYEE_HOURS WHERE  employee_id=? AND  payment_type=? AND work_date = ? ', [employee_id, payment_type, date]);
        } else {
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
        let sqlQuery = SqlString.format('SELECT ROUND(SUM(H.hours * E.salary_' + paymentType + '),2) AS \'total\' FROM EMPLOYEE_HOURS H, EMPLOYEES E WHERE H.employee_id = E.employee_id AND H.work_date >= ? AND H.work_date <= ? AND H.payment_type = ?',
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


    getTotalWorkHours(jsonObj, beginDate, endDate, callback) {
        logger.log('HOURS_TABLE - getTotalWorkHours');
        let sqlQuery = SqlString.format('select sum(hours) as totalWorkedHours from EMPLOYEE_HOURS where work_date >= ? and work_date <= ?', [beginDate, endDate]);

        DatabaseConnection.query(sqlQuery, function (result) {
            if (result === null) {
                logger.log('DAILY_INPUT_TABLE - DATABASE ERROR getAverageIncomePerDay');
            }
            jsonObj.totalWorkedHours = result[0].totalWorkedHours;
            callback(jsonObj);
        });
    }


    getAverageHoursWorkedPerDay(jsonObj, beginDate, endDate, callback) {
        let dbBeginDate = beginDate.getDateInDatabaseFormat(), dbEndDate = endDate.getDateInDatabaseFormat() ;
        logger.log('HOURS_TABLE - getAverageHoursWorkedPerDay');
        let sqlQuery = SqlString.format('select sum(sum_per_day) as totalWorkedHours from ( select sum(hours) as sum_per_day from EMPLOYEE_HOURS where work_date >= ? and work_date <= ? group by work_date) as inner_query',
            [dbBeginDate, dbEndDate]);

        DatabaseConnection.query(sqlQuery, function (result) {
            if (result === null) {
                logger.log('DAILY_INPUT_TABLE - DATABASE ERROR getAverageIncomePerDay');
            }
            let averageWorkedHoursPerDay = Math.round(result[0].totalWorkedHours /
                Helper.getNumberOfDaysBetweenDates(beginDate.getOfficialJavascriptDate(), endDate.getOfficialJavascriptDate())
                * 100) / 100;
            jsonObj.averageWorkedHoursPerDay = averageWorkedHoursPerDay;
            callback(jsonObj);
        });

    }

    getAverageSalaryPaymentPerDay(jsonObj, beginDate, endDate, callback) {
        logger.log('HOURS_TABLE - getAverageSalaryPaymentPerDay');
        let dbBeginDate = beginDate.getDateInDatabaseFormat(), dbEndDate = endDate.getDateInDatabaseFormat() ;
        let sumCashPerDay = 0, sumTransferPerDay = 0;
        let sqlSumCash = SqlString.format('select sum(sum_per_day) as sumCashPerDay from (select H.work_date, sum((H.hours*E.salary_cash)) as sum_per_day from EMPLOYEES E, EMPLOYEE_HOURS H where E.employee_id = H.employee_id and H.payment_type=\'cash\' and H.work_date >= ? and H.work_date <= ? group by H.work_date) as inner_query',
            [dbBeginDate, dbEndDate]);
        let sqlSumTransfer = SqlString.format('select sum(sum_per_day) as sumTransferPerDay from (select H.work_date, sum((H.hours*E.salary_transfer)) as sum_per_day from EMPLOYEES E, EMPLOYEE_HOURS H where E.employee_id = H.employee_id and H.payment_type=\'transfer\' and H.work_date >= ? and H.work_date <= ? group by H.work_date) as inner_query',
            [dbBeginDate, dbEndDate]);

        new Promise(function(resolve) {
            DatabaseConnection.query(sqlSumCash, function (result) {
                if (result === null) {
                    logger.log('DAILY_INPUT_TABLE - DATABASE ERROR getAverageCashIncomePerDay');
                } else {
                    sumCashPerDay = result[0].sumCashPerDay;
                }
                resolve(1);
            });
        }).then(function() {
            return new Promise(function(resolve) {
                DatabaseConnection.query(sqlSumTransfer, function (result) {
                    if (result === null) {
                        logger.log('DAILY_INPUT_TABLE - DATABASE ERROR getAverageTransferIncomePerDay');
                    } else {
                        sumTransferPerDay = result[0].sumTransferPerDay;
                    }
                    resolve(1);
                });
            });
        }).then(function(result) {
            let numberOfDaysBetween = Helper.getNumberOfDaysBetweenDates(beginDate.getOfficialJavascriptDate(), endDate.getOfficialJavascriptDate());
            jsonObj.averageSalariesPaymentPerDay = Math.round((sumCashPerDay + sumTransferPerDay) / numberOfDaysBetween * 100) / 100;
            callback(jsonObj);
        })
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

