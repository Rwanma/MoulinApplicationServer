
let mysql = require('mysql');
let Helper = require('../../Sources/Helpers/Helpers.js');


class DailyInputsTable {
    constructor() {
        this.connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Sqlpass01',
            database: 'test_database'
        });
    }


    getDailyInputsInJson(beginDate, endDate, callback) {
        let dbBeginDate = beginDate.getDateInDatabaseFormat();
        let dbEndDate = endDate.getDateInDatabaseFormat();
        this.connection.query('SELECT DATE_FORMAT(work_date,\'%d/%m/%Y\') as work_date, cash_revenu, ftpos_revenu, coffee_bags, milk_cartons, soy_cartons ' +
            'FROM DAILY_INPUTS WHERE work_date >= ? AND work_date <= ?', [dbBeginDate, dbEndDate], function (error, results) {
            //console.log(error);
            if (error) throw error;
            let dateArray = Helper.getDatesRangeArray(Helper.transformDayMonthYearToDate(beginDate.dateInDDMMYYYFormat), Helper.transformDayMonthYearToDate(endDate.dateInDDMMYYYFormat));
            let jsonObj = { columns: [], data: [], dataSalary: [], totalMilkCoffeeSpending: [], totalRevenu: [] };
            jsonObj.columns.push({
                headerName: 'Daily Input',
                field: 'Daily Input',
                pinned: 'left',
                filter: 'agTextColumnFilter',
                editable: false
            });


            let cashRevenuArray = {}, ftposRevenuArray = {}, coffeeBagsArray = {}, milkCartonArray = {},
                soyMilkArray = {}, emptyArray = {}, totalRevenu = {}, totalMilkCoffeeSpending = {}, totalDayEstimate = {};
            cashRevenuArray['Daily Input'] = 'Cash Revenu';
            ftposRevenuArray['Daily Input'] = 'FTPOS Revenu';
            coffeeBagsArray['Daily Input'] = 'Coffee Bags';
            milkCartonArray['Daily Input'] = 'Milk Cartons';
            soyMilkArray['Daily Input'] = 'Soy Milk Cartons';
            totalRevenu['Daily Input'] = 'Total Revenu';
            totalMilkCoffeeSpending['Daily Input'] = 'Total Milk/Coffee Spending';
            totalDayEstimate['Daily Input'] = 'Total Day Estimate';


            dateArray.forEach(function (work_date) {
                jsonObj.columns.push({
                    headerName: work_date, field: work_date, filter: 'agTextColumnFilter', editable: true
                });
                results.forEach(function (result) {
                    if (result.work_date === work_date) {
                        cashRevenuArray[work_date] = result.cash_revenu;
                        ftposRevenuArray[work_date] = result.ftpos_revenu;
                        coffeeBagsArray[work_date] = result.coffee_bags;
                        milkCartonArray[work_date] = result.milk_cartons;
                        soyMilkArray[work_date] = result.soy_cartons;

                        // Cash Revenu
                        totalRevenu[work_date] = 0;
                        if (result.cash_revenu !== null) {
                            totalRevenu[work_date] += (parseInt(result.cash_revenu, 10));
                        }
                        if (result.ftpos_revenu !== null) {
                            totalRevenu[work_date] += (parseInt(result.ftpos_revenu, 10));
                        }
                        totalDayEstimate[work_date] = 0;
                        totalDayEstimate[work_date] += totalRevenu[work_date];
                        if (totalRevenu[work_date] === 0) {
                            totalRevenu[work_date] = undefined;
                        }

                        // Spending cost
                        totalMilkCoffeeSpending[work_date] = 0;
                        if (result.coffee_bags !== null) {
                            totalMilkCoffeeSpending[work_date] += (parseInt(result.coffee_bags, 10) * -27);
                        }
                        if (result.milk_cartons !== null) {
                            totalMilkCoffeeSpending[work_date] += (parseInt(result.milk_cartons, 10) * -5);
                        }
                        if (result.soy_cartons !== null) {
                            totalMilkCoffeeSpending[work_date] += (parseInt(result.soy_cartons, 10) * -5);
                        }
                        totalDayEstimate[work_date] += totalMilkCoffeeSpending[work_date];
                        if (totalMilkCoffeeSpending[work_date] === 0) {
                            totalMilkCoffeeSpending[work_date] = undefined;
                        }
                        if (totalDayEstimate[work_date] === 0) {
                            totalDayEstimate[work_date] = undefined;
                        }
                    }
                });

            });
            jsonObj.data.push(cashRevenuArray);
            jsonObj.data.push(ftposRevenuArray);
            jsonObj.data.push(coffeeBagsArray);
            jsonObj.data.push(milkCartonArray);
            jsonObj.data.push(soyMilkArray);
            jsonObj.data.push(emptyArray);
            jsonObj.data.push(totalRevenu);
            jsonObj.data.push(totalMilkCoffeeSpending);
            jsonObj.data.push(emptyArray);
            jsonObj.data.push(totalDayEstimate);
            jsonObj.totalRevenu.push(totalRevenu);
            jsonObj.totalMilkCoffeeSpending.push(totalMilkCoffeeSpending);

            callback(jsonObj);
        });
    }




    updateInputTable(work_date, column, value, callback) {
        let dbDate = work_date.getDateInDatabaseFormat();
        let DailyInputsThis = this;

        this.connection.query('SELECT * FROM DAILY_INPUTS WHERE work_date = ? ', [dbDate], function (error, results) {
            if (error) throw error;

            if (results.length !== 0) {
                DailyInputsThis.connection.query('UPDATE DAILY_INPUTS SET ' + column + '=? WHERE work_date=?', [value, dbDate], function (error) {
                    if (error) throw error;
                    DailyInputsThis.connection.query('SELECT * FROM DAILY_INPUTS WHERE work_date = ? ', [dbDate], function (error, results) {
                        if ((results[0].cash_revenu === 0 || results[0].cash_revenu === null)
                            && (results[0].ftpos_revenu === 0 || results[0].ftpos_revenu === null)
                            && (results[0].coffee_bags === 0 || results[0].coffee_bags === null)
                            && (results[0].milk_cartons === 0 || results[0].milk_cartons === null)
                            && (results[0].soy_cartons === 0 || results[0].soy_cartons === null)) {
                            DailyInputsThis.connection.query('DELETE FROM DAILY_INPUTS WHERE  work_date = ? ', [dbDate], function (error) {
                                console.log(error);
                                if (error) throw error;
                                callback();
                            });
                        } else {
                            callback();
                        }
                    });
                });
            } else if (value !== 0) {
                DailyInputsThis.connection.query('INSERT INTO DAILY_INPUTS(work_date, ' + column + ') VALUES (?, ?)', [dbDate, value], function (error) {
                    console.log(error);
                    if (error) throw error;
                    callback();
                });
            }
        });
        //callback();
    }


}


module.exports = DailyInputsTable;


/*
let beginDate = new Helper.MyDateClass('01/01/2019');
let endDate = new Helper.MyDateClass('02/02/2019');
let testDate = new Helper.MyDateClass('03/02/2019');

let dailyInputsTable = new DailyInputsTable();
dailyInputsTable.updateValueInInputTable(testDate,'coffee_bags', 5);

*/

/*let beginDate = new Helper.MyDateClass('01/01/2019');
let endDate = new Helper.MyDateClass('02/02/2019');
let dailyInputsTable = new DailyInputsTable();
dailyInputsTable.getDailyInputsInJson(beginDate, endDate, function (data) {
    //console.log(data);
});*/


//DailyInputsTable.insertCategoryInDatabaseFromCsvFormat();
/*
DailyInputsTable.insertCategoryInDatabaseFromCsvFormat(function (data) {

});*/