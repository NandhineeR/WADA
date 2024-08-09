import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import * as moment from 'moment';

type Moment = moment.Moment;

/*
 * Install moment.js: npm install moment --save
 * See the docs: https://momentjs.com/docs/
 *
 * Usage example:
 *
 * <app-calendar
 *     locale="en"
 *     [date]="navDate"
 *     [minDate]="minDate"
 *     [maxDate]="maxDate"
 *     (selectedDate)="selectedDate = $event">
 * </app-calendar>
 *
 * <p>The selected date is: <b>{{ selectedDate }}</b></p>
 *
 * Ts:
 *  selectedDate: Moment;
 *  navDate: Moment = moment(); // today
 *  minDate: Moment = moment('2018-06-23'); // can be init from string
 *  maxDate: Moment = moment(this.navDate).add(1, 'year'); // can operate on date
 */

@Component({
    selector: 'app-calendar',
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit, OnChanges {
    @Output() readonly selectedDate = new EventEmitter<Moment>();

    @Input() locale = 'en';

    @Input() date: Moment | undefined;

    @Input() minDate: Moment | undefined;

    @Input() maxDate: Moment | undefined;

    dayGrid: Array<{ value: number; available: boolean; date: Moment }> = [];

    headerDate = '';

    navDate: Moment | undefined;

    weekDays: Array<string> = [];

    ngOnChanges(): void {
        this.initLocaleData();
        if (this.date && this.isAvailable(this.date) && this.date.month() !== this.navDate?.month()) {
            this.updateCalendar();
        }
    }

    ngOnInit(): void {
        this.initLocaleData();

        // calculate the difference between today's date and the selected date and change the datepicker month accordingly
        if (this.minDate && this.date) {
            this.navDate?.add(this.minDate.month() - this.date.month(), 'month');
        }
        this.updateCalendar();
    }

    changeMonth(num: number): void {
        this.navDate?.add(num, 'month');
        this.updateCalendar();
    }

    getWeekDayNumber(day: Moment): number {
        const weekDay = moment.localeData().weekdays(day).toString();
        return moment.weekdays().indexOf(weekDay);
    }

    initLocaleData(): void {
        moment.locale(this.locale);
        this.weekDays = moment.weekdaysShort();
        this.date = this.date?.isValid() ? this.date : moment();
        this.navDate = moment(this.date);
    }

    isAvailable(date: Moment): boolean {
        if (this.minDate && this.maxDate) {
            return date.isBetween(this.minDate.startOf('day'), this.maxDate.endOf('day'), undefined, '[]');
        }
        if (this.minDate) {
            return date.isSameOrAfter(this.minDate.startOf('day'), undefined);
        }
        if (this.maxDate) {
            return date.isBefore(this.maxDate.endOf('day'), undefined);
        }
        return true;
    }

    isToday(date: Moment): boolean {
        return date.date() === moment().date() && date.month() === moment().month() && date.year() === moment().year();
    }

    selectDay(day: { value: number; available: boolean; date: Moment }): void {
        if (day.available) {
            if (this.navDate && day.date.month() !== this.navDate.month()) {
                this.changeMonth(day.date.month() - this.navDate.month());
            }
            const dateUpdated = new Date(day.date.year(), day.date.month(), day.value);

            // Here we update a binding in a parent component after it has already been checked, Angular throws an error.
            // setTimeout will make the update async, and it will be picked up on the next change detection.
            setTimeout(() => {
                this.selectedDate.emit(moment(dateUpdated));
            }, 0);
        }
    }

    updateCalendar(): void {
        this.dayGrid = [];

        const firstDayDate = moment(this.navDate).startOf('month');
        const initialEmptyCells = this.getWeekDayNumber(firstDayDate);
        const lastDayDate = moment(this.navDate).endOf('month');
        const lastEmptyCells = 6 - this.getWeekDayNumber(lastDayDate);
        const daysInMonth = this.navDate?.daysInMonth() || 0;
        const arrayLength = initialEmptyCells + lastEmptyCells + daysInMonth;
        const firstDateOfGrid = moment(this.navDate).startOf('month').subtract(initialEmptyCells, 'day');

        for (let i = 0; i < arrayLength; i += 1) {
            const dateOfGrid = firstDateOfGrid.clone().add(i, 'day');
            this.dayGrid.push({
                value: dateOfGrid.date(),
                available: this.isAvailable(dateOfGrid),
                date: dateOfGrid.clone(),
            });
        }

        this.headerDate = this.navDate?.format('MMMM YYYY') || '';
    }
}
