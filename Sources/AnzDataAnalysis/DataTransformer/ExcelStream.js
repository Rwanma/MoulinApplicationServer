
let ExcelReader = require('node-excel-stream').ExcelReader;
const fs = require('fs');





class ExcelStream {
    constructor() {
        // Defining reading Variable from constructor
        this.readGenericData = function (mySheets, file, callback) {
            let dataStream = fs.createReadStream(file);
            let reader = new ExcelReader(dataStream, mySheets);
            let myArray = [];
            reader.eachRow((rowData) => { myArray.push(rowData); }).then(() => { return callback(myArray); });
        };
    }

    readConfiguration(callback) {
        let file = './Sources/AnzDataAnalysis/CsvFiles/configLine.xlsx';
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

        this.readGenericData(mySheets, file, function (myArray) {
            return callback(myArray);
        })
    }

    readAnzData(callback) {
        let file = './Sources/AnzDataAnalysis/CsvFiles/anzData.xlsx';
        //let file = '../CsvFiles/anzData.xlsx';
        let mySheets = {
            sheets: [{
                name: 'Data',
                rows: {
                    allowedHeaders: [{
                        name: 'Date',
                        key: 'date'
                    }, {
                        name: 'Amount',
                        key: 'amount'
                    }, {
                        name: 'Description',
                        key: 'description'
                    }]
                }
            }]
        };
        this.readGenericData(mySheets, file, function (myArray) {
            return callback(myArray);
        })

    }

}

module.exports = ExcelStream;



// Testing Code
/*let excelStreamReader = new ExcelStream();
excelStreamReader.readAnzData(function(myArray){
    console.log((myArray));
});*/