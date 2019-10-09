


module.exports = {


    getArrayOfAverages : function(array) {
        let sum = 0, count = array.length;
        for (let i = 0; i < count; i++) {
            sum = sum + array[i];
        }
        let average =  sum / count;


    },

    getNumberOfDaysBetweenDates(startDate, endDate) {
        return Math.round((endDate-startDate)/(1000*60*60*24));
    },


    getDatesRangeArray: function (startDate, endDate) {
        let dateArray = [];
        for (let myDate = startDate; myDate <= endDate; myDate = new Date(myDate.getTime() + 1000 * 60 * 60 * 24)) {
            let dd = myDate.getDate();
            let mm = myDate.getMonth() + 1;
            let yyyy = myDate.getFullYear();

            if (dd < 10) {
                dd = '0' + dd;
            }
            if (mm < 10) {
                mm = '0' + mm;
            }

            dateArray.push(dd + '/' + mm + '/' + yyyy);
        }
        return dateArray;
    },


    /*    transformMonthDayYearToDate: function transformDate(dateToChange) {
            let parts = dateToChange.split('/');
            return new Date(parts[2], parts[1] - 1, parts[0]);
        },*/

    transformDayMonthYearToDate: function transformDate(dateToChange) {
        let dateParts = dateToChange.split("/");
        return new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
    },


    transformDateToDDMMYYYY: function transformDateToDDMMYYYY(dateToChange) {
        return dateToChange.getUTCDate() + '/' + (dateToChange.getUTCMonth() + 1) + '/' + dateToChange.getFullYear();
    },

    /*    transformOfficialDateToPersoDate: function transforOfficialDateToPersoDate(dateToChange) {
            return new MyDateClass(dateToChange.getDate() + '/' + (dateToChange.getMonth() + 1) + '/' + dateToChange.getFullYear());
        },*/


    /*    getDateArrayFromDates(beginDate, endDate){
            let dateArray = Helper.getDatesRangeArray(beginDate.getOfficialJavascriptDate(), endDate.getOfficialJavascriptDate());
            return dateArray.map(x => transformOfficialDateToPersoDate(x));
        },*/


    MyDateClass: class MyDateClass {
        constructor(dateInDDMMYYYFormat) {
            this.dateInDDMMYYYFormat = dateInDDMMYYYFormat;
        }

        getDateInDDMMYYYFormat() {
            return this.dateInDDMMYYYFormat;
        }

        getDateInDatabaseFormat() {
            let parts = this.dateInDDMMYYYFormat.split('/');
            let date = new Date(parts[2], parts[1] - 1, parts[0]);
            let month = '' + (date.getMonth() + 1), day = '' + date.getDate(), year = date.getFullYear();
            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;
            return [year, month, day].join('-');

        }



        setDateFromOfficialDateClass(dateClassObject) {
            let dd = dateClassObject.getDate();
            let mm = dateClassObject.getMonth() + 1; //January is 0!
            let yyyy = dateClassObject.getFullYear();
            if (dd < 10) {
                dd = '0' + dd;
            }
            if (mm < 10) {
                mm = '0' + mm;
            }
            this.dateInDDMMYYYFormat = dd + '/' + mm + '/' + yyyy;
        }

        getOfficialJavascriptDate() {
            let dateParts = this.dateInDDMMYYYFormat.split("/");
            return new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
        }
    }


};
