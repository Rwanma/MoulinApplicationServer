let express = require("express");
let bodyParser = require("body-parser");
let DataTransormer = require("./Sources/AnzDataAnalysis/DataTransformer/DataTransformer.js");
let EmployeeHours = require("./Sources/Employees/EmployeeHours");
let Helper = require('./Sources/Helpers/Helpers.js');
let EmployeeTable = require('./Sources/Database/EmployeeTable');
let HoursTable = require('./Sources/Database/HoursTable');
let IncomingForm = require('formidable').IncomingForm;
let AnzSpendingTable = require('./Sources/Database/AnzSpendingTable');
let SpendingCategoriesTable = require('./Sources/Database/SpendingCategoriesTable');
let DailyInputsTable = require('./Sources/Database/DailyInputsTable');
let DailyRealData = require('./Sources/AnzDataAnalysis/DataTransformer/DailyRealData');
let LoginsTable = require('./Sources/Database/LoginsTable');


let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let server = app.listen(3005, function () {
    console.log("app running on port.", server.address().port);
    app.use(function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
        res.setHeader('Access-Control-Allow-Credentials', true);
        next();
    });


    // ***************************************************************************************************************************************
    //ANZ DATA
    app.get("/getAnzSpending", function (req, res) {
        let dataTransformerWithDates = new DataTransormer();
        console.log(req.query);
        dataTransformerWithDates.constructDataInMapFormat(req.query.useFilter, function (mySpendingWithDates) {
            mySpendingWithDates.transformToAgGridData(new Helper.MyDateClass(req.query.beginDate), new Helper.MyDateClass(req.query.endDate), function (JsonData) {
                res.status(200).send(JsonData);
            });
        });
    });


    app.post('/uploadAnzCsv', function (req, res) {
        res.status(200).send('');
        console.log('uploading ANZ csv file');
        let form = new IncomingForm();
        form.uploadDir = 'Sources/AnzDataAnalysis/CsvFiles';
        form.parse(req, function (err, fields, files) {
            if (err) {
                console.log('some error', err);
            } else {
                let anzSpendingTable = new AnzSpendingTable();
                anzSpendingTable.insertAllAnzSpendings(files.filepond.path);
            }
        });
    });

    // ***************************************************************************************************************************************


    // ***************************************************************************************************************************************
    //ANZ CONFIGURATION
    app.post('/uploadConfigurationCategory', function (req, res) {
        res.status(200).send('');
        let form = new IncomingForm();
        form.uploadDir = 'Sources/AnzDataAnalysis/CsvFiles';
        form.parse(req, function (err, fields, files) {
            if (err) {
                console.log('some error', err);
            } else {
                let spendingCategoriesTable = new SpendingCategoriesTable();
                spendingCategoriesTable.insertCategoryInDatabaseFromCsvFormat(files.filepond.path, function () {
                    let spendingCategoriesTable = new SpendingCategoriesTable();
                    spendingCategoriesTable.getAllCategoriesFromDatabase(function (JsonData) {
                        res.status(200).send(JsonData);
                    });
                });
            }
        });
    });

    app.get("/GetAnzConfiguration", function (req, res) {
        let spendingCategoriesTable = new SpendingCategoriesTable();
        spendingCategoriesTable.getAllCategoriesFromDatabase(function (JsonData) {
            res.status(200).send(JsonData);
        });

    });

    app.get("/AddAnzConfiguration", function (req, res) {
        let spendingCategoriesTable = new SpendingCategoriesTable();
        spendingCategoriesTable.addCategory(req.query.category, function () {
            spendingCategoriesTable.getAllCategoriesFromDatabase(function (JsonData) {
                res.status(200).send(JsonData);
            });
        });
    });

    app.get("/DeleteAnzConfiguration", function (req, res) {
        let spendingCategoriesTable = new SpendingCategoriesTable();
        spendingCategoriesTable.deleteCategory(req.query.category, function () {
            spendingCategoriesTable.getAllCategoriesFromDatabase(function (JsonData) {
                res.status(200).send(JsonData);
            });
        });
    });
    // ***************************************************************************************************************************************

    // ***************************************************************************************************************************************
    // DAILY REAL DATA
    app.get("/getFinancialDailyData", function (req, res) {
        let dailyRealData = new DailyRealData();
        dailyRealData.getDailyData(new Helper.MyDateClass(req.query.beginDate), new Helper.MyDateClass(req.query.endDate), function (JsonData) {
            //console.log(JsonData);
            res.status(200).send(JsonData);
        });
    });

    //************************************************************************************************************************************

    // ***************************************************************************************************************************************
    //EMPLOYEES
    app.get("/Employees", function (req, res) {
        let employeeTable = new EmployeeTable();
        employeeTable.getAllDatabaseEmployees(function (EmployeeDataJson) {
            res.status(200).send(EmployeeDataJson);
            //console.log('Employee Data : ' + EmployeeDataJson);
        });

    });


    app.get("/addEmployee", function (req, res) {
        console.log('addingEmployee : ' + req.query.firstName + ' ' + req.query.lastName + ' ' + req.query.salaryTransfer + ' ' + req.query.salaryCash);
        let employeeDatabase = new EmployeeTable();
        employeeDatabase.addEmployee(req.query.firstName, req.query.lastName, req.query.salaryTransfer, req.query.salaryCash, function (EmployeeDataJson) {
            res.status(200).send(EmployeeDataJson);
            //console.log('Employee Data : ' + EmployeeDataJson);
        });
    });


    app.get("/modifyEmployee", function (req, res) {
        let employeeDatabase = new EmployeeTable();
        employeeDatabase.modifyEmployee(req.query.id, req.query.firstName, req.query.lastName, req.query.salaryTransfer, req.query.salaryCash, function (EmployeeDataJson) {
            res.status(200).send(EmployeeDataJson);
            //console.log('Employee Data : ' + EmployeeDataJson);
        });
    });


    app.get("/deleteEmployee", function (req, res) {
        console.log('deleteEmployee : ' + req.query.id);
        let employeeDatabase = new EmployeeTable();
        employeeDatabase.deleteEmployee(req.query.id, function (EmployeeDataJson) {
            res.status(200).send(EmployeeDataJson);
            //console.log('Employee Data : ' + EmployeeDataJson);
        });
    });
    // ***************************************************************************************************************************************


    // ***************************************************************************************************************************************
    //EMPLOYEE HOURS
    app.get("/GetEmployeeHoursTable", function (req, res) {
        let employeeHours = new EmployeeHours();
        console.log('Employee Hours : ' + req.query.beginDate + ' ' + req.query.endDate);
        employeeHours.getHoursForEmployeesInJson(new Helper.MyDateClass(req.query.beginDate), new Helper.MyDateClass(req.query.endDate), function (employeeHoursJson) {
            res.status(200).send(employeeHoursJson);
        });
    });


    //EMPLOYEE HOURS UPDATE
    app.get("/UpdateEmployeeHourTable", function (req, res) {
        console.log('Update Table: ' + req.query.employeeID + ' ' + req.query.dateSelected + ' ' + req.query.paymentType + ' ' + req.query.hoursChanged
            + ' ' + req.query.beginDate + ' ' + req.query.endDate);
        let hoursTable = new HoursTable();
        hoursTable.updateHours(req.query.employeeID, new Helper.MyDateClass(req.query.dateSelected), req.query.paymentType, parseInt(req.query.hoursChanged, 10), function (employeeHoursJson) {
            let employeeHours = new EmployeeHours();
            console.log('Employee Hours : ' + req.query.beginDate + ' ' + req.query.endDate);
            employeeHours.getHoursForEmployeesInJson(new Helper.MyDateClass(req.query.beginDate), new Helper.MyDateClass(req.query.endDate), function (employeeHoursJson) {
                res.status(200).send(employeeHoursJson);
            });
        });
    });
    // ***************************************************************************************************************************************


    // ***************************************************************************************************************************************
    //DAILY INPUT
    app.get("/GetDailyInputs", function (req, res) {
        let dailyInputsTable = new DailyInputsTable();
        console.log('Daily input : ' + req.query.beginDate + ' ' + req.query.endDate);
        dailyInputsTable.getDailyInputsInJson(new Helper.MyDateClass(req.query.beginDate), new Helper.MyDateClass(req.query.endDate), req.query.allowTableChanges, function (dailyInputJson) {
            res.status(200).send(dailyInputJson);
        });
    });


    app.get("/UpdateDailyInputs", function (req, res) {
        console.log('Update Input Table: ' + req.query.workDate + ' ' + req.query.typeChanged + ' ' + req.query.newValue);
        let dailyInputsTable = new DailyInputsTable();
        dailyInputsTable.updateInputTable(new Helper.MyDateClass(req.query.workDate), req.query.typeChanged, parseInt(req.query.newValue, 10), function () {
            dailyInputsTable.getDailyInputsInJson(new Helper.MyDateClass(req.query.beginDate), new Helper.MyDateClass(req.query.endDate), 'true', function (dailyInputJson) {
                res.status(200).send(dailyInputJson);
            });
        });
    });


    // ***************************************************************************************************************************************



    // ***************************************************************************************************************************************
    // LOGINS
    app.get("/GetLoginRole", function (req, res) {
        let loginsTable = new LoginsTable();
        console.log('Login Inputs: ' + req.query.login + ' ' + req.query.password);
        loginsTable.getLoginType(req.query.login, req.query.password, function (loginRole) {
            res.status(200).send({ 'role': loginRole });
        });
    });
    // ***************************************************************************************************************************************



});
