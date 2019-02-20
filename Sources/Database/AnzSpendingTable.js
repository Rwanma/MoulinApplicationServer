let DatabaseConnection = require('./DatabaseConnection.js');
let ExcelReader = require('node-excel-stream').ExcelReader;
const fs = require('fs');
let Helper = require('../Helpers/Helpers.js');


class AnzSpendingTable {


    getAnzDataFromCsvToDatabase(file, callback) {
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


    insertAllAnzSpendings(file) {
        this.getAnzDataFromCsvToDatabase(file, function (anzSpendingArray) {
            let dbConnection = DatabaseConnection.getConnection();
            dbConnection.query('delete from ANZ_SPENDING', function () {
                dbConnection.query('INSERT INTO ANZ_SPENDING(spending_date,  amount, spending_description ) VALUES ?',
                    [anzSpendingArray], function (error) {
                        console.log(error);
                        if (error) throw error;
                    });
            });
        });

    }


    getAllAnzSpendingFromTable(callback) {
        let dbConnection = DatabaseConnection.getConnection();
        dbConnection.query('select DATE_FORMAT(spending_date,\'%d/%m/%Y\') as spending_date, amount, spending_description from ANZ_SPENDING', function (error, results) {
            if (error) throw error;
            dbConnection.end();
            callback(results);
        });
    }

}

module.exports = AnzSpendingTable;

/*anzSpendingTable = new AnzSpendingTable();
anzSpendingTable.getAllAnzSpendingFromTable(function (data) {
  console.log(data);
});*/
