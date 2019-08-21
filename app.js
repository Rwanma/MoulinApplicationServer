let express = require("express");
let bodyParser = require("body-parser");
let DataTransormer = require("./Sources/AnzDataAnalysis/DataTransformer/DataTransformer.js");
let EmployeeHours = require("./Sources/Employees/EmployeeHours");
let Helper = require('./Sources/Helpers/Helpers.js');
let EmployeeTable = require('./Sources/Database/EmployeeTable');
let HoursTable = require('./Sources/Database/HoursTable');
let IncomingForm = require('formidable').IncomingForm;
let AnzSpendingTable = require('./Sources/Database/AnzSpendingTable');
let AnzFilterTable = require('./Sources/Database/AnzFilterTable');
let CategoriesTable = require('./Sources/Database/CategoriesTable');
let DailyInputDataTable = require('./Sources/Database/DailyInputDataTable');
let DailyRealData = require('./Sources/AnzDataAnalysis/DataTransformer/DailyRealData');
let LoginsTable = require('./Sources/Database/LoginsTable');
let Logger = require('./Sources/Logger/Logger');
let Config = require('./Sources/Config/Config');
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
        form.uploadDir = Config.getCsvDirectory();
        form.parse(req, function (err, fields, files) {
            if (err) {
                logger.log('ERROR in uploadAnzCsv: ' + err);
            } else {
                let anzSpendingTable = new AnzSpendingTable();
                anzSpendingTable.insertAllAnzSpendings(files.filepond.path, function (req, res) {

                });
            }
        });
    });

    // ***************************************************************************************************************************************


    // ***************************************************************************************************************************************
    //ANZ FILTER
    app.get("/GetAllConfigData", function (req, res) {
        logger.log('GET ANZ CONFIGURATION REQUEST: ' + req.originalUrl);
        let filterTable = new AnzFilterTable();
        filterTable.getConfigGridData(function (JsonData) {
            res.status(200).send(JsonData);
        });

    });

    app.post('/uploadFilters', function (req, res) {
        logger.log('UPLOAD CONFIGURATION REQUEST: ' + req.originalUrl);
        let form = new IncomingForm();
        form.uploadDir = Config.getCsvDirectory();
        form.parse(req, function (err, fields, files) {
            if (err) {
                logger.log('ERROR in uploadFilters: ' + err);
            } else {
                let filterTable = new AnzFilterTable();
                filterTable.insertFilterInDatabaseFromCsvFormat(files.filepond.path, function (JsonData) {
                    res.status(200).send(JsonData);
                });
            }
        });
    });

    app.get("/AddFilter", function (req, res) {
        logger.log('ADD FILTER REQUEST: ' + req.originalUrl);
        let filterTable = new AnzFilterTable();
        filterTable.addFilter(req.query.filter, function () {
            filterTable.getConfigGridData(function (JsonData) {
                res.status(200).send(JsonData);
            });
        });
    });

    app.get("/DeleteFilter", function (req, res) {
        logger.log('DELETE FILTER REQUEST: ' + req.originalUrl);
        let filterTable = new AnzFilterTable();
        filterTable.deleteFilter(req.query.filter, function () {
            filterTable.getConfigGridData(function (JsonData) {
                res.status(200).send(JsonData);
            });
        });
    });
    // ***************************************************************************************************************************************

    // ***************************************************************************************************************************************
    // CATEGORIES
    app.get("/getAllCategoriesForGridComboBox", function (req, res) {
        logger.log('GET CATEGORIES REQUEST: ' + req.originalUrl);
        let categoriesTable = new CategoriesTable();
        categoriesTable.getAllCategoriesForGridComboBox(function (JsonData) {
            res.status(200).send(JsonData);
        });
    });


    app.get("/AddCategory", function (req, res) {
        logger.log('ADD CATEGORY REQUEST: ' + req.originalUrl);
        let filterTable = new AnzFilterTable();
        let categoriesTable = new CategoriesTable();
        categoriesTable.addCategory(req.query.category, function () {
            filterTable.getConfigGridData(function (JsonData) {
                res.status(200).send(JsonData);
            });
        });
    });

    app.get("/deletecategory", function (req, res) {
        logger.log('DELETE CATEGORIES REQUEST: ' + req.originalUrl);
        let categoriesTable = new CategoriesTable();
        let filterTable = new AnzFilterTable();
        categoriesTable.deleteCategory(req.query.category, function () {
            filterTable.getConfigGridData(function (JsonData) {
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
    //DAILY INPUT DATA

    //DailyInputDataTable
    app.get("/GetDailyInputs", function (req, res) {
        logger.log('GET DAILY INPUT REQUEST: ' + req.originalUrl);
        let dailyInputsTable = new DailyInputDataTable();
        dailyInputsTable.getDailyInputDataInJson(new Helper.MyDateClass(req.query.beginDate), new Helper.MyDateClass(req.query.endDate), req.query.allowTableChanges, function (dailyInputJson) {
            res.status(200).send(dailyInputJson);
        });
    });


    app.get("/UpdateDailyInputs", function (req, res) {
        logger.log('UPDATE DAILY INPUT REQUEST: ' + req.originalUrl);

        let dailyInputsTable = new DailyInputDataTable();
        dailyInputsTable.updateInputDataTable(new Helper.MyDateClass(req.query.workDate), req.query.typeChanged, req.query.newValue, function () {
            dailyInputsTable.getDailyInputDataInJson(new Helper.MyDateClass(req.query.beginDate), new Helper.MyDateClass(req.query.endDate), 'true', function (dailyInputJson) {
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
