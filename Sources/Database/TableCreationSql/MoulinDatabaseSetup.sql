Database Setup:


connect to SQL instance from Amazon Server:
mysql - h moulindatabaseprod.cl2ro3q8kkuj.ap - southeast - 2.rds.amazonaws.com - P 3306 - u rwanma - p


mysql > create database moulin_database_prod;
mysql > show databases;
mysql > use moulin_database_prod;



login: rwanma
password: findumonde

-- *********************************************************************************************************************************
    --TABLE CREATIONS
CREATE TABLE IF NOT EXISTS EMPLOYEES(employee_id INT AUTO_INCREMENT, first_name VARCHAR(255), last_name VARCHAR(255), salary_transfer INT, salary_cash INT, PRIMARY KEY(employee_id));
CREATE TABLE IF NOT EXISTS EMPLOYEE_HOURS(employee_id INT, payment_type varchar(30), work_date DATE, hours  INT);
ALTER TABLE EMPLOYEE_HOURS ADD UNIQUE unique_index_employee_hours(employee_id, payment_type, work_date);
CREATE TABLE IF NOT EXISTS SPENDING_CATEGORIES(categories VARCHAR(255));
CREATE TABLE IF NOT EXISTS ANZ_SPENDING(spending_date Date, amount INT, spending_description VARCHAR(255));
CREATE TABLE IF NOT EXISTS LOGINS(login VARCHAR(255), password VARCHAR(255), role VARCHAR(20));
CREATE TABLE IF NOT EXISTS DAILY_INPUT_DATA(work_date Date, input_type VARCHAR(255), value INT);
ALTER TABLE DAILY_INPUT_DATA ADD UNIQUE unique_index_daily_input_data(work_date, input_type);

INSERT INTO  LOGINS(login, password, role) VALUES('Manager', 'Findumonde01', 'manager');
INSERT INTO  LOGINS(login, password, role) VALUES('Aurore', 'Lebrun', 'manager');
INSERT INTO  LOGINS(login, password, role) VALUES('Parents', 'Bakas', 'viewer');
INSERT INTO  LOGINS(login, password, role) VALUES('Sam', 'Findumonde01', 'viewer');
-- *********************************************************************************************************************************


    -- *********************************************************************************************************************************
    --TABLE CHANGES
ALTER TABLE EMPLOYEES MODIFY salary_transfer DOUBLE;
ALTER TABLE EMPLOYEES MODIFY salary_cash DOUBLE;
ALTER TABLE EMPLOYEE_HOURS MODIFY hours DOUBLE;
ALTER TABLE ANZ_SPENDING MODIFY amount DOUBLE;
ALTER TABLE DAILY_INPUT_DATA MODIFY value DOUBLE;


CREATE TABLE IF NOT EXISTS FILTERS(filter VARCHAR(255), category VARCHAR(255));

CREATE TABLE IF NOT EXISTS CATEGORIES(category VARCHAR(255));
ALTER TABLE CATEGORIES ADD PRIMARY KEY(category);

ALTER TABLE FILTERS ADD FOREIGN KEY FK_SpendingType(category) REFERENCES CATEGORIES(category) ON DELETE SET NULL ON UPDATE CASCADE;




-- *********************************************************************************************************************************

    --SQL TESTING QUERIES
INSERT INTO CATEGORIES(spending_type) VALUES('TOTO');
UPDATE SPENDING_CATEGORIES SET spending_type = 'TITI' WHERE categories = 'TARGET';
UPDATE CATEGORIES SET spending_type = 'TITI' WHERE spending_type = 'TOTO';







-- *********************************************************************************************************************************
    --ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'nj52wv49'; --> password is the password that needs to be used by root
--GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' IDENTIFIED BY 'password';
--CREATE USER 'marwan'@'13.54.113.19' IDENTIFIED BY 'CroissantDatabase';
--CREATE USER 'marwan'@'10.0.2.82' IDENTIFIED BY 'CroissantDatabase';
--GRANT ALL PRIVILEGES ON *.* TO 'marwan'@'10.0.2.82' IDENTIFIED BY 'CroissantDatabase';
-- *********************************************************************************************************************************


