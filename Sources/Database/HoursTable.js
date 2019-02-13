let DatabaseConnection = require('./DatabaseConnection.js');


class HoursTable {
    constructor() {
        let db = new DatabaseConnection();
        this.connection = db.getConnection();
    }


    getAllHours(callback) {
        this.connection.query('select * from EMPLOYEE_HOURS', function (error, results) {
            if (error) throw error;
            callback(results);
        });
    }


    getDatabaseHoursForEmployee(employee_id, callback) {
        this.connection.query('select * from EMPLOYEE_HOURS WHERE  employee_id=?', [employee_id], function (error, results) {
            if (error) throw error;
            callback(results);
        });
    }


    addHour(employee_id, payment_type, work_date, hours, callback) {
        let hoursThis = this;
        this.connection.query(
            'INSERT INTO EMPLOYEE_HOURS(employee_id, payment_type, work_date, hours) VALUES (?,?,?,?)',
            [employee_id, payment_type, work_date, hours], function (error) {
                if (error) throw error;
                hoursThis.getAllHours(callback);
            });
    }


    modifyHour(employee_id, payment_type, work_date, hours, callback) {
        let hoursThis = this;
        if (hours === 0) {
            this.connection.query('DELETE FROM EMPLOYEE_HOURS WHERE  employee_id=? AND  payment_type=? AND work_date = ? ', [employee_id, payment_type, work_date], function (error) {
                if (error) throw error;
                hoursThis.getAllHours(callback);
            });
        } else {
            this.connection.query('UPDATE EMPLOYEE_HOURS SET ? WHERE employee_id=? AND payment_type=? AND work_date = ? ',
                [{ hours: hours }, employee_id, payment_type, work_date], function (error) {
                    if (error) throw error;
                    hoursThis.getAllHours(callback);
                });
        }
    }

    updateHours(employee_id, work_date, payment_type, hours, callback) {
        let date = work_date.getDateInDatabaseFormat();
        let hoursThis = this;
        this.connection.query('SELECT hours FROM EMPLOYEE_HOURS WHERE  employee_id=? AND  payment_type=? AND work_date = ? ', [employee_id, payment_type, date], function (error, results) {
            if (error) throw error;
            //console.log(results);
            if (results.length === 0) {
                if (hours !== 0) {
                    hoursThis.connection.query('INSERT INTO EMPLOYEE_HOURS(employee_id, payment_type, work_date, hours) VALUES (?,?,?,?)', [employee_id, payment_type, date, hours], function (error) {
                        if (error) throw error;
                        hoursThis.getAllHours(callback);
                    });
                } else {
                    hoursThis.getAllHours(callback);
                }
            } else {
                if (hours === 0) {
                    hoursThis.connection.query('DELETE FROM EMPLOYEE_HOURS WHERE  employee_id=? AND  payment_type=? AND work_date = ? ', [employee_id, payment_type, date], function (error) {
                        if (error) throw error;
                        hoursThis.getAllHours(callback);
                    });
                } else {
                    hoursThis.connection.query('UPDATE EMPLOYEE_HOURS SET ? WHERE employee_id=? AND payment_type=? AND work_date = ? ', [{ hours: hours }, employee_id, payment_type, date], function (error) {
                        if (error) throw error;
                        hoursThis.getAllHours(callback);
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

