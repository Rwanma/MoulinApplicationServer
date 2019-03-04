let DataTransformer = require("../../AnzDataAnalysis/DataTransformer/DataTransformer.js");
let EmployeeHours = require("../../Employees/EmployeeHours");
let Helper = require('../../Helpers/Helpers.js');
let DailyInputsTable = require('../../Database/DailyInputsTable');


class DailyRealData {


    getDailyData(beginDate, endDate, callback) {
        let jsonDailyRealData = { columns: [], dataReal: [], dataEstimate: [], dataAverageReal: [] };
        let dateArray = Helper.getDatesRangeArray(beginDate.getOfficialJavascriptDate(), endDate.getOfficialJavascriptDate());
        let dataTransformerWithDates = new DataTransformer();
        let employeeHours = new EmployeeHours();
        let dailyInputsTable = new DailyInputsTable();

        dataTransformerWithDates.constructDataInMapFormat('false', function (mySpendingWithDates) {
            mySpendingWithDates.transformToAgGridData(beginDate, endDate, function (anzSpending) {
                employeeHours.getHoursForEmployeesInJson(beginDate, endDate, function (employeeHours) {
                    dailyInputsTable.getDailyInputsInJson(beginDate, endDate, 'true', function (dailyInputs) {

                        jsonDailyRealData.columns[0] = { headerName: 'Category', field: 'Category', pinned: 'left', filter: 'agTextColumnFilter', editable: false };

                        let employeeTotal = {}, anzTotal = {}, averageTotal = {}, revenueTotal = {}, cafeDailyCosts = {}, dailyTotalReal = {}, dailyTotalEstimate = {},
                            dailyAverageEstimate = {}, dailyRent = {};
                        employeeTotal['Category'] = 'Employees Day Total';
                        revenueTotal['Category'] = 'Revenue Day Total';
                        anzTotal['Category'] = 'ANZ Total day';
                        averageTotal['Category'] = 'Average ANZ spending';
                        cafeDailyCosts['Category'] = 'Cafe daily cost Total';
                        dailyRent['Category'] = 'Daily Rent';
                        dailyTotalReal['Category'] = 'NET TOTAL';
                        dailyTotalEstimate['Category'] = 'NET TOTAL';
                        dailyAverageEstimate['Category'] = 'NET TOTAL';


                        dateArray.forEach(function (work_date) {
                            jsonDailyRealData.columns.push({
                                headerName: work_date, field: work_date, filter: 'agTextColumnFilter', editable: false
                            });

                            revenueTotal[work_date] = dailyInputs.totalRevenu[0][work_date];
                            employeeTotal[work_date] = employeeHours.totalPayment[0][work_date];
                            anzTotal[work_date] = anzSpending.totalAnzSpending[0][work_date];
                            averageTotal[work_date] = anzSpending.averageTotal[0][work_date];
                            cafeDailyCosts[work_date] = dailyInputs.totalMilkCoffeeSpending[0][work_date];
                            dailyRent[work_date] = dailyInputs.totalRent[0][work_date];

                            let dayRevenueTotal = (revenueTotal[work_date] === undefined) ? 0 : revenueTotal[work_date];
                            let dayEmployeeTotal = (employeeTotal[work_date] === undefined) ? 0 : employeeTotal[work_date];
                            let dayAnzTotal = (anzTotal[work_date] === undefined) ? 0 : anzTotal[work_date];
                            let dayAverageTotal = (averageTotal[work_date] === undefined) ? 0 : averageTotal[work_date];
                            let dayCafeDailyCosts = (cafeDailyCosts[work_date] === undefined) ? 0 : cafeDailyCosts[work_date];
                            let dayDailyRent = (dailyRent[work_date] === undefined) ? 0 : dailyRent[work_date];

                            dailyTotalReal[work_date] = dayRevenueTotal - dayEmployeeTotal + dayAnzTotal - dayDailyRent;
                            dailyTotalEstimate[work_date] = dayRevenueTotal - dayEmployeeTotal - dayCafeDailyCosts - dayDailyRent;
                            dailyAverageEstimate[work_date] = dayRevenueTotal - dayEmployeeTotal + dayAverageTotal - dayDailyRent;
                        });

                        jsonDailyRealData.dataReal.push(revenueTotal);
                        jsonDailyRealData.dataReal.push(anzTotal);
                        jsonDailyRealData.dataReal.push(employeeTotal);
                        jsonDailyRealData.dataReal.push(dailyRent);
                        jsonDailyRealData.dataReal.push(dailyTotalReal);

                        jsonDailyRealData.dataEstimate.push(revenueTotal);
                        jsonDailyRealData.dataEstimate.push(cafeDailyCosts);
                        jsonDailyRealData.dataEstimate.push(employeeTotal);
                        jsonDailyRealData.dataEstimate.push(dailyRent);
                        jsonDailyRealData.dataEstimate.push(dailyTotalEstimate);

                        jsonDailyRealData.dataAverageReal.push(revenueTotal);
                        jsonDailyRealData.dataAverageReal.push(averageTotal);
                        jsonDailyRealData.dataAverageReal.push(employeeTotal);
                        jsonDailyRealData.dataAverageReal.push(dailyRent);
                        jsonDailyRealData.dataAverageReal.push(dailyAverageEstimate);

                        callback(jsonDailyRealData);
                    });
                });
            });
        });
    }
}


module.exports = DailyRealData;

