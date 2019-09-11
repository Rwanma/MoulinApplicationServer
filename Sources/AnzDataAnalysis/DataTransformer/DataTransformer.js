let DataSpendingClass = require('./SpendingUnit.js');
let SpendingsContainer = require('./SpendingContainer.js');
let FiltersTable = require('../../Database/AnzFilterTable');
let DailyInputDataTable = require('../../Database/DailyInputDataTable');
let HoursTable = require('../../Database/HoursTable');
let AnzSpendingTable = require('../../Database/AnzSpendingTable');
let Config = require('../../Config/Config');

class DataTransformer {
    constructDataInMapFormat(useFilter, callback) {
        let mySpendings = new SpendingsContainer();
        let anzSpendingTable = new AnzSpendingTable();
        let filters = new FiltersTable();

        filters.getAllFiltersFromDatabase(function (filtersArray) {
            anzSpendingTable.getAllAnzSpendingFromTable(function (dataArray) {
                let spending, filterString, category = '';
                for (const arrayElement of dataArray) {

                    // shitty algo necessary to have at least one element. Will change algo later
                    if (filtersArray.length === 0){
                        let  myDummyObj = { categories:'xxxxxxxxxxxxx'};
                        filtersArray.push(myDummyObj);
                    }

                    for (const filterElement of filtersArray) {
                        if (arrayElement.spending_description.toLowerCase().includes('woolworths online')) {
                            filterString = 'woolworths online';
                            category = 'CAFE FOOD';
                        }
                        else if (arrayElement.spending_description.toLowerCase().includes(filterElement.filter.toLowerCase())) {
                            filterString = filterElement.filter;
                            category = filterElement.category;
                        }
                        else if (useFilter === 'false') {
                            filterString = arrayElement.spending_description;
                            category = '';

                        }
                    }

                    if (filterString !== '' && filterString !== undefined) {
                        if(arrayElement.amount < 0) {
                            spending = new DataSpendingClass.SpendingUnit(category, filterString, arrayElement.amount, arrayElement.spending_date);
                            mySpendings.addSpendingUnit(spending);
                            filterString = '';
                        }
                    }
                }
                return callback(mySpendings);
            });
        });
    }

    getTotalData(jsonObj, startDate, endingDate, callback) {
        let beginDate = startDate.getDateInDatabaseFormat();
        let endDate = endingDate.getDateInDatabaseFormat();
        let anzSpendingTable = new AnzSpendingTable();
        let dailyInputs = new DailyInputDataTable();
        let hoursTable = new HoursTable();
        let promises = [];
        promises.push(new Promise((resolve) => {hoursTable.getEmployeeTotalInJson(jsonObj, beginDate, endDate, 'cash', function () {resolve(jsonObj);});}));
        promises.push(new Promise((resolve) => {hoursTable.getEmployeeTotalInJson(jsonObj, beginDate, endDate, 'transfer', function () {resolve(jsonObj);});}));
        promises.push(new Promise((resolve) => {dailyInputs.getRevenuTotalInJson(jsonObj, beginDate, endDate, 'cash_revenu', function () {resolve(jsonObj);});}));
        promises.push(new Promise((resolve) => {dailyInputs.getRevenuTotalInJson(jsonObj, beginDate, endDate, 'ftpos_revenu', function () {resolve(jsonObj);});}));
        promises.push(new Promise((resolve) => {anzSpendingTable.getAnzSpendingTotalInJson(jsonObj, beginDate, endDate, function () {resolve(jsonObj);});}));
        Promise.all(promises).then(function () {

            let jQGridRecapColumns  = [];
            jQGridRecapColumns.push({ text: 'Category', datafield: 'Category', width: 300});
            jQGridRecapColumns.push({ text: 'Cash', datafield: 'Cash', width: 400, aggregates: ['sum']});
            jQGridRecapColumns.push({ text: 'Transfer', datafield: 'Transfer', width: 400, aggregates: ['sum']});
            jQGridRecapColumns.push({ text: 'Total', datafield: 'Total', width: 400, aggregates: ['sum']});

            let rentArray = {};
            rentArray['Category'] = 'RENT';
            rentArray['Transfer'] = - Config.getPriceConfig().rent * jsonObj.numberOfDays;
            rentArray['Total'] = - Config.getPriceConfig().rent * jsonObj.numberOfDays;

            let employeeSalaryArray = {};
            employeeSalaryArray['Category'] = 'SALARIES';
            employeeSalaryArray['Cash'] = -jsonObj.employeeCashTotal;
            employeeSalaryArray['Transfer'] = -jsonObj.employeeTransferTotal;
            employeeSalaryArray['Total'] = -jsonObj.employeeCashTotal - jsonObj.employeeTransferTotal;

            let anzSpendingArray = {};
            anzSpendingArray['Category'] = 'ANZ SPENDING';
            anzSpendingArray['Transfer'] = jsonObj.totalAnzSpending;
            anzSpendingArray['Total'] = jsonObj.totalAnzSpending;

            let revenueArray = {};
            revenueArray['Category'] = 'REVENUE';
            revenueArray['Cash'] = jsonObj.cashRevenuTotal;
            revenueArray['Transfer'] = jsonObj.ftposRevenuTotal;
            revenueArray['Total'] = jsonObj.cashRevenuTotal + jsonObj.ftposRevenuTotal;

            let recapSource = [];
            recapSource.push(employeeSalaryArray);
            recapSource.push(rentArray);
            recapSource.push(anzSpendingArray);
            recapSource.push(revenueArray);

            jsonObj.jQGridRecapColumns = jQGridRecapColumns;
            jsonObj.jQGridRecapSource = recapSource;
            callback(jsonObj);
        });
    }
}

module.exports = DataTransformer;

/*let dataTransformer = new DataTransformer();

dataTransformer.getTotalData('2019-08-01', '2019-08-30', function(totalDataJson){
    console.log(totalDataJson);
});*/


/*dataTransformer.constructDataInMapFormat('false', function(mySpendings){
    //console.log(mySpendings);
});*/




