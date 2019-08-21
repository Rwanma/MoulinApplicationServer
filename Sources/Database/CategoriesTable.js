let DatabaseConnection = require('./DatabaseConnection.js');
let Logger = require('../../Sources/Logger/Logger');
let logger = new Logger();
let SqlString = require('sqlstring');

class CategoriesTable {


    getAllCategories(callback) {
        logger.log('CATEGORIES_TABLE - getAllCategories');
        DatabaseConnection.query(SqlString.format('select * from CATEGORIES'), function (results) {
            if (results === null) {
                logger.log('CATEGORIES_TABLE - DATABASE ERROR getAllCategories');
            }
            callback(results);
        });
    }


    getAllCategoriesForGridComboBox(callback) {
        this.getAllCategories(function (results) {
            let dataInComboBoxFormat = [];
            results.forEach(function (category) {
                dataInComboBoxFormat.push(category.category);
            });
            callback(dataInComboBoxFormat);
        });
    }

    addCategory(category, callback) {
        logger.log('CATEGORIES_TABLE - addCategory: ' + category);
        DatabaseConnection.query(SqlString.format('INSERT INTO CATEGORIES(category) VALUES (?)', [category]), function (results) {
            if (results === null) {
                logger.log('CATEGORIES_TABLE - DATABASE ERROR addCategory');
            }
            callback();
        });
    }


    addCategories(categories, callback) {
        logger.log('CATEGORIES_TABLE - addCategories: ' + categories);
        DatabaseConnection.query(SqlString.format('delete from CATEGORIES'), function (sucessfulDelete) {
            if (sucessfulDelete === null) {
                callback('error in CATEGORIES_TABLE - addCategories')
            } else {
                /*                let array = [['TOTO'], ['TATA']];
                                console.log('**********************************************');
                                console.log(SqlString.format('INSERT INTO CATEGORIES(category) VALUES ?', [array]));
                                console.log('**********************************************');*/
                DatabaseConnection.query(SqlString.format('INSERT INTO CATEGORIES VALUES ?', [categories]), function (results) {
                    callback();
                });
            }
        });
    }



    deleteCategory(category, callback) {
        logger.log('CATEGORIES_TABLE - deleteCategory: ' + category);
        DatabaseConnection.query(SqlString.format('DELETE FROM CATEGORIES WHERE category=?', [category]), function (results) {
            if (results === null) {
                logger.log('CATEGORIES_TABLE - DATABASE ERROR deleteCategory');
            }
            callback();
        });
    }


}


module.exports = CategoriesTable;


/*categoriesTable = new CategoriesTable();

//spendingCategoriesTable.insertCategoryInDatabaseFromCsvFormat();
categoriesTable.deleteCategory("titi", function (results) {
    console.log(results);

});*/





