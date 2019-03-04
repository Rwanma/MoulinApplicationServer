"use strict";
let DataSpendingClass = require('./SpendingUnit.js');
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
        });
    }


    transformToAgGridData(beginDate, endDate, callback) {
        let dataSpending = [];
        let jsonObj = {
            columns: {}, data: [], totalAnzSpending: [], averageTotal: []
        };

        let columnTitleArray = [], totalArray = {}, averageTotalArray = {}, allDates = [];
        columnTitleArray.push({ headerName: 'SpendingType', field: 'SpendingType', pinned: 'left', filter: 'agTextColumnFilter' });
        totalArray['SpendingType'] = 'TOTAL';
        averageTotalArray['SpendingType'] = 'AVERAGE';
        let totalSumSpending = 0, numberOfElementsToAverage = 0;
        this.spendingMap.forEach(function (spendingsForOneDay, date) {
            let compareDate = Helper.transformDayMonthYearToDate(date);
            let dayTotal = 0;

            if (beginDate.getOfficialJavascriptDate() <= compareDate && compareDate <= endDate.getOfficialJavascriptDate()) {
                numberOfElementsToAverage++;
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
                    totalSumSpending += spendingUnit.amount;
                });
                totalArray[date] = dayTotal;
                allDates.push(date);
            }
        });

        let averagePerDaySpending = Math.round(totalSumSpending / numberOfElementsToAverage);
        allDates.forEach(function (date) {
            averageTotalArray[date] = averagePerDaySpending;
        });

        jsonObj.columns = columnTitleArray;
        jsonObj.data.push(totalArray);
        jsonObj.data.push(averageTotalArray);
        jsonObj.data.push([]);
        jsonObj.totalAnzSpending.push(totalArray);
        jsonObj.averageTotal.push(averageTotalArray);

        dataSpending.forEach(function (spending) {
            jsonObj.data.push(spending);
        });

        return callback(jsonObj);
    }
}

module.exports = SpendingsContainer;
