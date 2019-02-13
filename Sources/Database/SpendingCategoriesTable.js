
let mysql = require('mysql');
let ExcelReader = require('node-excel-stream').ExcelReader;
const fs = require('fs');


class SpendingCategoriesTable {
    constructor() {
        this.connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Sqlpass01',
            database: 'test_database'
        });
    }


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
        let categoryThis = this;
        this.getCategoriesFromCsvToDatabase(file, function (categoryArray) {
            categoryThis.connection.query('delete from SPENDING_CATEGORIES', function () {
                categoryThis.connection.query('INSERT INTO SPENDING_CATEGORIES(categories) VALUES ?',
                    [categoryArray], function (error) {
                        console.log(error);
                        if (error) throw error;
                    });
            });
        });
    }

    getAllCategoriesFromDatabase(callback) {
        this.connection.query('select * from SPENDING_CATEGORIES', function (error, results) {
            if (error) throw error;
            callback(results);
        });
    }


    addCategory(category, callback) {
        let spendingCategoryThis = this;
        this.connection.query(
            'INSERT INTO SPENDING_CATEGORIES(categories) VALUES (?)', [category], function (error) {
                if (error) throw error;
                spendingCategoryThis.getAllCategoriesFromDatabase(callback);
            });
    }



    deleteCategory(category, callback) {
        let spendingCategoryThis = this;
        this.connection.query('DELETE FROM SPENDING_CATEGORIES WHERE categories=?', [category], function (error) {
            if (error) throw error;
            spendingCategoryThis.getAllCategoriesFromDatabase(callback);
        });
    }
}

module.exports = SpendingCategoriesTable;


/*spendingCategoriesTable = new SpendingCategoriesTable();
spendingCategoriesTable.getAllCategoriesFromDatabase(function (data) {
    console.log(data);
});*/
//spendingCategoriesTable.insertCategoryInDatabaseFromCsvFormat();
/*
spendingCategoriesTable.insertCategoryInDatabaseFromCsvFormat(function (data) {

});*/
