let Employees = require('./Employees');
let Helper = require('../Helpers/Helpers.js');



fillEmployeeDefaultColumnsInJson = function (jsonArray, id, firstName, lastName, type) {
    jsonArray['Employee Id'] = id;
    jsonArray['Employee Name'] = firstName + ' ' + lastName;
    jsonArray['Payment Type'] = type;
};

addPaymemtUnitIntoJsonArrayForEmployee = function (employeeJsonArrayWorkedHour, employeeJsonArrayMoney, employee, dateArray, type, totalHoursWorkedInDayMap, totalSalaryPaidInDayMap) {
    dateArray.forEach(function (date) {
        let transformedDate = date.getDateInDDMMYYYFormat();
        let hoursWorkedInADay = employee.getNumberHoursWorkedFromDate(transformedDate, type);
        if (hoursWorkedInADay !== 0) {
            employeeJsonArrayWorkedHour[transformedDate] = hoursWorkedInADay;
            totalHoursWorkedInDayMap.has(transformedDate) ? totalHoursWorkedInDayMap.set(transformedDate, totalHoursWorkedInDayMap.get(transformedDate) + hoursWorkedInADay) : totalHoursWorkedInDayMap.set(transformedDate, hoursWorkedInADay);

            let salaryTypePaidInADay = (type === 'cash') ? (hoursWorkedInADay * employee.salaryCash) : (hoursWorkedInADay * employee.salaryTransfer);
            totalSalaryPaidInDayMap.has(transformedDate) ? totalSalaryPaidInDayMap.set(transformedDate, totalSalaryPaidInDayMap.get(transformedDate) + salaryTypePaidInADay) : totalSalaryPaidInDayMap.set(transformedDate, salaryTypePaidInADay);

            employeeJsonArrayMoney[transformedDate] = salaryTypePaidInADay;
        }
    });
};

fillTotalJsons = function (totalJson, totalMap, typeofTotal) {
    totalJson['Employee Id'] = typeofTotal;
    totalMap.forEach(function (value, key) {
        totalJson[key] = value;
    });
};

class EmployeeHours {

    getHoursForEmployeesInJson(beginDate, endDate, callback) {
        let jsonObj = { columns: [], data: [], dataSalary: [], totalPayment: [] };

        let columnTitleArray = [];
        columnTitleArray.push({
            headerName: 'Employee Id',
            field: 'Employee Id',
            pinned: 'left',
            filter: 'agTextColumnFilter',
            editable: false
        });
        columnTitleArray.push({
            headerName: 'Employee Name',
            field: 'Employee Name',
            pinned: 'left',
            filter: 'agTextColumnFilter',
            editable: false
        });
        columnTitleArray.push({
            headerName: 'Payment Type',
            field: 'Payment Type',
            pinned: 'left',
            filter: 'agTextColumnFilter',
            editable: false
        });

        let dateArray = Helper.getDatesRangeArray(beginDate.getOfficialJavascriptDate(), endDate.getOfficialJavascriptDate());
        dateArray = dateArray.map(date => new Helper.MyDateClass(date));

        dateArray.forEach(function (dateUnit) {
            columnTitleArray.push({
                headerName: dateUnit.getDateInDDMMYYYFormat(),
                field: dateUnit.getDateInDDMMYYYFormat(),
                filter: 'agNumberColumnFilter',
                editable: function (params) {
                    return false;
                }
            });
        });

        let totalHoursMap = new Map(), totalSalaryMap = new Map();

        let employeeDataContainer = new Employees.EmployeeData();
        employeeDataContainer.loadEmployeesAndHours(function (employeeData) {

            employeeData.forEach(function (employee) {
                //console.log(employee);

                let employeeArrayHoursTransfer = {}, employeeArrayHoursCash = {}, employeeArrayMoneyTransfer = {},
                    employeeArrayMoneyCash = {};

                fillEmployeeDefaultColumnsInJson(employeeArrayHoursTransfer, employee.id, employee.firstName, employee.lastName, 'transfer');
                fillEmployeeDefaultColumnsInJson(employeeArrayHoursCash, employee.id, employee.firstName, employee.lastName, 'cash');
                fillEmployeeDefaultColumnsInJson(employeeArrayMoneyTransfer, employee.id, employee.firstName, employee.lastName, 'transfer');
                fillEmployeeDefaultColumnsInJson(employeeArrayMoneyCash, employee.id, employee.firstName, employee.lastName, 'cash');

                addPaymemtUnitIntoJsonArrayForEmployee(employeeArrayHoursTransfer, employeeArrayMoneyTransfer, employee, dateArray, 'transfer', totalHoursMap, totalSalaryMap);
                addPaymemtUnitIntoJsonArrayForEmployee(employeeArrayHoursCash, employeeArrayMoneyCash, employee, dateArray, 'cash', totalHoursMap, totalSalaryMap);

                jsonObj.data.push(employeeArrayHoursTransfer);
                jsonObj.data.push(employeeArrayHoursCash);
                jsonObj.dataSalary.push(employeeArrayMoneyTransfer);
                jsonObj.dataSalary.push(employeeArrayMoneyCash);
            });

            let totalHoursJson = {}, totalPaymentJson = {};
            fillTotalJsons(totalHoursJson, totalHoursMap, 'Total Hours');
            fillTotalJsons(totalPaymentJson, totalSalaryMap, 'Total Payment');
            jsonObj.data.push(totalHoursJson);
            jsonObj.data.push(totalPaymentJson);
            jsonObj.dataSalary.push(totalHoursJson);
            jsonObj.dataSalary.push(totalPaymentJson);
            jsonObj.totalPayment.push(totalPaymentJson);

            jsonObj.columns = columnTitleArray;
            callback(jsonObj);
        });
    }
}

/*let employeeDataContainer = new Employees.EmployeeData();
employeeDataContainer.loadEmployeesAndHours(function (employeeData) {
    console.log(employeeData);
});*/


module.exports = EmployeeHours;
