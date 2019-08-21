let DatabaseConnection = require('./DatabaseConnection.js');
let CategoriesTable = require('./CategoriesTable.js');
let ExcelReader = require('node-excel-stream').ExcelReader;
const fs = require('fs');
let Logger = require('../../Sources/Logger/Logger');
let logger = new Logger();
let SqlString = require('sqlstring');


class FilterTable {


    transformCsvIntoArray(file, callback) {
        logger.log('FILTER - transformCsvIntoArray');
        let mySheets = {
            sheets: [{
                name: 'Data',
                rows: { allowedHeaders: [{ name: 'filters', key: 'filters' }, { name: 'category', key: 'category' }] }
            }]
        };

        let dataStream = fs.createReadStream(file);
        let reader = new ExcelReader(dataStream, mySheets);
        let filtersArray = [], categoryArray = [], tempCategoryArray = [];
        reader.eachRow((rowData) => {
            let rowArray = [rowData.filters, rowData.category];
            filtersArray.push(rowArray);
            if (rowData.category != null && !tempCategoryArray.includes(rowData.category)) {
                tempCategoryArray.push(rowData.category);
                categoryArray.push([rowData.category]);
            }
        }).then(() => {
            return callback(filtersArray, categoryArray);
        });
    };


    insertFilterInDatabaseFromCsvFormat(file, callback) {
        let spendingFilterThis = this;
        this.transformCsvIntoArray(file, function (filterArray, categoryArray) {

            let categories = new CategoriesTable();
            categories.addCategories(categoryArray, function () {
                DatabaseConnection.query(SqlString.format('delete from FILTERS'), function (results) {
                    if (results === null) {
                        logger.log('FILTER - DATABASE ERROR couldn\'t delete spending filters');
                        callback(null);
                    } else {
                        DatabaseConnection.query(SqlString.format('INSERT INTO FILTERS(filter, category) VALUES ?', [filterArray]), function (results) {
                            if (results === null) {
                                logger.log('FILTER - DATABASE ERROR insertFilterInDatabaseFromCsvFormat');
                            }
                            spendingFilterThis.getConfigGridData(callback);
                        });
                    }
                });
            });
        });
    }


    getAllFiltersFromDatabase(callback) {
        logger.log('FILTER - getAllFiltersFromDatabase');
        DatabaseConnection.query(SqlString.format('select * from FILTERS'), function (results) {
            if (results === null) {
                logger.log('FILTER - DATABASE ERROR getAllFiltersFromDatabase');
            }
            callback(results);
        });
    }


    addFilter(filter, callback) {
        logger.log('FILTER - addFilter: ' + filter);
        let spendingFilterThis = this;
        DatabaseConnection.query(SqlString.format('INSERT INTO FILTERS(filter) VALUES (?)', [filter]), function (results) {
            if (results === null) {
                logger.log('FILTER - DATABASE ERROR addFilter');
            }
            spendingFilterThis.getConfigGridData(callback);
        });
    }



    deleteFilter(filter, callback) {
        logger.log('FILTER - deleteFilter: ' + filter);
        let spendingFilterThis = this;
        DatabaseConnection.query(SqlString.format('DELETE FROM FILTERS WHERE filter=?', [filter]), function (results) {
            if (results === null) {
                logger.log('FILTER - DATABASE ERROR deleteFilter');
            }
            spendingFilterThis.getConfigGridData(callback);
        });
    }


    getConfigGridData(callback) {
        let jsonObj = { spendingFilters: {}, filters: {} };
        let anzFilterTableThis = this;
        let categories = new CategoriesTable();
        categories.getAllCategories(function (categories_result) {
            jsonObj.categories = categories_result;
            categories.getAllCategoriesForGridComboBox(function (combo_box_categories) {
                jsonObj.combo_box_categories = combo_box_categories;
                anzFilterTableThis.getAllFiltersFromDatabase(function (all_filters) {
                    jsonObj.spendingFilters = all_filters;
                    callback(jsonObj);
                });
            });
        });


    }
}


module.exports = FilterTable;

/*spendingCategoriesTable = new FilterTable();

//spendingCategoriesTable.insertFilterInDatabaseFromCsvFormat();
spendingCategoriesTable.getConfigGridData(function () {

});*/
