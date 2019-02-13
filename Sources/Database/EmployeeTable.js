let DatabaseConnection = require('./DatabaseConnection.js');



class EmployeeTable {
    constructor() {
        let db = new DatabaseConnection();
        this.connection = db.getConnection();
    }


    getAllDatabaseEmployees(callback) {
        this.connection.query('select * from EMPLOYEES', function (error, results) {
            if (error) throw error;
            callback(results);
        });
    }




    addEmployee(first_name, last_name, salary_cash, salary_transfer, callback) {
        let employeeThis = this;
        this.connection.query(
            'INSERT INTO EMPLOYEES(first_name, last_name, salary_transfer, salary_cash) VALUES (?,?,?,?)',
            [first_name, last_name, salary_cash, salary_transfer], function (error) {
                if (error) throw error;
                employeeThis.getAllDatabaseEmployees(callback);
            });
    }


    modifyEmployee(employee_id, first_name, last_name, salary_cash, salary_transfer, callback) {
        let employeeThis = this;
        this.connection.query('UPDATE EMPLOYEES SET ?, ?, ?, ? WHERE ?',
            [{ first_name: first_name },
                { last_name: last_name },
                { salary_cash: salary_cash },
                { salary_transfer: salary_transfer },
                { employee_id: employee_id }],
            function (error) {
                if (error) throw error;
                employeeThis.getAllDatabaseEmployees(callback);
            });
    }



    deleteEmployee(employee_id, callback) {
        let employeeThis = this;
        this.connection.query('DELETE FROM EMPLOYEES WHERE employee_id=?', [employee_id], function (error) {
            if (error) throw error;
            employeeThis.getAllDatabaseEmployees(callback);
        });
    }
}


module.exports = EmployeeTable;
