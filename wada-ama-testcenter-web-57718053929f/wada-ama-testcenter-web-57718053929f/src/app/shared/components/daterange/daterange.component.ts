import { Component, EventEmitter, forwardRef, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Daterange, QuickFilter } from '@shared/models';
import { TranslationService } from '@core/services';
import { deepEqual, formatDisplayDate, isNullOrBlank } from '@shared/utils';
import { MatCalendar } from '@angular/material/datepicker';
import * as moment from 'moment';

export const DATERANGEPICKER_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DaterangeComponent),
    multi: true,
};

@Component({
    selector: 'app-daterange',
    templateUrl: './daterange.component.html',
    styleUrls: ['./daterange.component.scss'],
    providers: [DATERANGEPICKER_VALUE_ACCESSOR],
})
export class DaterangeComponent implements OnInit, ControlValueAccessor {
    @ViewChild('fromCalendar', { static: false }) fromCalendar!: MatCalendar<Date>;

    @ViewChild('toCalendar', { static: false }) toCalendar!: MatCalendar<Date>;

    @Input() dateFormat = '';

    @Input() fromDate = '';

    @Input() quickFilters: Array<QuickFilter> = [];

    @Input() toDate = '';

    @Output()
    readonly valueChanged: EventEmitter<Daterange> = new EventEmitter();

    translations$ = this.translationService.translations$;

    // Filter index to set back when the user select a date manually
    defaultFilterIndex = 0;

    isFromDateValid = true;

    isToDateValid = true;

    minDate: Date | null = null;

    maxDate: Date | null = null;

    // ControlValueAccessor functions
    onChange: any;

    onTouched: any;

    selectedFilter: QuickFilter = new QuickFilter();

    get value(): Daterange {
        return this._value;
    }

    // We create a setter to emit change only when the old value != new value
    set value(value: Daterange) {
        this._value = value;
        if (this.onChange) this.onChange(this.value);
        this.valueChanged.emit(this.value);
    }

    private _value: Daterange = new Daterange();

    constructor(private translationService: TranslationService) {}

    ngOnInit(): void {
        if (!this.quickFilters.length) {
            this.quickFilters = this.defaultQuickFilters();
        }

        if (isNullOrBlank(this.fromDate) && isNullOrBlank(this.toDate)) {
            this.defaultFilterIndex = 0;
            this.changeFilter(this.defaultFilterIndex);
        } else {
            this.fromDate = moment(this.fromDate).toISOString();
            this.toDate = moment(this.toDate).toISOString();
            this.defaultFilterIndex = this.getFilter();
            this.changeFilter(this.defaultFilterIndex);
        }
    }

    changeFilter(quickFilterId: number): void {
        this.selectedFilter = this.quickFilters[quickFilterId];
        if (!deepEqual(this.selectedFilter.displayName, 'custom')) {
            const { fromDate, toDate } = this.quickFilters[quickFilterId].filterFn();
            this.fromDate = fromDate;
            this.toDate = toDate;
        }
        this.updateValue(this.selectedFilter);
        this.updateCalendars();
    }

    getFilter(): number {
        let result = this.quickFilters.length - 1;
        this.quickFilters.forEach((e, index) => {
            const { fromDate, toDate } = e.filterFn();
            if (
                this.displayDate(fromDate) === this.displayDate(this.fromDate) &&
                this.displayDate(toDate) === this.displayDate(this.toDate)
            ) {
                result = index;
            }
        });
        return result;
    }

    dateChanged(event: any, isFromDate: boolean): void {
        if (isFromDate) {
            this.fromDate = moment(event).toISOString();
        } else {
            this.toDate = moment(event).toISOString();
        }
        if (this.fromDate && this.toDate) {
            // Set the custom filter if user change date
            this.updateValue(this.quickFilters[3]);
            this.updateCalendars();
        }
    }

    // default list of quickFilter, can be override
    defaultQuickFilters(): Array<QuickFilter> {
        return [
            {
                value: 'yearToDate',
                displayName: 'yearToDate',
                dataQA: 'yearToDateOptionAppDatepicker',
                filterFn: () => {
                    return {
                        fromDate: moment().date(1).month(0).year(moment().year()).toISOString(),
                        toDate: moment().toISOString(),
                    };
                },
            },
            {
                value: 'previousYear',
                displayName: (moment().year() - 1).toString(),
                dataQA: 'previousYearOptionAppDatepicker',
                filterFn: () => {
                    return {
                        fromDate: moment()
                            .date(1)
                            .month(0)
                            .year(moment().year() - 1)
                            .toISOString(),
                        toDate: moment()
                            .date(31)
                            .month(11)
                            .year(moment().year() - 1)
                            .endOf('year')
                            .toISOString(),
                    };
                },
            },
            {
                value: 'twoYearAgo',
                displayName: (moment().year() - 2).toString(),
                dataQA: 'twoYearsAgoOptionAppDatepicker',
                filterFn: () => {
                    return {
                        fromDate: moment()
                            .date(1)
                            .month(0)
                            .year(moment().year() - 2)
                            .toISOString(),
                        toDate: moment()
                            .date(31)
                            .month(11)
                            .year(moment().year() - 2)
                            .endOf('year')
                            .toISOString(),
                    };
                },
            },
            {
                value: 'custom',
                displayName: 'custom',
                dataQA: 'customOptionAppDatepicker',
                filterFn: () => {
                    return { fromDate: '', toDate: '' };
                },
            },
        ];
    }

    displayDate(date: string): string {
        const displayDate = moment(date);
        return !isNullOrBlank(date) && displayDate.isValid()
            ? formatDisplayDate(displayDate, undefined, this.dateFormat)
            : '';
    }

    editDateManually(event: any, isFromDate: boolean): void {
        const date = moment(event, this.dateFormat, true);
        if (isFromDate && date.isValid() && this.maxDate && date.isBefore(moment(this.maxDate))) {
            this.dateChanged(date.toISOString(), isFromDate);
        } else if (!isFromDate && date.isValid() && this.minDate && date.isAfter(moment(this.minDate))) {
            this.dateChanged(date.toISOString(), isFromDate);
        } else {
            this.dateChanged('', isFromDate);
        }
    }

    // callback to make everytimes a value change
    registerOnChange(fn: (_: any) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    selectDefaultFilter(): void {
        this.selectedFilter = this.quickFilters[this.defaultFilterIndex];
    }

    updateCalendars(): void {
        this.minDate = new Date(this.fromDate);
        this.maxDate = new Date(this.toDate);
        setTimeout(() => {
            // Calendar focus on selected date
            if (this.fromCalendar) {
                this.fromCalendar.startAt = new Date(this.fromDate || '');
                this.fromCalendar.activeDate = new Date(this.fromDate || '');
            }
            if (this.toCalendar) {
                this.toCalendar.startAt = new Date(this.toDate || '');
                this.toCalendar.activeDate = new Date(this.toDate || '');
            }
        }, 50);
    }

    updateValue(selectedFilter: QuickFilter): void {
        this.value = {
            from: this.fromDate,
            to: this.toDate,
            quickFilter: {
                displayName: selectedFilter.displayName,
                value: selectedFilter.value,
            },
        };
    }

    writeValue(value: Daterange): void {
        if (value !== this.value) {
            this._value = value;
            this.selectedFilter =
                this.quickFilters.find((item) => item.value === value.quickFilter.value) ||
                this.quickFilters[this.defaultFilterIndex];
        }
    }
}
