import { IsEmpty } from '@shared/models';
import { TDPSheetInfo } from './tdp-sheet-info.model';
import { TDPSubRow } from './tdp-sub-row.model';
import { DirtyCellInfo } from './dirty-cell-info.model';
import { TDPCell } from './tdp-cell.model';
import { Period } from './period.model';
import { PeriodType } from './period.enum';
import { ConcurrentUser } from './concurrent-user.model';

export class TDPSheet implements IsEmpty {
    concurrentUsers: ConcurrentUser | null;

    yearly: Array<TDPSheetInfo>; // yearly contains a single year

    quarterly: Array<TDPSheetInfo>; // 4 quarters

    monthly: Array<TDPSheetInfo>; // 12 months

    constructor(tdpSheet?: TDPSheet) {
        this.concurrentUsers = new ConcurrentUser();
        this.yearly = new Array<TDPSheetInfo>();
        this.quarterly = new Array<TDPSheetInfo>();
        this.monthly = new Array<TDPSheetInfo>();

        if (tdpSheet) {
            this.concurrentUsers = tdpSheet.concurrentUsers ? new ConcurrentUser(tdpSheet.concurrentUsers) : null;
            tdpSheet.yearly.forEach((tdpSheetInfo: TDPSheetInfo) => this.yearly.push(new TDPSheetInfo(tdpSheetInfo)));
            tdpSheet.quarterly.forEach((tdpSheetInfo: TDPSheetInfo) =>
                this.quarterly.push(new TDPSheetInfo(tdpSheetInfo))
            );
            tdpSheet.monthly.forEach((tdpSheetInfo: TDPSheetInfo) => this.monthly.push(new TDPSheetInfo(tdpSheetInfo)));
        }
    }

    clone(): this {
        const clone = new (this.constructor as typeof TDPSheet)() as this;
        if (!this.isEmpty()) {
            clone.concurrentUsers = this.concurrentUsers?.clone() || null;
            clone.yearly.push(this.yearly[0].clone());
            this.quarterly.forEach((tdpSheetInfo: TDPSheetInfo) => clone.quarterly.push(tdpSheetInfo.clone()));
            this.monthly.forEach((tdpSheetInfo: TDPSheetInfo) => clone.monthly.push(tdpSheetInfo.clone()));
        }

        return clone;
    }

    isEmpty(): boolean {
        return this.yearly.length === 0;
    }

    initialize(): this {
        if (!this.isEmpty()) {
            this.sort();
            this.resetDirtyAndDisabled();
            this.updateOverlappingValues();
            this.updateTotals();
        }
        return this;
    }

    resetDirtyAndDisabled(): void {
        if (!this.isEmpty()) {
            this.yearly[0].resetDirtyAndDisabled();
            this.quarterly.forEach((tdpSheetInfo: TDPSheetInfo) => tdpSheetInfo.resetDirtyAndDisabled());
            this.monthly.forEach((tdpSheetInfo: TDPSheetInfo) => tdpSheetInfo.resetDirtyAndDisabled());
        }
    }

    sort(): this {
        if (!this.isEmpty()) {
            this.yearly[0].sort();
            this.quarterly.forEach((tdpSheetInfo: TDPSheetInfo) => tdpSheetInfo.sort());
            this.monthly.forEach((tdpSheetInfo: TDPSheetInfo) => tdpSheetInfo.sort());
        }
        return this;
    }

    updateTotals(): void {
        if (!this.isEmpty()) {
            this.yearly.forEach((tdpSheetInfo: TDPSheetInfo) => tdpSheetInfo.updateTotals());
            this.quarterly.forEach((tdpSheetInfo: TDPSheetInfo) => tdpSheetInfo.updateTotals());
            this.monthly.forEach((tdpSheetInfo: TDPSheetInfo) => tdpSheetInfo.updateTotals());
        }
    }

    getYearlyTotalForDiscipline(disciplineId: number): number {
        let total = 0;
        this.yearly[0].rows.forEach((row) => {
            if (total > 0) return;
            total = row.subRows
                .filter((subRow: TDPSubRow) => subRow.disciplineId === disciplineId)
                .map((subRow: TDPSubRow) => subRow.tdpTotals.sampleTotal)
                .reduce((a: number, b: number) => a + b, 0);
        });
        return total;
    }

    getCell(dirtyCell: DirtyCellInfo): { cell: TDPCell; subRow: TDPSubRow } | undefined {
        const resultYearly = this.yearly[0].getCell(dirtyCell);
        if (resultYearly) {
            return resultYearly;
        }
        const quarterlyCell = this.quarterly.find((tdpSheetInfo) => {
            return tdpSheetInfo.getCell(dirtyCell) || false;
        });
        if (quarterlyCell) return quarterlyCell.getCell(dirtyCell);
        const monthlyCell = this.monthly.find((tdpSheetInfo) => {
            return tdpSheetInfo.getCell(dirtyCell) || false;
        });
        if (monthlyCell) return monthlyCell.getCell(dirtyCell);
        return undefined;
    }

    resetOverlappingValues(): void {
        if (!this.yearly.length) return;
        const yearlyTDPSheet = this.yearly[0];
        for (let index = 0; index < yearlyTDPSheet.rows.length; index += 1) {
            const yearlySport = yearlyTDPSheet.rows[index];
            for (let discipline = 0; discipline < yearlySport.subRows.length; discipline += 1) {
                // Reset the totals and flags for the disabled periods since these are all calculated
                this.monthly.forEach((monthlyTDPSheet) => {
                    const monthlySport = monthlyTDPSheet.rows[index];
                    const monthlyDiscipline = monthlySport.subRows[discipline];
                    monthlySport.isDisabled = false;
                    if (monthlyDiscipline.isDisabled) {
                        monthlyDiscipline.tdpTotals.reset();
                        monthlyDiscipline.isDisabled = false;
                    }
                });
                this.quarterly.forEach((quarterlyTDPSheet) => {
                    const quarterlySport = quarterlyTDPSheet.rows[index];
                    const quarterlyDiscipline = quarterlySport.subRows[discipline];
                    quarterlySport.isDisabled = false;
                    if (quarterlyDiscipline.isDisabled) {
                        quarterlyDiscipline.tdpTotals.reset();
                        quarterlyDiscipline.isDisabled = false;
                    }
                });
                const yearlyDiscipline = yearlySport.subRows[discipline];
                yearlySport.isDisabled = false;
                if (yearlyDiscipline.isDisabled) {
                    yearlyDiscipline.tdpTotals.reset();
                    yearlyDiscipline.isDisabled = false;
                }
            }
        }
    }

    // This method disables overlapping periods
    // and copies the values from child periods to disabled parent periods
    updateOverlappingValues(): void {
        this.resetOverlappingValues();

        const yearlyTDPSheet = this.yearly[0];
        // Iterate over every sport
        for (let sport = 0; sport < yearlyTDPSheet.rows.length; sport += 1) {
            // Iterate over every discipline and check for overlaps
            for (let discipline = 0; discipline < yearlyTDPSheet.rows[sport].subRows.length; discipline += 1) {
                const yearlyDiscipline = yearlyTDPSheet.rows[sport].subRows[discipline];

                // Disable quarters and year if this discipline has monthly entries
                this.disableOtherPeriodsThanMonthly(yearlyDiscipline, sport, discipline);

                // Disable month and year if this discipline has quarterly entries
                this.disableOtherPeriodsThanQuarterly(yearlyDiscipline, sport, discipline);

                // Disable month and quarters if this discipline has yearly entries
                this.disableOtherPeriodsThanYearly(yearlyDiscipline, sport, discipline);
            }
        }
    }

    private disableOtherPeriodsThanMonthly(yearlyDiscipline: TDPSubRow, sport: number, discipline: number) {
        this.monthly.forEach((monthlyTDPSheet) => {
            const monthlyDiscipline = monthlyTDPSheet.rows[sport].subRows[discipline];
            if (monthlyDiscipline.tdpTotals.isNotZero()) {
                const quarter = monthlyTDPSheet.getPeriod().getQuarterAsIndex();
                const quarterlyDiscipline = this.quarterly[quarter].rows[sport].subRows[discipline];
                quarterlyDiscipline.isDisabled = true; // disable the parent quarter
                quarterlyDiscipline.tdpTotals.add(monthlyDiscipline.tdpTotals); // propagate the totals to the quarter

                yearlyDiscipline.isDisabled = true; // Disable the yearly discipline
                yearlyDiscipline.tdpTotals.add(monthlyDiscipline.tdpTotals); // propagate the totals to the year
            }
        });
    }

    private disableOtherPeriodsThanQuarterly(yearlyDiscipline: TDPSubRow, sport: number, discipline: number) {
        this.quarterly.forEach((quarterlyTDPSheet) => {
            const quarterlyDiscipline = quarterlyTDPSheet.rows[sport].subRows[discipline];
            if (!quarterlyDiscipline.isDisabled && quarterlyDiscipline.tdpTotals.isNotZero()) {
                const startMonth = quarterlyTDPSheet.getPeriod().getStartMonthAsIndex();
                // Disable the months for this quarter
                for (let month = startMonth; month < startMonth + 3; month += 1) {
                    const monthlySport = this.monthly[month].rows[sport];
                    const monthlyDiscipline = monthlySport.subRows[discipline];
                    monthlySport.isDisabled = true; // disable the totals for the row
                    monthlyDiscipline.isDisabled = true; // disable the discipline
                    monthlyDiscipline.tdpTotals.reset(); // reset the discipline totals
                }
                // Disable the year
                yearlyDiscipline.isDisabled = true; // Disable the yearly discipline
                yearlyDiscipline.tdpTotals.add(quarterlyDiscipline.tdpTotals); // propagate the totals to the year
            }
        });
    }

    private disableOtherPeriodsThanYearly(yearlyDiscipline: TDPSubRow, sport: number, discipline: number) {
        if (!yearlyDiscipline.isDisabled && yearlyDiscipline.tdpTotals.isNotZero()) {
            // Disable the months for the year
            for (let month = 0; month < 12; month += 1) {
                const monthlySport = this.monthly[month].rows[sport];
                const monthlyDiscipline = monthlySport.subRows[discipline];
                monthlySport.isDisabled = true; // disable the totals for the row
                monthlyDiscipline.isDisabled = true; // disable the discipline
                monthlyDiscipline.tdpTotals.reset(); // reset the discipline totals
            }
            // Disable the quarters for the year
            for (let quarter = 0; quarter < 4; quarter += 1) {
                const quarterlySport = this.quarterly[quarter].rows[sport];
                const quarterlyDiscipline = quarterlySport.subRows[discipline];
                quarterlySport.isDisabled = true; // disable the totals for the row
                quarterlyDiscipline.isDisabled = true; // disable the discipline
                quarterlyDiscipline.tdpTotals.reset(); // reset the discipline totals
            }
        }
    }

    // This method returns the period which is a parent or a child period of currentPeriod
    // and for which data was entered for the specified sport/discipline.
    getDisablingPeriod(currentPeriod: Period, disciplineId: number, sportId: number): Period {
        // If yearly, check monthly, then quarterly
        if (currentPeriod.getType() === PeriodType.Yearly) {
            return this.getDisablingPeriodForYearlyPeriod(disciplineId, sportId);
        }
        // If quarterly, check monthly, then yearly
        if (currentPeriod.getType() === PeriodType.Quarterly) {
            return this.getDisablingPeriodForQuarterlyPeriod(disciplineId, sportId, currentPeriod);
        }
        // If monthly, check quarterly, then yearly
        if (currentPeriod.getType() === PeriodType.Monthly) {
            return this.getDisablingPeriodForMonthlyPeriod(disciplineId, sportId, currentPeriod);
        }
        return new Period();
    }

    private getDisablingPeriodForYearlyPeriod(disciplineId: number, sportId: number) {
        let disciplineSubRow: TDPSubRow | undefined;

        const disabledMontlySheet = this.monthly.find((monthlySheet) => {
            disciplineSubRow = monthlySheet.getSubRow(disciplineId, sportId);
            return disciplineSubRow && !disciplineSubRow.isDisabled;
        });

        if (disabledMontlySheet) {
            return new Period(disabledMontlySheet.startMonth, disabledMontlySheet.endMonth);
        }

        const disabledQuarterlySheet = this.quarterly.find((quarterlySheet) => {
            disciplineSubRow = quarterlySheet.getSubRow(disciplineId, sportId);
            return disciplineSubRow && !disciplineSubRow.isDisabled;
        });

        if (disabledQuarterlySheet) {
            return new Period(disabledQuarterlySheet.startMonth, disabledQuarterlySheet.endMonth);
        }

        return new Period();
    }

    private getDisablingPeriodForQuarterlyPeriod(disciplineId: number, sportId: number, currentPeriod: Period) {
        let disciplineSubRow: TDPSubRow | undefined;
        const startMonth = currentPeriod.getStartMonthAsIndex();

        for (let month = startMonth; month < startMonth + 3; month += 1) {
            const monthlySheet = this.monthly[month];
            disciplineSubRow = monthlySheet.getSubRow(disciplineId, sportId);
            if (disciplineSubRow && !disciplineSubRow.isDisabled) {
                return new Period(monthlySheet.startMonth, monthlySheet.endMonth);
            }
        }

        disciplineSubRow = this.yearly[0].getSubRow(disciplineId, sportId);
        if (disciplineSubRow && !disciplineSubRow.isDisabled) {
            return new Period(this.yearly[0].startMonth, this.yearly[0].endMonth);
        }

        return new Period();
    }

    private getDisablingPeriodForMonthlyPeriod(disciplineId: number, sportId: number, currentPeriod: Period) {
        let disciplineSubRow: TDPSubRow | undefined;
        const quarter = currentPeriod.getQuarterAsIndex();
        const quarterlySheet = this.quarterly[quarter];

        disciplineSubRow = quarterlySheet.getSubRow(disciplineId, sportId);
        if (disciplineSubRow && !disciplineSubRow.isDisabled) {
            return new Period(quarterlySheet.startMonth, quarterlySheet.endMonth);
        }

        disciplineSubRow = this.yearly[0].getSubRow(disciplineId, sportId);
        if (disciplineSubRow && !disciplineSubRow.isDisabled) {
            return new Period(this.yearly[0].startMonth, this.yearly[0].endMonth);
        }

        return new Period();
    }
}
