let DatabaseConnection = require('./DatabaseConnection.js');
let ExcelReader = require('node-excel-stream').ExcelReader;
const fs = require('fs');


class SpendingCategoriesTable {


    getCategoriesFromCsvToDatabase(file, callback) {
        //let file = '../AnzDataAnalysis/CsvFiles/configLine.xlsx';
        //let file = 'Sources/AnzDataAnalysis/CsvFiles/configLine.xlsx';

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
                        console.log(error);
                        if (error) throw error;
                        dbConnection.end();
                    });
            });
        });
    }

    getAllCategoriesFromDatabase(callback) {
        let dbConnection = DatabaseConnection.getConnection();
        dbConnection.query('select * from SPENDING_CATEGORIES', function (error, results) {
            if (error) throw error;
            dbConnection.end();
            callback(results);
        });
    }


    addCategory(category, callback) {
        let spendingCategoryThis = this;
        let dbConnection = DatabaseConnection.getConnection();
        dbConnection.query(
            'INSERT INTO SPENDING_CATEGORIES(categories) VALUES (?)', [category], function (error) {
                if (error) throw error;
                dbConnection.end();
                spendingCategoryThis.getAllCategoriesFromDatabase(callback);
            });
    }



    deleteCategory(category, callback) {
        let spendingCategoryThis = this;
        let dbConnection = DatabaseConnection.getConnection();
        dbConnection.query('DELETE FROM SPENDING_CATEGORIES WHERE categories=?', [category], function (error) {
            if (error) throw error;
            dbConnection.end();
            spendingCategoryThis.getAllCategoriesFromDatabase(callback);
        });
    }
}


module.exports = SpendingCategoriesTable;

/*
spendingCategoriesTable = new SpendingCategoriesTable();
spendingCategoriesTable.getAllCategoriesFromDatabase(function (data) {
    console.log(data);
});
*/


//spendingCategoriesTable.insertCategoryInDatabaseFromCsvFormat();
/*
spendingCategoriesTable.insertCategoryInDatabaseFromCsvFormat(function (data) {

});*/
