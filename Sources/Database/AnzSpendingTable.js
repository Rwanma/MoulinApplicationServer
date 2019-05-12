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
        DatabaseConnection.query(SqlString.format('select DATE_FORMAT(spending_date,\'%d/%m/%Y\') as spending_date, amount, spending_description from ANZ_SPENDING'), function (results) {
            callback(results);
        });
    }

}

module.exports = AnzSpendingTable;

/*anzSpendingTable = new AnzSpendingTable();
anzSpendingTable.getAllAnzSpendingFromTable(function (data) {
  console.log(data);
});*/
