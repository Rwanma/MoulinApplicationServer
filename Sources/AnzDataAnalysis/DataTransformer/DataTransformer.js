let DataSpendingClass = require('./SpendingUnit.js');
let SpendingsContainer = require('./SpendingContainer.js');
let AnzSpendingTable = require('../../Database/AnzSpendingTable');
let SpendingCategoriesTable = require('../../Database/SpendingCategoriesTable');


class DataTransformer {
    constructDataInMapFormat(useFilter, callback) {
        let mySpendings = new SpendingsContainer();
        let anzSpendingTable = new AnzSpendingTable();
        let spendingCategoriesTable = new SpendingCategoriesTable();

        spendingCategoriesTable.getAllCategoriesFromDatabase(function (configArray) {
            anzSpendingTable.getAllAnzSpendingFromTable(function (dataArray) {
                let spending, categoryString;
                for (const arrayElement of dataArray) {
                    for (const configElement of configArray) {
                        if (arrayElement.spending_description.toLowerCase().includes('woolworths online')) {
                            categoryString = 'woolworths online';
                        }
                        else if (arrayElement.spending_description.toLowerCase().includes(configElement.categories.toLowerCase())) {
                            categoryString = configElement.categories;
                        }
                        else if (useFilter === 'false') {
                            categoryString = arrayElement.spending_description;
                        }
                    }

                    if (categoryString !== '' && categoryString !== undefined) {
                        spending = new DataSpendingClass.SpendingUnit(categoryString, arrayElement.amount, arrayElement.spending_date);
                        mySpendings.addSpendingUnit(spending);
                        categoryString = '';
                    }
                }
                return callback(mySpendings);
            });
        });
    }
}

/*let dataTransformer = new DataTransformer();
dataTransformer.constructDataInMapFormat('false', function(mySpendings){
    //console.log(mySpendings);
});*/


module.exports = DataTransformer;

