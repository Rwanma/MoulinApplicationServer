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
let Logger = require('./Sources/Logger/Logger');
let logger = new Logger();

let app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let server = app.listen(3005, function () {
    logger.log('app running on port : ' + server.address().port);
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
        logger.log('GET ANZ DATA REQUEST: ' + req.originalUrl);
        let dataTransformerWithDates = new DataTransormer();
        dataTransformerWithDates.constructDataInMapFormat(req.query.useFilter, function (mySpendingWithDates) {
            mySpendingWithDates.transformToAgGridData(new Helper.MyDateClass(req.query.beginDate), new Helper.MyDateClass(req.query.endDate), function (JsonData) {
                res.status(200).send(JsonData);
            });
        });
    });


    app.post('/uploadAnzCsv', function (req, res) {
        logger.log('UPLOAD ANZ DATA REQUEST: ' + req.originalUrl);
        res.status(200).send('');
        let form = new IncomingForm();
        form.uploadDir = 'Sources/AnzDataAnalysis/CsvFiles';
        form.parse(req, function (err, fields, files) {
            if (err) {
                logger.log('ERROR in uploadAnzCsv: ' + err);
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
        logger.log('UPLOAD CONFIGURATION REQUEST: ' + req.originalUrl);
        res.status(200).send('');
        let form = new IncomingForm();
        form.uploadDir = 'Sources/AnzDataAnalysis/CsvFiles';
        form.parse(req, function (err, fields, files) {
            if (err) {
                logger.log('ERROR in uploadConfigurationCategory: ' + err);
            } else {
                let spendingCategoriesTable = new SpendingCategoriesTable();
                spendingCategoriesTable.insertCategoryInDatabaseFromCsvFormat(files.filepond.path, function () {
                    spendingCategoriesTable.getAllCategoriesFromDatabase(function (JsonData) {
                        res.status(200).send(JsonData);
                    });
                });
            }
        });
    });

    app.get("/GetAnzConfiguration", function (req, res) {
        logger.log('GET ANZ CONFIGURATION REQUEST: ' + req.originalUrl);
        let spendingCategoriesTable = new SpendingCategoriesTable();
        spendingCategoriesTable.getAllCategoriesFromDatabase(function (JsonData) {
            res.status(200).send(JsonData);
        });

    });

    app.get("/AddAnzConfiguration", function (req, res) {
        logger.log('ADD ANZ CONFIGURATION REQUEST: ' + req.originalUrl);
        let spendingCategoriesTable = new SpendingCategoriesTable();
        spendingCategoriesTable.addCategory(req.query.category, function () {
            spendingCategoriesTable.getAllCategoriesFromDatabase(function (JsonData) {
                res.status(200).send(JsonData);
            });
        });
    });

    app.get("/DeleteAnzConfiguration", function (req, res) {
        logger.log('DELETE ANZ CONFIGURATION REQUEST: ' + req.originalUrl);
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
        logger.log('GET FINANCIAL DATA REQUEST: ' + req.originalUrl);
        let dailyRealData = new DailyRealData();
        dailyRealData.getDailyData(new Helper.MyDateClass(req.query.beginDate), new Helper.MyDateClass(req.query.endDate), function (JsonData) {
            res.status(200).send(JsonData);
        });
    });

    //************************************************************************************************************************************

    // ***************************************************************************************************************************************
    //EMPLOYEES
    app.get("/Employees", function (req, res) {
        logger.log('GET EMPLOYEES REQUEST: ' + req.originalUrl);
        let employeeTable = new EmployeeTable();
        employeeTable.getAllDatabaseEmployees(function (EmployeeDataJson) {
            res.status(200).send(EmployeeDataJson);
        });

    });


    app.get("/addEmployee", function (req, res) {
        logger.log('ADD EMPLOYEE REQUEST: ' + req.originalUrl);
        let employeeDatabase = new EmployeeTable();
        employeeDatabase.addEmployee(req.query.firstName, req.query.lastName, req.query.salaryTransfer, req.query.salaryCash, function (EmployeeDataJson) {
            res.status(200).send(EmployeeDataJson);
        });
    });


    app.get("/modifyEmployee", function (req, res) {
        logger.log('MODIFY EMPLOYEE REQUEST: ' + req.originalUrl);
        let employeeDatabase = new EmployeeTable();
        employeeDatabase.modifyEmployee(req.query.id, req.query.firstName, req.query.lastName, req.query.salaryCash, req.query.salaryTransfer, function (EmployeeDataJson) {
            res.status(200).send(EmployeeDataJson);
        });
    });


    app.get("/deleteEmployee", function (req, res) {
        logger.log('DELETE EMPLOYEE REQUEST: ' + req.originalUrl);
        let employeeDatabase = new EmployeeTable();
        employeeDatabase.deleteEmployee(req.query.id, function (EmployeeDataJson) {
            res.status(200).send(EmployeeDataJson);
        });
    });
    // ***************************************************************************************************************************************


    // ***************************************************************************************************************************************
    //EMPLOYEE HOURS
    app.get("/GetEmployeeHoursTable", function (req, res) {
        logger.log('GET EMPLOYEE HOUR TABLE REQUEST: ' + req.originalUrl);
        let employeeHours = new EmployeeHours();
        console.log('Employee Hours : ' + req.query.beginDate + ' ' + req.query.endDate);
        employeeHours.getHoursForEmployeesInJson(new Helper.MyDateClass(req.query.beginDate), new Helper.MyDateClass(req.query.endDate), function (employeeHoursJson) {
            res.status(200).send(employeeHoursJson);
        });
    });


    //EMPLOYEE HOURS UPDATE
    app.get("/UpdateEmployeeHourTable", function (req, res) {
        logger.log('UPDATE EMPLOYEE HOUR TABLE REQUEST: ' + req.originalUrl);
        let hoursTable = new HoursTable();
        hoursTable.updateHours(req.query.employeeID, new Helper.MyDateClass(req.query.dateSelected), req.query.paymentType, parseInt(req.query.hoursChanged, 10), function () {
            let employeeHours = new EmployeeHours();
            employeeHours.getHoursForEmployeesInJson(new Helper.MyDateClass(req.query.beginDate), new Helper.MyDateClass(req.query.endDate), function (employeeHoursJson) {
                res.status(200).send(employeeHoursJson);
            });
        });
    });
    // ***************************************************************************************************************************************


    // ***************************************************************************************************************************************
    //DAILY INPUT
    app.get("/GetDailyInputs", function (req, res) {
        logger.log('GET DAILY INPUT REQUEST: ' + req.originalUrl);
        let dailyInputsTable = new DailyInputsTable();
        dailyInputsTable.getDailyInputsInJson(new Helper.MyDateClass(req.query.beginDate), new Helper.MyDateClass(req.query.endDate), req.query.allowTableChanges, function (dailyInputJson) {
            res.status(200).send(dailyInputJson);
        });
    });


    app.get("/UpdateDailyInputs", function (req, res) {
        logger.log('UPDATE DAILY INPUT REQUEST: ' + req.originalUrl);
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
        logger.log('LOGIN REQUEST: ' + req.originalUrl);
        let loginsTable = new LoginsTable();
        loginsTable.getLoginType(req.query.login, req.query.password, function (loginRole) {
            res.status(200).send({ 'role': loginRole });
        });
    });
    // ***************************************************************************************************************************************



});
