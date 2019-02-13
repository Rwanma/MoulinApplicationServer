

"use strict";
let DataSpendingClass = require('./SpendingUnit.js');
//import '../../Helpers/Helpers';

let Helper = require('../../Helpers/Helpers.js');



class SpendingsContainer {
    constructor() {
        this.spendingMap = new Map();
    }


    addSpendingUnit(mySpendingUnit) {
        let daySpending;
        if (this.spendingMap.get(mySpendingUnit.date) === undefined) {
            daySpending = new DataSpendingClass.SpendingsForOneDay(mySpendingUnit.date);
            this.spendingMap.set(mySpendingUnit.date, daySpending)
        }
        else {
            daySpending = (this.spendingMap.get(mySpendingUnit.date));
        }

        daySpending.addSpendingUnit(mySpendingUnit);
    }

    printData() {
        this.spendingMap.forEach(function (spendingDay, date) {

            console.log('****************************************************************');
            console.log('printing for the date: ' + date);
            spendingDay.printData();
            console.log('****************************************************************');
        });
    }


    transformToAgGridData(beginDate, endDate, callback) {
        let dataSpending = [];
        let jsonObj = {
            columns: {}, data: [], totalAnzSpending: []
        };


        let columnTitleArray = [], totalArray = {};
        columnTitleArray.push({ headerName: 'SpendingType', field: 'SpendingType', pinned: 'left', filter: 'agTextColumnFilter' });
        totalArray['SpendingType'] = 'TOTAL';
        this.spendingMap.forEach(function (spendingsForOneDay, date) {
            let compareDate = Helper.transformDayMonthYearToDate(date);
            let dayTotal = 0;

            if (beginDate.getOfficialJavascriptDate() <= compareDate && compareDate <= endDate.getOfficialJavascriptDate()) {
                columnTitleArray.splice(1, 0, { headerName: date, field: date, filter: 'agNumberColumnFilter' });

                spendingsForOneDay.myArray.forEach(function (spendingUnit) {
                    let spendingAlreadyAdded = false;

                    for (let i in dataSpending) {
                        if (dataSpending[i]['SpendingType'] === spendingUnit.description) {
                            dataSpending[i][date] = spendingUnit.description;
                            dataSpending[i][date] = spendingUnit.amount;
                            spendingAlreadyAdded = true;
                        }
                    }

                    if (!spendingAlreadyAdded) {
                        let newSpendingTypeArray = {};
                        newSpendingTypeArray['SpendingType'] = spendingUnit.description;
                        newSpendingTypeArray[date] = spendingUnit.amount;
                        dataSpending.push(newSpendingTypeArray);
                    }

                    dayTotal += spendingUnit.amount;
                });
                totalArray[date] = dayTotal;
            }
        });

        jsonObj.columns = columnTitleArray;
        jsonObj.data.push(totalArray);
        jsonObj.data.push([]);
        jsonObj.totalAnzSpending.push(totalArray);

        dataSpending.forEach(function (spending) {
            jsonObj.data.push(spending);
            //console.log(spending);
        });



        return callback(jsonObj);
    }


}

module.exports = SpendingsContainer;
