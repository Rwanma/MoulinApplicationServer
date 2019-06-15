let DatabaseConnection = require('./DatabaseConnection.js');
let ExcelReader = require('node-excel-stream').ExcelReader;
const fs = require('fs');
let Logger = require('../../Sources/Logger/Logger');
let logger = new Logger();
let SqlString = require('sqlstring');

class SpendingCategoriesTable {


    getCategoriesFromCsvToDatabase(file, callback) {
        logger.log('SPENDING_CATEGORY - getCategoriesFromCsvToDatabase');
        let mySheets = {
            sheets: [{
                name: 'Data',
                rows: {
                    allowedHeaders: [{
                        name: 'categories',
                        key: 'categories'
                    }]
                }
            }]
        };

        let dataStream = fs.createReadStream(file);
        let reader = new ExcelReader(dataStream, mySheets);
        let myArray = [];
        reader.eachRow((rowData) => {
            let rowArray = [rowData.categories];
            myArray.push(rowArray);
        }).then(() => {
            return callback(myArray);
        });
    };



    insertCategoryInDatabaseFromCsvFormat(file, callback) {
        let spendingCategoryThis = this;
        this.getCategoriesFromCsvToDatabase(file, function (categoryArray) {
            DatabaseConnection.query(SqlString.format('delete from SPENDING_CATEGORIES'), function (results) {
                if (results === null) {
                    logger.log('SPENDING_CATEGORY - DATABASE ERROR couldn\'t delete spending categories');
                    callback(null);
                } else {
                    DatabaseConnection.query(SqlString.format('INSERT INTO SPENDING_CATEGORIES(categories) VALUES ?', [categoryArray]), function (results) {
                        if (results === null) {
                            logger.log('SPENDING_CATEGORY - DATABASE ERROR insertCategoryInDatabaseFromCsvFormat');
                        }
                        spendingCategoryThis.getAllCategoriesFromDatabase(callback);
                    });
                }
            });
        });
    }


    getAllCategoriesFromDatabase(callback) {
        logger.log('SPENDING_CATEGORY - getAllCategoriesFromDatabase');
        DatabaseConnection.query(SqlString.format('select * from SPENDING_CATEGORIES'), function (results) {
            if (results === null) {
                logger.log('SPENDING_CATEGORY - DATABASE ERROR getAllCategoriesFromDatabase');
            }
            callback(results);
        });
    }


    addCategory(category, callback) {
        logger.log('SPENDING_CATEGORY - addCategory: ' + category);
        let spendingCategoryThis = this;
        DatabaseConnection.query(SqlString.format('INSERT INTO SPENDING_CATEGORIES(categories) VALUES (?)', [category]), function (results) {
            if (results === null) {
                logger.log('SPENDING_CATEGORY - DATABASE ERROR addCategory');
            }
            spendingCategoryThis.getAllCategoriesFromDatabase(callback);
        });
    }



    deleteCategory(category, callback) {
        logger.log('SPENDING_CATEGORY - deleteCategory: ' + category);
        let spendingCategoryThis = this;
        DatabaseConnection.query(SqlString.format('DELETE FROM SPENDING_CATEGORIES WHERE categories=?', [category]), function (results) {
            if (results === null) {
                logger.log('SPENDING_CATEGORY - DATABASE ERROR deleteCategory');
            }
            spendingCategoryThis.getAllCategoriesFromDatabase(callback);
        });
    }
}


module.exports = SpendingCategoriesTable;

/*
spendingCategoriesTable = new SpendingCategoriesTable();

//spendingCategoriesTable.insertCategoryInDatabaseFromCsvFormat();
spendingCategoriesTable.getAllCategoriesFromDatabase(function () {

});
*/
