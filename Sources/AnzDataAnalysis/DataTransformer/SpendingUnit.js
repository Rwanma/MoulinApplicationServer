
class SpendingUnit {
    constructor(descriptionInExcel, amountSpent, date) {
        this.description = descriptionInExcel;
        this.amount = amountSpent;
        this.date = date;
    }


    printData() {
        //console.log(this.amount + ',' + this.description + ',' + this.date);
    }
}


class SpendingsForOneDay {
    constructor(date) {
        this.myArray = [];
        this.date = date;
    }

    addSpendingUnit(mySpendingUnit) {
        let dataPresent = false;
        this.myArray.forEach(function (unit) {
            if (unit.description === mySpendingUnit.description) {
                unit.amount += mySpendingUnit.amount;
                dataPresent = true;
            }
        });

        if (!dataPresent) {
            this.myArray.push(mySpendingUnit);
        }
    }

    printData() {
        this.myArray.forEach(function (unit) {
            unit.printData();
        });
    }

}


module.exports = {
    SpendingsForOneDay: SpendingsForOneDay,
    SpendingUnit: SpendingUnit
};