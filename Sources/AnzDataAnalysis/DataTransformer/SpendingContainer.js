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


    transformToJQGridData(beginDate, endDate, callback) {
        let dataSpending = [];
        let jsonObj = {
            columns: [], data: [], totalAnzSpending: [], averageTotal: []
        };

        let columnTitleArray = [], totalArray = {}, averageTotalArray = {}, allDates = [];
        columnTitleArray.push({ text: 'Spending Type', datafield: 'SpendingType', width: 300});
        this.spendingMap.forEach(function (spendingsForOneDay, date) {
            columnTitleArray.splice(1, 0, { text: date, datafield: date, width: 100 });



        });

        jsonObj.columns = columnTitleArray;

        return callback(jsonObj);
    }



    transformToGridData(groupByCategory, beginDate, endDate, callback) {
        let dataSpending = [];
        let jsonObj = { agGridColumns: {}, agGridData: [], totalAnzSpending: [], averageTotal: [], jqGridColumns : [] , jqGridSource : {} };
        let columnAgGridTitleArray = [], columnJqGridTitleArray = [], totalArray = {}, averageTotalArray = {}, allDates = [];
        let totalSumSpending = 0;

        totalArray['SpendingType'] = 'TOTAL';
        totalArray['Category'] = '';
        totalArray['DateRangeTotal'] = 0;
        averageTotalArray['SpendingType'] = 'AVERAGE';
        averageTotalArray['Category'] = '';
        averageTotalArray['DateRangeTotal'] = '';

        columnAgGridTitleArray.push({ headerName: 'SpendingType', field: 'SpendingType', pinned: 'left', filter: 'agTextColumnFilter' });

        this.spendingMap.forEach(function (spendingsForOneDay, date) {
            let compareDate = Helper.transformDayMonthYearToDate(date);
            let dayTotal = 0;

            if (beginDate.getOfficialJavascriptDate() <= compareDate && compareDate <= endDate.getOfficialJavascriptDate()) {
                columnAgGridTitleArray.splice(1, 0, { headerName: date, field: date, filter: 'agNumberColumnFilter' });
                columnJqGridTitleArray.splice(3, 0, { text: date, datafield: date, aggregates: ['sum'], width: 100 });

                spendingsForOneDay.myArray.forEach(function (spendingUnit) {
                    let spendingAlreadyAdded = false;

                    for (let i in dataSpending) {
                        if (dataSpending[i]['SpendingType'] === spendingUnit.description) {
                            dataSpending[i][date] = spendingUnit.description;
                            dataSpending[i][date] = (Math.round(spendingUnit.amount * 100) / 100);
                            dataSpending[i]['DateRangeTotal'] += spendingUnit.amount;
                            dataSpending[i]['DateRangeTotal'] = (Math.round(dataSpending[i]['DateRangeTotal'] * 100) / 100);
                            spendingAlreadyAdded = true;
                        }
                    }

                    if (!spendingAlreadyAdded) {
                        let newSpendingTypeArray = {};
                        newSpendingTypeArray['Category'] = spendingUnit.category;
                        newSpendingTypeArray['SpendingType'] = spendingUnit.description;
                        newSpendingTypeArray['DateRangeTotal'] = (Math.round(spendingUnit.amount * 100) / 100);
                        newSpendingTypeArray[date] = (Math.round(spendingUnit.amount * 100) / 100);

                        dataSpending.push(newSpendingTypeArray);
                    }

                    dayTotal += (Math.round(spendingUnit.amount * 100) / 100);
                    totalSumSpending += (Math.round(spendingUnit.amount * 100) / 100);
                }); //spendingsForOneDay forEach


                totalArray[date] = dayTotal;
                totalArray['DateRangeTotal'] += dayTotal;
                allDates.push(date);
            }
        });

        let dateArray = Helper.getDatesRangeArray(beginDate.getOfficialJavascriptDate(), endDate.getOfficialJavascriptDate());
        let numberOfElementsToAverage = dateArray.length;
        let averagePerDaySpending = Math.round(totalSumSpending / numberOfElementsToAverage);

        dateArray.forEach(function (date) {
            averageTotalArray[date] = averagePerDaySpending;
        });

        if (groupByCategory === 'false') {
            jsonObj.agGridData.push(totalArray);
            jsonObj.agGridData.push(averageTotalArray);
            jsonObj.agGridData.push([]);
        }

        columnJqGridTitleArray.sort(function(dateA,dateB){
            let compareDateA = Helper.transformDayMonthYearToDate(dateA.text);
            let compareDateB = Helper.transformDayMonthYearToDate(dateB.text);
            return compareDateA - compareDateB;
        });

        columnJqGridTitleArray.splice(0, 0, { text: 'Date Range Total', datafield: 'DateRangeTotal', aggregates: ['sum'], width: 120});
        columnJqGridTitleArray.splice(0, 0, { text: 'Category', datafield: 'Category', width: 150});
        columnJqGridTitleArray.splice(0, 0, { text: 'Spending Type', datafield: 'SpendingType', width: 150});

        jsonObj.agGridColumns = columnAgGridTitleArray;
        jsonObj.jqGridColumns = columnJqGridTitleArray;
        jsonObj.totalAnzSpending.push(totalArray);
        jsonObj.averageTotal.push(averageTotalArray);

        dataSpending.forEach(function (spending) {
            jsonObj.agGridData.push(spending);
        });

        return callback(jsonObj);
    }
}

module.exports = SpendingsContainer;
