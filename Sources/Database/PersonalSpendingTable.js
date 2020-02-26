let DatabaseConnection = require('./DatabaseConnection.js');
let AnzSpendingTable = require('./AnzSpendingTable');
let ExcelReader = require('node-excel-stream').ExcelReader;
const fs = require('fs');
let Logger = require('../../Sources/Logger/Logger');
let logger = new Logger();
let SqlString = require('sqlstring');


class PersonalSpendingTable {
    transformCsvIntoArray(file, callback) {
        logger.log('PERSONAL_SPENDING - transformCsvIntoArray');
        let mySheets = {
            sheets: [{
                name: 'Data',
                rows: {
                    allowedHeaders: [{name: 'personal_spending', key: 'personal_spending'},
                        {name: 'person_name', key: 'person_name'}]
                }
            }]
        };

        let dataStream = fs.createReadStream(file);
        let reader = new ExcelReader(dataStream, mySheets);
        let personal_spending_array = [];
        reader.eachRow((rowData) => {
            let rowArray = [rowData.personal_spending, rowData.person_name];
            personal_spending_array.push(rowArray);
        }).then(() => {
            return callback(personal_spending_array);
        });
    };

    getAllPersonalSpendingFromDatabase(callback) {
        logger.log('PERSONAL_SPENDING - getAllPersonalSpendingFromDatabase');
        DatabaseConnection.query(SqlString.format('select * from PERSONAL_SPENDING'), function (results) {
            if (results === null) {
                logger.log('PERSONAL_SPENDING - DATABASE ERROR getAllPersonalSpendingFromDatabase');
            }
            callback(results);
        });
    }


    addPersonalSpending(personal_spending, person_name, callback) {
        logger.log('PERSONAL_SPENDING - addPersonalSpending: ' + personal_spending + ' --- ' + person_name);
        let personalSpendingTable = this;
        DatabaseConnection.query(SqlString.format('INSERT INTO PERSONAL_SPENDING(personal_spending, person_name) VALUES (?, ?)', [personal_spending, person_name]),
            function (results) {
                if (results === null) {
                    logger.log('PERSONAL_SPENDING - DATABASE ERROR addPersonalSpending');
                }
                personalSpendingTable.getAllPersonalSpendingFromDatabase(callback);
            });
    }


    deletePersonalSpending(personal_spending, callback) {
        logger.log('PERSONAL_SPENDING - deleteFilter: ' + personal_spending);
        let personalSpendingTable = this;
        DatabaseConnection.query(SqlString.format('DELETE FROM PERSONAL_SPENDING WHERE personal_spending=?', [personal_spending]), function (results) {
            if (results === null) {
                logger.log('PERSONAL_SPENDING - DATABASE ERROR deleteFilter');
            }
            personalSpendingTable.getAllPersonalSpendingFromDatabase(callback);
        });
    }


    insertPersonalSpendingInDatabaseFromCsvFormat(file, callback) {
        let personalSpendingTable = this;
        this.transformCsvIntoArray(file, function (personal_spending_array) {
            DatabaseConnection.query(SqlString.format('delete from PERSONAL_SPENDING'), function (results) {
                if (results === null) {
                    logger.log('PERSONAL_SPENDING - DATABASE ERROR couldn\'t delete personal_spending');
                    callback(null);
                } else {
                    DatabaseConnection.query(SqlString.format('INSERT INTO PERSONAL_SPENDING(personal_spending, person_name) VALUES ?', [personal_spending_array]), function (results) {
                        if (results === null) {
                            logger.log('PERSONAL_SPENDING - DATABASE ERROR insertPersonalSpendingInDatabaseFromCsvFormat');
                        }
                        personalSpendingTable.getAllPersonalSpendingFromDatabase(callback);
                    });
                }
            });
        });
    }


    calculatePersonalSpendingTotal(jsonObj, startDate, endDate, callback) {
        let anzSpendingTable = new AnzSpendingTable();
        let personalSpendingTable = this;
        jsonObj.marwanPersonalSpending = 0;
        jsonObj.samerPersonalSpending = 0;
        jsonObj.bothPersonalSpending = 0;
        jsonObj.totalPersonalSpending = 0;
        jsonObj.personalSpendingColumnsTotals = [];

        jsonObj.personalSpendingColumnsTotals.push({text: 'Spender', datafield: 'Spender', width: 150});
        jsonObj.personalSpendingColumnsTotals.push({text: 'Amount', datafield: 'Amount', width: 150});

        anzSpendingTable.getAllAnzSpendingFromTableForDates(startDate, endDate, function (anzSpendings){
            personalSpendingTable.getAllPersonalSpendingFromDatabase(function (personalSpendings){
                anzSpendings.forEach(function (anzSpending) {

                    personalSpendings.forEach(function (personalSpending) {
                        if(anzSpending.spending_description.includes(personalSpending.personal_spending)){


                            jsonObj.totalPersonalSpending += anzSpending.amount;



                            if(personalSpending.person_name.includes('MARWAN')){
                                jsonObj.marwanPersonalSpending += anzSpending.amount;
                            } else if(personalSpending.person_name.includes('SAMER')){
                                jsonObj.samerPersonalSpending += anzSpending.amount;
                            } else if(personalSpending.person_name.includes('BOTH')){
                                jsonObj.bothPersonalSpending += anzSpending.amount;
                            }
                        }
                    });
                });


                jsonObj.personalSpendingDataTotals = [];
                let dataPersonalSpendingTotalMarwan = {}, dataPersonalSpendingTotalSamer = {}, dataPersonalSpendingTotalBoth = {},
                    dataPersonalSpendingTotalTotal = {};

                dataPersonalSpendingTotalMarwan['Spender'] = 'MARWAN';
                dataPersonalSpendingTotalMarwan['Amount'] = (Math.round(jsonObj.marwanPersonalSpending * 100) / 100);
                jsonObj.personalSpendingDataTotals.push(dataPersonalSpendingTotalMarwan);

                dataPersonalSpendingTotalSamer['Spender'] = 'SAMER';
                dataPersonalSpendingTotalSamer['Amount'] = (Math.round(jsonObj.samerPersonalSpending * 100) / 100);
                jsonObj.personalSpendingDataTotals.push(dataPersonalSpendingTotalSamer);

                dataPersonalSpendingTotalBoth['Spender'] = 'BOTH';
                dataPersonalSpendingTotalBoth['Amount'] = (Math.round(jsonObj.bothPersonalSpending * 100) / 100);
                jsonObj.personalSpendingDataTotals.push(dataPersonalSpendingTotalBoth);

                dataPersonalSpendingTotalTotal['Spender'] = 'TOTAL';
                dataPersonalSpendingTotalTotal['Amount'] = (Math.round(jsonObj.totalPersonalSpending * 100) / 100);
                jsonObj.personalSpendingDataTotals.push(dataPersonalSpendingTotalTotal);

                callback(jsonObj);
            });
        });
    }
}

module.exports = PersonalSpendingTable;


let personalSpendingTable = new PersonalSpendingTable();
//spendingCategoriesTable.insertFilterInDatabaseFromCsvFosrmat();
/*
let jsonObj = {};
personalSpendingTable.calculatePersonalSpendingTotal(jsonObj, '01/08/2019', '30/08/2019', function(results){
    console.log(results);
});
*/




