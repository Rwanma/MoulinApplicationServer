let DatabaseConnection = require('./DatabaseConnection.js');
let Helper = require('../../Sources/Helpers/Helpers.js');
let Config = require('../Config/Config');
let Logger = require('../../Sources/Logger/Logger');
let logger = new Logger();
let SqlString = require('sqlstring');


class DailyInputDataTable {

    getDailyInputDataInJson(beginDate, endDate, allowTableChanges, callback) {
        logger.log('DAILY_INPUT_TABLE - getDailyInputsInJson');
        let editableTable = (allowTableChanges === 'true');

        let inputsQuery = SqlString.format('SELECT DATE_FORMAT(work_date,\'%d/%m/%Y\') as work_date, input_type, value FROM DAILY_INPUT_DATA ' +
            '           WHERE work_date >= ? AND work_date <= ?', [beginDate.getDateInDatabaseFormat(), endDate.getDateInDatabaseFormat()]);
        DatabaseConnection.query(inputsQuery, function (results) {
            let jsonObj = { columns: [], data: [], dataSalary: [], totalMilkCoffeeSpending: [], totalRevenu: [], totalRent: []/*, errorMessage: null*/ };
            let dateArray = Helper.getDatesRangeArray(Helper.transformDayMonthYearToDate(beginDate.dateInDDMMYYYFormat), Helper.transformDayMonthYearToDate(endDate.dateInDDMMYYYFormat));
            jsonObj.columns.push({ headerName: 'Daily Input', field: 'Daily Input', pinned: 'left', filter: 'agTextColumnFilter', editable: false, sortable: false });
            let cashRevenuArray = {}, ftposRevenuArray = {}, coffeeBagsArray = {}, milkCartonArray = {}, soyMilkArray = {}, almondMilkArray = {}, emptyArray = {},
                totalRevenu = {}, totalMilkCoffeeSpending = {}, totalDayEstimate = {}, rent = {};

            cashRevenuArray['Daily Input'] = 'Cash Revenu';
            ftposRevenuArray['Daily Input'] = 'FTPOS Revenu';
            coffeeBagsArray['Daily Input'] = 'Coffee Bags';
            milkCartonArray['Daily Input'] = 'Milk Cartons';
            soyMilkArray['Daily Input'] = 'Soy Milk Cartons';
            almondMilkArray['Daily Input'] = 'Almond Milk Cartons';
            totalRevenu['Daily Input'] = 'Total Revenu';
            totalMilkCoffeeSpending['Daily Input'] = 'Total Milk/Coffee Spending';
            totalDayEstimate['Daily Input'] = 'Total Day Estimate';
            rent['Daily Input'] = 'Rent';
            let priceConfig = Config.getPriceConfig();

            dateArray.forEach(function (work_date) {
                jsonObj.columns.push({ headerName: work_date, field: work_date, filter: 'agTextColumnFilter', editable: editableTable });
                totalRevenu[work_date] = 0;
                totalMilkCoffeeSpending[work_date] = 0;
                totalDayEstimate[work_date] = 0;
                rent[work_date] = priceConfig.rent;

                if (results!==null) {
                    results.forEach(function (result) {
                        if (result.work_date === work_date) {

                            switch (result.input_type) {
                                case 'cash_revenu':
                                    cashRevenuArray[work_date] = result.value;
                                    totalRevenu[work_date] += (result.value);
                                    break;
                                case 'ftpos_revenu':
                                    ftposRevenuArray[work_date] = result.value;
                                    totalRevenu[work_date] += (result.value);
                                    break;
                                case 'coffee_bags':
                                    coffeeBagsArray[work_date] = result.value;
                                    totalMilkCoffeeSpending[work_date] += (parseInt(result.value, 10) * priceConfig.coffee);

                                    break;
                                case 'milk_cartons':
                                    milkCartonArray[work_date] = result.value;
                                    totalMilkCoffeeSpending[work_date] += (parseInt(result.value, 10) * priceConfig.normalMilk);

                                    break;
                                case 'soy_cartons':
                                    soyMilkArray[work_date] = result.value;
                                    totalMilkCoffeeSpending[work_date] += (parseInt(result.value, 10) * priceConfig.soyMilk);
                                    break;
                                case 'almond_cartons':
                                    almondMilkArray[work_date] = result.value;
                                    totalMilkCoffeeSpending[work_date] += (parseInt(result.value, 10) * priceConfig.almondMilk);
                                    break;
                                default:
                                    logger.log('ERROR IN DAILY_INPUT_DATA table we entered an input type that should not be there');
                            }
                        }
                    });
                }
                totalDayEstimate[work_date] = parseInt(totalRevenu[work_date] - totalMilkCoffeeSpending[work_date], 10);
            });

            jsonObj.data.push(cashRevenuArray);
            jsonObj.data.push(ftposRevenuArray);
            jsonObj.data.push(coffeeBagsArray);
            jsonObj.data.push(milkCartonArray);
            jsonObj.data.push(soyMilkArray);
            jsonObj.data.push(almondMilkArray);
            jsonObj.data.push(emptyArray);
            jsonObj.data.push(totalRevenu);
            jsonObj.data.push(totalMilkCoffeeSpending);
            jsonObj.data.push(emptyArray);
            jsonObj.data.push(totalDayEstimate);
            jsonObj.totalRevenu.push(totalRevenu);
            jsonObj.totalMilkCoffeeSpending.push(totalMilkCoffeeSpending);
            jsonObj.totalRent.push(rent);

            callback(jsonObj);
        });
    }



    updateInputDataTable(work_date, column, value, callback) {
        logger.log('DAILY_INPUT_TABLE - updateInputTable');
        let dbDate = work_date.getDateInDatabaseFormat();

        let sqlQuery = '';
        if (value === 0) {
            sqlQuery = SqlString.format('DELETE FROM DAILY_INPUT_DATA WHERE  work_date = ? and input_type = ?', [dbDate, column]);
        } else {
            sqlQuery = SqlString.format('INSERT INTO  DAILY_INPUT_DATA(work_date, input_type, value) ' +
                'VALUES  (?,?,?) ON DUPLICATE KEY UPDATE value=?', [dbDate, column, value, value]);
        }

        DatabaseConnection.query(sqlQuery, function () {
            callback();
        });
    }




}


module.exports = DailyInputDataTable;


/*
let tableInputData = new DailyInputDataTable();
let insertDate = new Helper.MyDateClass('22/05/2019');
tableInputData.updateInputDataTable(insertDate, 'ftpos_revenu', 100, function (database_updated) {
  console.log(database_updated);
});
*/


/*let beginDate = new Helper.MyDateClass('01/05/2019');
let endDate = new Helper.MyDateClass('30/05/2019');
let dailyInputsTable = new DailyInputDataTable();
dailyInputsTable.getDailyInputDataInJson(beginDate, endDate, true, function (data) {
    //console.log(data);
});*/


/*
let beginDate = new Helper.MyDateClass('01/01/2019');
let endDate = new Helper.MyDateClass('02/02/2019');
let testDate = new Helper.MyDateClass('03/02/2019');

let dailyInputsTable = new DailyInputsTable();
dailyInputsTable.updateValueInInputTable(testDate,'coffee_bags', 5);

*/




//DailyInputsTable.insertCategoryInDatabaseFromCsvFormat();
/*
DailyInputsTable.insertCategoryInDatabaseFromCsvFormat(function (data) {

});*/
