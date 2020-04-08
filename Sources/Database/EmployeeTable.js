let DatabaseConnection = require('./DatabaseConnection.js');
let Logger = require('../../Sources/Logger/Logger');
let logger = new Logger();
let SqlString = require('sqlstring');


class EmployeeTable {

    getAllDatabaseEmployees(callback) {
        logger.log('EMPLOYEE_TABLE - getAllDatabaseEmployees');
        let query = SqlString.format('select * from EMPLOYEES order by employee_id ');
        DatabaseConnection.query(query, function (results) {
            if (results === null) {
                logger.log('EMPLOYEE_TABLE - DATABASE ERROR getAllDatabaseEmployees');
            }
            callback(results);
        });
    }

    getActiveEmployees(callback) {
        logger.log('EMPLOYEE_TABLE - getActiveEmployees');
        let query = SqlString.format('select * from EMPLOYEES where active = "TRUE" order by employee_id ');
        DatabaseConnection.query(query, function (results) {
            if (results === null) {
                logger.log('EMPLOYEE_TABLE - DATABASE ERROR getActiveEmployees');
            }
            callback(results);
        });
    }


    addEmployee(first_name, last_name, salary_cash, salary_transfer, callback) {
        logger.log('EMPLOYEE_TABLE - addEmployee');
        let employeeThis = this;
        let query = SqlString.format('INSERT INTO EMPLOYEES(first_name, last_name, salary_transfer, salary_cash, active) VALUES (?,?,?,?,?)', [first_name, last_name, salary_cash, salary_transfer, 'TRUE']);
        DatabaseConnection.query(query, function (results) {
            if (results === null) {
                logger.log('EMPLOYEE_TABLE - DATABASE ERROR addEmployee');
                callback(results);
            } else {
                employeeThis.getActiveEmployees(callback);
            }
        });
    }


    modifyEmployee(employee_id, first_name, last_name, salary_cash, salary_transfer, callback) {
        logger.log('EMPLOYEE_TABLE - modifyEmployee');
        let employeeThis = this;
        let query = SqlString.format('UPDATE EMPLOYEES SET ?, ?, ?, ? WHERE ?', [{ first_name: first_name }, { last_name: last_name }, { salary_cash: salary_cash }, { salary_transfer: salary_transfer }, { employee_id: employee_id }]);
        DatabaseConnection.query(query, function (results) {
            if (results === null) {
                logger.log('EMPLOYEE_TABLE - DATABASE ERROR modifyEmployee');
                callback(results);

            }else {
                employeeThis.getActiveEmployees(callback);
            }
        });
    }


    setEmployeeToInactive(employee_id, callback) {
        logger.log('EMPLOYEE_TABLE - setEmployeeToInactive');
        let employeeThis = this;
        let query = SqlString.format('UPDATE EMPLOYEES SET ? WHERE ?', [{ active: 'FALSE' }, { employee_id: employee_id }]);
        DatabaseConnection.query(query, function (results) {
            if (results === null) {
                logger.log('EMPLOYEE_TABLE - DATABASE ERROR setEmployeeToInactive');
                callback(results);

            }else {
                employeeThis.getActiveEmployees(callback);
            }
        });
    }



    deleteEmployee(employee_id, callback) {
        logger.log('EMPLOYEE_TABLE - deleteEmployee');
        let employeeThis = this;
        let query = SqlString.format('DELETE FROM EMPLOYEES WHERE employee_id=?', [employee_id]);
        DatabaseConnection.query(query, function (results) {
            if (results === null) {
                logger.log('EMPLOYEE_TABLE - DATABASE ERROR deleteEmployee');
                callback(results);
            }else {
                employeeThis.getActiveEmployees(callback);
            }
        });
    }
}


module.exports = EmployeeTable;


//let employeeTable = new EmployeeTable();

//console.log(new Date);
/*let insertDate = new Date;
console.log(insertDate);*/



/*categoriesTable = new CategoriesTable();

//spendingCategoriesTable.insertCategoryInDatabaseFromCsvFormat();
categoriesTable.deleteCategory("titi", function (results) {
    console.log(results);

});*/

//let insertDate = new Helper.MyDateClass('22/05/2019');