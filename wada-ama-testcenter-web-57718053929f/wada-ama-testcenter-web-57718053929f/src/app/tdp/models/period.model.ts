import { Month, PeriodType, Quarter } from './period.enum';

export class Period {
    startMonth: number; // 1 based start month (1 to 12)

    endMonth: number; // 1 based end month (1 to 12)

    constructor(startMonth = 0, endMonth = 0) {
        this.startMonth = startMonth;
        this.endMonth = endMonth;
    }

    isGreater(period: Period): boolean {
        return this.endMonth - this.startMonth > period.endMonth - period.startMonth;
    }

    getType(): PeriodType {
        switch (this.endMonth - this.startMonth) {
            case 11:
                return PeriodType.Yearly;
            case 2:
                return PeriodType.Quarterly;
            case 0:
                return PeriodType.Monthly;
            default:
                return PeriodType.Monthly;
        }
    }

    // This returns a 0 based index (0 to 3)
    getQuarterAsIndex(): number {
        return Math.floor((this.startMonth - 1) / 3);
    }

    // This returns a 0 based index (0 to 11)
    getStartMonthAsIndex(): number {
        return this.startMonth - 1;
    }

    // This returns the Quarter enum for this period or Quarter.None if this is not a quarter
    getQuarter(): Quarter {
        if (this.getType() === PeriodType.Quarterly) {
            return this.getQuarterAsIndex() as Quarter;
        }
        return Quarter.None;
    }

    // This returns the Month enum for this period or Month.None if this is not a month
    getStartMonth(): Month {
        if (this.getType() === PeriodType.Monthly) {
            return this.getStartMonthAsIndex() as Month;
        }
        return Month.None;
    }
}
