let DataTransformer = require("../../AnzDataAnalysis/DataTransformer/DataTransformer.js");
let EmployeeHours = require("../../Employees/EmployeeHours");
let Helper = require('../../Helpers/Helpers.js');
let DailyInputsTable = require('../../Database/DailyInputsTable');


class DailyRealData {


    getDailyData(beginDate, endDate, callback) {
        let jsonDailyRealData = { columns: [], dataReal: [], dataEstimate: [] };
        let dateArray = Helper.getDatesRangeArray(beginDate.getOfficialJavascriptDate(), endDate.getOfficialJavascriptDate());
        let dataTransformerWithDates = new DataTransformer();
        let employeeHours = new EmployeeHours();
        let dailyInputsTable = new DailyInputsTable();

        dataTransformerWithDates.constructDataInMapFormat('false', function (mySpendingWithDates) {
            mySpendingWithDates.transformToAgGridData(beginDate, endDate, function (anzSpending) {
                employeeHours.getHoursForEmployeesInJson(beginDate, endDate, function (employeeHours) {
                    dailyInputsTable.getDailyInputsInJson(beginDate, endDate, 'true', function (dailyInputs) {

                        //jsonDailyRealData.columns = JSON.parse(JSON.stringify(anzSpending.columns));

                        console.log('*************************');
                        console.log(jsonDailyRealData.columns);
                        console.log('*************************');


                        jsonDailyRealData.columns[0] = { headerName: 'Category', field: 'Category', pinned: 'left', filter: 'agTextColumnFilter' , editable:false};

                        let employeeTotal = {}, anzTotal = {}, revenueTotal = {}, cafeDailyCosts = {}, dailyTotalReal = {}, dailyTotalEstimate = {};
                        employeeTotal['Category'] = 'Employees Day Total';
                        revenueTotal['Category'] = 'Revenue Day Total';
                        anzTotal['Category'] = 'ANZ Total day';
                        cafeDailyCosts['Category'] = 'Cafe daily cost Total';
                        dailyTotalReal['Category'] = 'NET TOTAL';
                        dailyTotalEstimate['Category'] = 'NET TOTAL';


                        dateArray.forEach(function (work_date) {
                            jsonDailyRealData.columns.push({
                                headerName: work_date, field: work_date, filter: 'agTextColumnFilter', editable: false
                            });

                            revenueTotal[work_date] = dailyInputs.totalRevenu[0][work_date];
                            employeeTotal[work_date] = employeeHours.totalPayment[0][work_date];
                            anzTotal[work_date] = anzSpending.totalAnzSpending[0][work_date];
                            cafeDailyCosts[work_date] = dailyInputs.totalMilkCoffeeSpending[0][work_date];

                            dailyTotalReal[work_date] = revenueTotal[work_date] - employeeTotal[work_date] + anzTotal[work_date];
                            dailyTotalEstimate[work_date] = revenueTotal[work_date] - employeeTotal[work_date] - cafeDailyCosts[work_date];
                        });

                        jsonDailyRealData.dataReal.push(revenueTotal);
                        jsonDailyRealData.dataReal.push(anzTotal);
                        jsonDailyRealData.dataReal.push(employeeTotal);
                        jsonDailyRealData.dataReal.push(dailyTotalReal);

                        jsonDailyRealData.dataEstimate.push(revenueTotal);
                        jsonDailyRealData.dataEstimate.push(cafeDailyCosts);
                        jsonDailyRealData.dataEstimate.push(employeeTotal);
                        jsonDailyRealData.dataEstimate.push(dailyTotalEstimate);
                        callback(jsonDailyRealData);
                    });
                });
            });

        });

    }
}


module.exports = DailyRealData;