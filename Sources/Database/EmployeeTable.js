let DatabaseConnection = require('./DatabaseConnection.js');
let Logger = require('../../Sources/Logger/Logger');
let logger = new Logger();


class EmployeeTable {

    getAllDatabaseEmployees(callback) {
        logger.log('EMPLOYEE_TABLE - getAllDatabaseEmployees');
        let dbConnection = DatabaseConnection.getConnection();
        dbConnection.query('select * from EMPLOYEES order by employee_id', function (error, results) {
            if (error){
                logger.log('EMPLOYEE_TABLE - DATABASE ERROR getAllDatabaseEmployees: ' + error.sqlMessage);
            }
            dbConnection.end();
            callback(results);
        });
    }


    addEmployee(first_name, last_name, salary_cash, salary_transfer, callback) {
        logger.log('EMPLOYEE_TABLE - addEmployee');
        let employeeThis = this;
        let dbConnection = DatabaseConnection.getConnection();
        dbConnection.query(
            'INSERT INTO EMPLOYEES(first_name, last_name, salary_transfer, salary_cash) VALUES (?,?,?,?)',
            [first_name, last_name, salary_cash, salary_transfer], function (error) {
                if (error){
                    logger.log('EMPLOYEE_TABLE - DATABASE ERROR addEmployee: ' + error.sqlMessage);
                }
                dbConnection.end();
                employeeThis.getAllDatabaseEmployees(callback);
            });
    }


    modifyEmployee(employee_id, first_name, last_name, salary_cash, salary_transfer, callback) {
        logger.log('EMPLOYEE_TABLE - modifyEmployee');
        let employeeThis = this;
        let dbConnection = DatabaseConnection.getConnection();
        dbConnection.query('UPDATE EMPLOYEES SET ?, ?, ?, ? WHERE ?',
            [{ first_name: first_name }, { last_name: last_name }, { salary_cash: salary_cash }, { salary_transfer: salary_transfer }, { employee_id: employee_id }],
            function (error) {
                if (error){
                    logger.log('EMPLOYEE_TABLE - DATABASE ERROR modifyEmployee: ' + error.sqlMessage);
                }
                dbConnection.end();
                employeeThis.getAllDatabaseEmployees(callback);
            });
    }



    deleteEmployee(employee_id, callback) {
        logger.log('EMPLOYEE_TABLE - deleteEmployee');
        let employeeThis = this;
        let dbConnection = DatabaseConnection.getConnection();
        dbConnection.query('DELETE FROM EMPLOYEES WHERE employee_id=?', [employee_id], function (error) {
            if (error){
                logger.log('EMPLOYEE_TABLE - DATABASE ERROR deleteEmployee: ' + error.sqlMessage);
            }
            dbConnection.end();
            employeeThis.getAllDatabaseEmployees(callback);
        });
    }
}


module.exports = EmployeeTable;
