let EmployeeTable = require('../Database/EmployeeTable');
let HoursTable = require('../Database/HoursTable');
let Helpers = require('../Helpers/Helpers')


class DateHourUnit {
    constructor(employeeId, paymentType, date, hours) {
        this.employeeId = employeeId;
        this.paymentType = paymentType;
        this.date = date;
        this.hours = hours;
    }
}

class Employee {
    constructor(id, firstName, lastName, salaryTransfer, salaryCash, active) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.salaryTransfer = salaryTransfer;
        this.salaryCash = salaryCash;
        this.active = active;
        this.dateHourUnitForEmployee = [];
    }

    getNumberHoursWorkedFromDate(transformedDate, paymentType) {
        let hours = 0;
        this.dateHourUnitForEmployee.forEach(function (dateHourUnit) {
            if (dateHourUnit.date.getDateInDDMMYYYFormat() === transformedDate &&
                dateHourUnit.paymentType === paymentType) {
                hours = dateHourUnit.hours;
            }
        });
        return hours;
    }

    addDateHourUnitInEmployee(dateHourUnit) {
        this.dateHourUnitForEmployee.push(dateHourUnit);
    }
}


class EmployeeData {
    constructor() {
        this.employeeData = [];
    }


    loadEmployeesAndHours(onlyActiveEmployees, callback) {
        let employeeDatabase = new EmployeeTable();
        let hoursTable = new HoursTable();
        let promises = [];
        let employeeThis = this;
        employeeDatabase.getAllDatabaseEmployees(function (databaseEmployees) {
            databaseEmployees.map((employees) => {
                let employee = new Employee(employees.employee_id, employees.first_name, employees.last_name, employees.salary_transfer, employees.salary_cash, employees.active);
                promises.push(new Promise((resolve) => {
                    hoursTable.getDatabaseHoursForEmployee(employee.id, function (hours) {
                        hours.map((hours) => {
                            let dateWorked = new Helpers.MyDateClass();
                            dateWorked.setDateFromOfficialDateClass(hours.work_date);
                            employee.dateHourUnitForEmployee.push(new DateHourUnit(hours.employee_id, hours.payment_type, dateWorked, hours.hours))
                        });

                        if (onlyActiveEmployees) {
                            if (employee.active == 'TRUE') {
                                employeeThis.employeeData.push(employee);
                            }
                        } else {
                            employeeThis.employeeData.push(employee);
                        }

                        resolve(employee);
                    });
                }));
            });
            Promise.all(promises).then(function () {
                employeeThis.employeeData.sort((employeeA, employeeB) => (employeeA.id - employeeB.id));
                callback(employeeThis);
            })
        })
    }
}



/*let employeeData = new EmployeeData();
employeeData.loadEmployeesAndHours(false, function (employeeData) {
    console.log(employeeData);
});*/



module.exports = {
    DateHourUnit: DateHourUnit,
    EmployeeData: EmployeeData
};