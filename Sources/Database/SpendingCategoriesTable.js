let DatabaseConnection = require('./DatabaseConnection.js');
let ExcelReader = require('node-excel-stream').ExcelReader;
const fs = require('fs');
let Logger = require('../../Sources/Logger/Logger');
let logger = new Logger();


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



    insertCategoryInDatabaseFromCsvFormat(file) {
        let dbConnection = DatabaseConnection.getConnection();
        this.getCategoriesFromCsvToDatabase(file, function (categoryArray) {
            dbConnection.query('delete from SPENDING_CATEGORIES', function () {
                dbConnection.query('INSERT INTO SPENDING_CATEGORIES(categories) VALUES ?',
                    [categoryArray], function (error) {
                        if (error){
                            logger.log('SPENDING_CATEGORY - DATABASE ERROR insertCategoryInDatabaseFromCsvFormat: ' + error.sqlMessage);
                        }
                        dbConnection.end();
                    });
            });
        });
    }

    getAllCategoriesFromDatabase(callback) {
        logger.log('SPENDING_CATEGORY - getAllCategoriesFromDatabase');
        let dbConnection = DatabaseConnection.getConnection();
        dbConnection.query('select * from SPENDING_CATEGORIES', function (error, results) {
            if (error){
                logger.log('SPENDING_CATEGORY - DATABASE ERROR getAllCategoriesFromDatabase: ' + error.sqlMessage);
            }
            dbConnection.end();
            callback(results);
        });
    }


    addCategory(category, callback) {
        logger.log('SPENDING_CATEGORY - addCategory: ' + category);
        let spendingCategoryThis = this;
        let dbConnection = DatabaseConnection.getConnection();
        dbConnection.query(
            'INSERT INTO SPENDING_CATEGORIES(categories) VALUES (?)', [category], function (error) {
                if (error){
                    logger.log('SPENDING_CATEGORY - DATABASE ERROR addCategory: ' + error.sqlMessage);
                }
                dbConnection.end();
                spendingCategoryThis.getAllCategoriesFromDatabase(callback);
            });
    }



    deleteCategory(category, callback) {
        logger.log('SPENDING_CATEGORY - deleteCategory: ' + category);
        let spendingCategoryThis = this;
        let dbConnection = DatabaseConnection.getConnection();
        dbConnection.query('DELETE FROM SPENDING_CATEGORIES WHERE categories=?', [category], function (error) {
            if (error){
                logger.log('SPENDING_CATEGORY - DATABASE ERROR deleteCategory: ' + error.sqlMessage);
            }
            dbConnection.end();
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
