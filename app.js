let express = require("express");
let bodyParser = require("body-parser");
let DataTransormer = require("./Sources/AnzDataAnalysis/DataTransformer/DataTransformer.js");
let EmployeeHours = require("./Sources/Employees/EmployeeHours");
let Helper = require('./Sources/Helpers/Helpers.js');
let EmployeeTable = require('./Sources/Database/EmployeeTable');
let HoursTable = require('./Sources/Database/HoursTable');
let IncomingForm = require('formidable').IncomingForm;
let AnzSpendingTable = require('./Sources/Database/AnzSpendingTable');
let PersonalSpendingTable = require('./Sources/Database/PersonalSpendingTable');
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
    app.get("/getGridSpending", function (req, res) {
        logger.log('GET ANZ DATA REQUEST: ' + req.originalUrl);
        let dataTransformerWithDates = new DataTransormer();
        dataTransformerWithDates.constructDataInMapFormat(req.query.useFilter, function (mySpendingWithDates) {
            mySpendingWithDates.transformToGridData(req.query.groupByCategory, new Helper.MyDateClass(req.query.beginDate), new Helper.MyDateClass(req.query.endDate), function (JsonData) {
                res.status(200).send(JsonData);
            });
        });
    });


    app.get("/getAnzSpendingInjQGridFormat", function (req, res) {
        logger.log('GET ANZ DATA FOR JQ GRID REQUEST: ' + req.originalUrl);
        let dataTransformerWithDates = new DataTransormer();
        dataTransformerWithDates.constructDataInMapFormat(req.query.useFilter, function (mySpendingWithDates) {
            mySpendingWithDates.transformToJQGridData(new Helper.MyDateClass(req.query.beginDate), new Helper.MyDateClass(req.query.endDate), function (JsonData) {
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

    app.get("/getAverageSpendingPerDay", function (req, res) {
        logger.log('GET AVERAGE SPENDING REQUEST: ' + req.originalUrl);
        let anzSpendingTable = new AnzSpendingTable();
        anzSpendingTable.getAverageSpendingAnz(new Helper.MyDateClass(req.query.beginDate), new Helper.MyDateClass(req.query.endDate), function (averageDailySpending) {
            res.status(200).send(averageDailySpending);
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
        let dataTransformerWithDates = new DataTransormer();
        dailyRealData.getDailyData(new Helper.MyDateClass(req.query.beginDate), new Helper.MyDateClass(req.query.endDate), function (JsonData) {
            dataTransformerWithDates.getTotalData(JsonData, new Helper.MyDateClass(req.query.beginDate), new Helper.MyDateClass(req.query.endDate), function (JsonDataWithTotals) {
                res.status(200).send(JsonDataWithTotals);
            });
        });
    });
    //************************************************************************************************************************************

    // ***************************************************************************************************************************************
    //EMPLOYEES
    app.get("/Employees", function (req, res) {
        logger.log('GET EMPLOYEES REQUEST: ' + req.originalUrl);
        let employeeTable = new EmployeeTable();
        employeeTable.getActiveEmployees(function (EmployeeDataJson) {
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
        employeeDatabase.setEmployeeToInactive(req.query.id, function (EmployeeDataJson) {
            res.status(200).send(EmployeeDataJson);
        });
    });
    // ***************************************************************************************************************************************


    // ***************************************************************************************************************************************
    //EMPLOYEE HOURS
    app.get("/GetEmployeeHoursTable", function (req, res) {
        logger.log('GET EMPLOYEE HOUR TABLE REQUEST: ' + req.originalUrl);
        let employeeHours = new EmployeeHours();
        employeeHours.getHoursForEmployeesInJson(new Helper.MyDateClass(req.query.beginDate), new Helper.MyDateClass(req.query.endDate), true, function (employeeHoursJson) {
            res.status(200).send(employeeHoursJson);
        });
    });


    //EMPLOYEE HOURS UPDATE
    app.get("/UpdateEmployeeHourTable", function (req, res) {
        logger.log('UPDATE EMPLOYEE HOUR TABLE REQUEST: ' + req.originalUrl);
        let hoursTable = new HoursTable();
        hoursTable.updateHours(req.query.employeeID, new Helper.MyDateClass(req.query.dateSelected), req.query.paymentType, req.query.hoursChanged, function () {
            let employeeHours = new EmployeeHours();
            employeeHours.getHoursForEmployeesInJson(new Helper.MyDateClass(req.query.beginDate), new Helper.MyDateClass(req.query.endDate),true, function (employeeHoursJson) {
                res.status(200).send(employeeHoursJson);
            });
        });
    });


    app.get("/getTotalHoursWorked", function (req, res) {
        logger.log('GET AVERAGE REVENUE REQUEST: ' + req.originalUrl);
        let hoursTable = new HoursTable();
        hoursTable.getTotalWorkHours(new Helper.MyDateClass(req.query.beginDate), new Helper.MyDateClass(req.query.endDate), function (totalWorkHours) {
            res.status(200).send(totalWorkHours);
        });

    });

    app.get("/getAverageHoursWorked", function (req, res) {
        logger.log('GET AVERAGE REVENUE REQUEST: ' + req.originalUrl);
        let hoursTable = new HoursTable();
        hoursTable.getAverageHoursWorkedPerDay(new Helper.MyDateClass(req.query.beginDate), new Helper.MyDateClass(req.query.endDate), function (averageWorkedHoursPerDay) {
            res.status(200).send(averageWorkedHoursPerDay);
        });

    });


    app.get("/getAverageSalariesPayementPerDay", function (req, res) {
        logger.log('GET AVERAGE REVENUE REQUEST: ' + req.originalUrl);
        let hoursTable = new HoursTable();
        hoursTable.getAverageSalaryPaymentPerDay(new Helper.MyDateClass(req.query.beginDate), new Helper.MyDateClass(req.query.endDate), function (averageDailySalaries) {
            res.status(200).send(averageDailySalaries);
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

    app.get("/getAverageRevenuePerDay", function (req, res) {
        logger.log('GET AVERAGE REVENUE REQUEST: ' + req.originalUrl);
        let dailyInputsTable = new DailyInputDataTable();
        dailyInputsTable.getAverageIncomePerDay(new Helper.MyDateClass(req.query.beginDate), new Helper.MyDateClass(req.query.endDate), function (averageIncomePerDay) {
            res.status(200).send(averageIncomePerDay);
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


    // ***************************************************************************************************************************************
    //DAILY INPUT DATA

    //DailyInputDataTable
    app.get("/GetChartData", function (req, res) {
        logger.log('GET CHART DATA REQUEST: ' + req.originalUrl);

        let dailyRealData = new DailyRealData();
        let dataTransformerWithDates = new DataTransormer();
        dailyRealData.getDailyData(new Helper.MyDateClass(req.query.beginDate), new Helper.MyDateClass(req.query.endDate), function (JsonData) {
            dataTransformerWithDates.getTotalData(JsonData, new Helper.MyDateClass(req.query.beginDate), new Helper.MyDateClass(req.query.endDate), function (JsonDataWithTotals) {
                res.status(200).send(JsonDataWithTotals);
            });
        });
    });
    // ***************************************************************************************************************************************




    // ***************************************************************************************************************************************
    //ANZ PERSONAL SPENDING
    app.post('/uploadPersonalSpendingCsv', function (req, res) {
        logger.log('UPLOAD PERSONAL SPENDING CSV DATA REQUEST: ' + req.originalUrl);
        let form = new IncomingForm();
        form.uploadDir = Config.getCsvDirectory();
        form.parse(req, function (err, fields, files) {
            if (err) {
                logger.log('ERROR in uploadFilters: ' + err);
            } else {
                let personalSpendingTable = new PersonalSpendingTable();
                personalSpendingTable.insertPersonalSpendingInDatabaseFromCsvFormat(files.filepond.path, function (JsonData) {
                    res.status(200).send(JsonData);
                });
            }
        });
    });


    app.get("/GetAllPersonalSpendingConfig", function (req, res) {
        logger.log('GET PERSONAL SPENDING CONFIGURATION REQUEST: ' + req.originalUrl);
        let personalSpendingTable = new PersonalSpendingTable();
        personalSpendingTable.getAllPersonalSpendingFromDatabase(function (JsonData) {
            res.status(200).send(JsonData);
        });

    });



    app.get("/AddPersonalSpending", function (req, res) {
        logger.log('ADD PERSONAL SPENDING REQUEST: ' + req.originalUrl);
        let personalSpendingTable = new PersonalSpendingTable();
        personalSpendingTable.addPersonalSpending(req.query.personal_spending, req.query.spender_name,function (JsonData) {
            res.status(200).send(JsonData);
        });
    });


    app.get("/DeletePersonalSpending", function (req, res) {
        logger.log('DELETE PERSONAL SPENDING REQUEST: ' + req.originalUrl);
        let personalSpendingTable = new PersonalSpendingTable();
        personalSpendingTable.deletePersonalSpending(req.query.personal_spending, function (JsonData) {
            res.status(200).send(JsonData);
        });
    });


    app.get("/getPersonalSpending", function (req, res) {
        logger.log('GET PERSONAL SPENDING REQUEST: ' + req.originalUrl);
        let dataTransformerWithDates = new DataTransormer();
        let personalSpendingTable = new PersonalSpendingTable();
        dataTransformerWithDates.constructDataInMapFormat(false, function (mySpendingWithDates) {
            mySpendingWithDates.getPersonalSpendingGridData(new Helper.MyDateClass(req.query.beginDate), new Helper.MyDateClass(req.query.endDate), req.query.spenderName, function (JsonData) {
                personalSpendingTable.calculatePersonalSpendingTotal(JsonData, new Helper.MyDateClass(req.query.beginDate).getDateInDatabaseFormat(),
                    new Helper.MyDateClass(req.query.endDate).getDateInDatabaseFormat(), function (JsonData) {
                        res.status(200).send(JsonData);
                    });
            });
        });
    });
    // ***************************************************************************************************************************************




});
