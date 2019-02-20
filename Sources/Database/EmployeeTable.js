let DatabaseConnection = require('./DatabaseConnection.js');



class EmployeeTable {

    getAllDatabaseEmployees(callback) {
        let dbConnection = DatabaseConnection.getConnection();
        dbConnection.query('select * from EMPLOYEES order by employee_id', function (error, results) {
            if (error) throw error;
            dbConnection.end();
            callback(results);
        });
    }


    addEmployee(first_name, last_name, salary_cash, salary_transfer, callback) {
        let employeeThis = this;
        let dbConnection = DatabaseConnection.getConnection();
        dbConnection.query(
            'INSERT INTO EMPLOYEES(first_name, last_name, salary_transfer, salary_cash) VALUES (?,?,?,?)',
            [first_name, last_name, salary_cash, salary_transfer], function (error) {
                if (error) throw error;
                dbConnection.end();
                employeeThis.getAllDatabaseEmployees(callback);
            });
    }


    modifyEmployee(employee_id, first_name, last_name, salary_cash, salary_transfer, callback) {
        let employeeThis = this;
        let dbConnection = DatabaseConnection.getConnection();
        dbConnection.query('UPDATE EMPLOYEES SET ?, ?, ?, ? WHERE ?',
            [{ first_name: first_name }, { last_name: last_name }, { salary_cash: salary_cash }, { salary_transfer: salary_transfer }, { employee_id: employee_id }],
            function (error) {
                if (error) throw error;
                dbConnection.end();
                employeeThis.getAllDatabaseEmployees(callback);
            });
    }



    deleteEmployee(employee_id, callback) {
        let employeeThis = this;
        let dbConnection = DatabaseConnection.getConnection();
        dbConnection.query('DELETE FROM EMPLOYEES WHERE employee_id=?', [employee_id], function (error) {
            if (error) throw error;
            dbConnection.end();
            employeeThis.getAllDatabaseEmployees(callback);
        });
    }
}


module.exports = EmployeeTable;
