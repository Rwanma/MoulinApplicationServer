let DatabaseConnection = require('./DatabaseConnection.js');
let ExcelReader = require('node-excel-stream').ExcelReader;
const fs = require('fs');
let Helper = require('../Helpers/Helpers.js');
let Logger = require('../../Sources/Logger/Logger');
let logger = new Logger();
let SqlString = require('sqlstring');


class AnzSpendingTable {


    getAnzDataFromCsvToDatabase(file, callback) {
        logger.log('ANZ_SPENDING_TABLE - getAnzDataFromCsvToDatabase');
        let mySheets = {
            sheets: [{
                name: 'Data',
                rows: {
                    allowedHeaders: [{
                        name: 'Date',
                        key: 'date'
                    }, {
                        name: 'Amount',
                        key: 'amount'
                    }, {
                        name: 'Description',
                        key: 'description'
                    }]
                }
            }]
        };
        let dataStream = fs.createReadStream(file);
        let reader = new ExcelReader(dataStream, mySheets);
        let myArray = [];
        reader.eachRow((rowData) => {
            let spendingDate = new Helper.MyDateClass(rowData.date);
            let rowArray = [spendingDate.getDateInDatabaseFormat(), rowData.amount, rowData.description];
            myArray.push(rowArray);
        }).then(() => {
            return callback(myArray);
        });
    };


    insertAllAnzSpendings(file, callback) {
        logger.log('ANZ_SPENDING_TABLE - insertAllAnzSpendings');
        this.getAnzDataFromCsvToDatabase(file, function (anzSpendingArray) {
            DatabaseConnection.query(SqlString.format('delete from ANZ_SPENDING'), function (sucessfullDelete) {
                if (sucessfullDelete === null) {
                    callback('error in deleting ANZ data in database, check the logs')
                } else {
                    DatabaseConnection.query(SqlString.format('INSERT INTO ANZ_SPENDING(spending_date,  amount, spending_description ) VALUES ?', [anzSpendingArray]), function (results) {
                        let returnValue = 'successfully saved ANZ data';
                        if (results === null) {
                            returnValue = 'error in deleting ANZ data in database, check the logs';
                        } else {
                            returnValue = 'successfully inserted ANZ data in the database';
                        }
                        callback(returnValue);
                    });
                }
            });
        });
    }


    getAllAnzSpendingFromTable(callback) {
        logger.log('ANZ_SPENDING_TABLE - getAllAnzSpendingFromTable');
        DatabaseConnection.query(SqlString.format('select DATE_FORMAT(spending_date,\'%d/%m/%Y\') AS spending_date, amount, spending_description from ANZ_SPENDING'), function (results) {
            callback(results);
        });
    }


    getAnzSpendingTotalInJson(jsonObj, beginDate, endDate, callback) {
        logger.log('ANZ_SPENDING_TABLE - getAnzSpendingTotalInJson');
        let sqlQuery = SqlString.format('SELECT ROUND(SUM(amount),2) AS  \'total\' FROM ANZ_SPENDING  WHERE amount < 0 AND spending_date >= ? AND spending_date <= ?;',
            [beginDate, endDate]);

        DatabaseConnection.query(sqlQuery, function (results) {
            if (results === null) {
                logger.log('ANZ_SPENDING_TABLE - DATABASE getAnzSpendingTotalInJson');
            } else {
                jsonObj.totalAnzSpending = results[0].total;
            }
            callback();
        });
    }


    getAllAnzSpendingFromTableForDates(beginDate, endDate, callback) {
        logger.log('ANZ_SPENDING_TABLE - getAllAnzSpendingFromTable');
        DatabaseConnection.query(SqlString.format('select DATE_FORMAT(spending_date,\'%d/%m/%Y\') AS spending_date, amount, spending_description from ANZ_SPENDING WHERE spending_date >= ? AND spending_date <= ?' ,
            [beginDate, endDate]), function (results) {
            callback(results);
        });
    }

    getAverageSpendingAnz(jsonObj, beginDate, endDate, callback) {
        logger.log('ANZ_SPENDING_TABLE - getAverageSpendingAnz');
        let dbBeginDate = beginDate.getDateInDatabaseFormat(), dbEndDate = endDate.getDateInDatabaseFormat() ;
        let sqlQuery = SqlString.format(' select sum (sum_per_day) as totalSum from (select spending_date, sum(amount) as sum_per_day from ANZ_SPENDING ' +
            'where amount < 0 and spending_date >= ? and spending_date <= ? group by spending_date ) as inner_query', [dbBeginDate, dbEndDate]);

        DatabaseConnection.query(sqlQuery, function (result) {
            if (result === null) {
                logger.log('ANZ_SPENDING_TABLE - DATABASE ERROR getAverageSpendingAnz');
            }

            let averageSpendingPerDay = Math.round(result[0].totalSum /
                Helper.getNumberOfDaysBetweenDates(beginDate.getOfficialJavascriptDate(), endDate.getOfficialJavascriptDate())
                * 100) / 100;
            jsonObj.averageSpendingPerDay = averageSpendingPerDay;
            callback(jsonObj);
        });
    }

}
module.exports = AnzSpendingTable;

/*let anzSpendingTable = new AnzSpendingTable();
let jsonObj = {};
anzSpendingTable.getAnzSpendingTotalInJson(jsonObj, '2019-08-01', '2019-08-30', function (results) {
    console.log(jsonObj.totalAnzSpending);
});*/

/*anzSpendingTable = new AnzSpendingTable();
anzSpendingTable.getAllAnzSpendingFromTable(function (data) {
  console.log(data);
});*/
