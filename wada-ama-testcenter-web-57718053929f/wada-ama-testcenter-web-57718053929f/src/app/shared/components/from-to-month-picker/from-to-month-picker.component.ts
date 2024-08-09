import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DatePickerMode, FromToDate } from '@shared/models';

@Component({
    selector: 'app-from-to-month-picker',
    templateUrl: './from-to-month-picker.component.html',
    styleUrls: ['./from-to-month-picker.component.scss'],
})
export class FromToMonthPickerComponent implements OnInit {
    currentYear = new Date().getFullYear();

    modeEnum = DatePickerMode;

    mode = DatePickerMode.YearToDate;

    @Input() monthLabels = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    @Input() minimumFromYear = this.currentYear - 3;

    @Output()
    readonly dateSelected: EventEmitter<FromToDate> = new EventEmitter<FromToDate>();

    private now = new Date();

    private _fromToDate: FromToDate = new FromToDate(
        this.now.getFullYear(),
        this.now.getMonth(),
        this.now.getFullYear(),
        this.now.getMonth()
    );

    @Input() set fromToDate(value: FromToDate) {
        this._fromToDate = new FromToDate(value.fromMonth, value.fromYear, value.toMonth, value.toYear);
    }

    get fromToDate(): FromToDate {
        return this._fromToDate;
    }

    ngOnInit(): void {
        this.mode = this.fromToDate.getModeFromDate();
    }

    modeChanged(mode: DatePickerMode): void {
        const oldRange = this.fromToDate.clone();

        this.mode = mode;
        this.updateFromTo();

        if (!this.fromToDate.isEqual(oldRange)) {
            this.dateSelected.emit(this.fromToDate);
        }
    }

    fromYearChanged(year: number): void {
        const oldRange = this.fromToDate.clone();

        // The from Year must be greater than minimumFromYear and smaller than toYear
        this.fromToDate.fromYear = Math.max(this.minimumFromYear, Math.min(year, this.fromToDate.toYear));
        if (!this.fromToDate.isGood()) {
            this.fromToDate.fromMonth = 0;
        }
        this.mode = this.fromToDate.getModeFromDate();

        if (!this.fromToDate.isEqual(oldRange)) {
            this.dateSelected.emit(this.fromToDate);
        }
    }

    toYearChanged(year: number): void {
        const oldRange = this.fromToDate.clone();

        // The toYear must be smaller than currentYear + 1 and greater than fromYear
        this.fromToDate.toYear = Math.min(this.currentYear + 1, Math.max(year, this.fromToDate.fromYear));
        if (!this.fromToDate.isGood()) {
            this.fromToDate.toMonth = 11;
        }
        this.mode = this.fromToDate.getModeFromDate();

        if (!this.fromToDate.isEqual(oldRange)) {
            this.dateSelected.emit(this.fromToDate);
        }
    }

    fromMonthChanged(month: number): void {
        const oldRange = this.fromToDate.clone();

        // fromMonth must never be greater than toMonth
        this.fromToDate.fromMonth =
            this.fromToDate.fromYear < this.fromToDate.toYear ? month : Math.min(month, this.fromToDate.toMonth);
        this.mode = this.fromToDate.getModeFromDate();

        if (!this.fromToDate.isEqual(oldRange)) {
            this.dateSelected.emit(this.fromToDate);
        }
    }

    toMonthChanged(month: number): void {
        const oldRange = this.fromToDate.clone();

        // toMonth must be greater than fromMonth
        this.fromToDate.toMonth =
            this.fromToDate.fromYear < this.fromToDate.toYear ? month : Math.max(month, this.fromToDate.fromMonth);
        this.mode = this.fromToDate.getModeFromDate();

        if (!this.fromToDate.isEqual(oldRange)) {
            this.dateSelected.emit(this.fromToDate);
        }
    }

    updateFromTo(): void {
        if (this.mode === DatePickerMode.NextYear) {
            this.fromToDate.fromYear = this.currentYear + 1;
            this.fromToDate.toYear = this.currentYear + 1;
        } else if (this.mode === DatePickerMode.LastYear) {
            this.fromToDate.fromYear = this.currentYear - 1;
            this.fromToDate.toYear = this.currentYear - 1;
        } else if (this.mode === DatePickerMode.TwoYearsAgo) {
            this.fromToDate.fromYear = this.currentYear - 2;
            this.fromToDate.toYear = this.currentYear - 2;
        } else if (this.mode === DatePickerMode.ThreeYearsAgo) {
            this.fromToDate.fromYear = this.currentYear - 3;
            this.fromToDate.toYear = this.currentYear - 3;
        } else if (this.mode === DatePickerMode.YearToDate) {
            this.fromToDate.fromYear = this.currentYear;
            this.fromToDate.toYear = this.currentYear;
            this.fromToDate.fromMonth = 0;
            this.fromToDate.toMonth = new Date().getMonth();
        }

        if (
            this.mode === DatePickerMode.NextYear ||
            this.mode === DatePickerMode.LastYear ||
            this.mode === DatePickerMode.TwoYearsAgo ||
            this.mode === DatePickerMode.ThreeYearsAgo
        ) {
            this.fromToDate.fromMonth = 0;
            this.fromToDate.toMonth = 11;
        }
    }
}
