export enum DatePickerMode {
    YearToDate,
    Custom,
    NextYear,
    LastYear,
    TwoYearsAgo,
    ThreeYearsAgo,
}

export class FromToDate {
    fromMonth: number;

    fromYear: number;

    toMonth: number;

    toYear: number;

    constructor(fromMonth: number, fromYear: number, toMonth: number, toYear: number) {
        this.fromMonth = fromMonth;
        this.fromYear = fromYear;
        this.toMonth = toMonth;
        this.toYear = toYear;
    }

    isEqual(fromToDate: FromToDate): boolean {
        if (
            this.fromMonth === fromToDate.fromMonth &&
            this.fromYear === fromToDate.fromYear &&
            this.toMonth === fromToDate.toMonth &&
            this.toYear === fromToDate.toYear
        ) {
            return true;
        }
        return false;
    }

    isGood(): boolean {
        return this.fromYear <= this.toYear && this.fromMonth <= this.toMonth;
    }

    clone(): FromToDate {
        return new FromToDate(this.fromMonth, this.fromYear, this.toMonth, this.toYear);
    }

    getModeFromDate(): DatePickerMode {
        const currentDate = new Date();
        const currentYear: number = currentDate.getFullYear();
        const dates = {
            januaryToDecember: this.fromMonth === 0 && this.toMonth === 11,
            januaryToNow: this.fromMonth === 0 && this.toMonth === currentDate.getMonth(),
            currentYear: currentDate.getFullYear(),
            lastYear: this.fromYear === currentYear - 1 && this.toYear === currentYear - 1,
            twoYearsAgo: this.fromYear === currentYear - 2 && this.toYear === currentYear - 2,
            threeYearsAgo: this.fromYear === currentYear - 3 && this.toYear === currentYear - 3,
            currYear: this.fromYear === currentYear && this.toYear === currentYear,
            nextYear: this.fromYear === currentYear + 1 && this.toYear === currentYear + 1,
        };

        return this.getDatePickerMode(dates);
    }

    private getDatePickerMode(dates: {
        januaryToDecember: boolean;
        januaryToNow: boolean;
        currentYear: number;
        lastYear: boolean;
        twoYearsAgo: boolean;
        threeYearsAgo: boolean;
        currYear: boolean;
        nextYear: boolean;
    }) {
        if (dates.threeYearsAgo && dates.januaryToDecember) {
            return DatePickerMode.ThreeYearsAgo;
        }
        if (dates.twoYearsAgo && dates.januaryToDecember) {
            return DatePickerMode.TwoYearsAgo;
        }
        if (dates.lastYear && dates.januaryToDecember) {
            return DatePickerMode.LastYear;
        }
        if (dates.currYear && dates.januaryToNow) {
            return DatePickerMode.YearToDate;
        }
        if (dates.nextYear && dates.januaryToDecember) {
            return DatePickerMode.NextYear;
        }
        return DatePickerMode.Custom;
    }
}
