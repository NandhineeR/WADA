import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    HostListener,
    Input,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import * as moment from 'moment';
import { isNullOrBlank } from '@shared/utils/string-utils';

export const DATEP_INPUT_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DateInputComponent),
    multi: true,
};

type Moment = moment.Moment;

@Component({
    selector: 'app-date-input',
    templateUrl: './date-input.component.html',
    styleUrls: ['./date-input.component.scss'],
    providers: [DATEP_INPUT_VALUE_ACCESSOR],
})
export class DateInputComponent implements AfterViewInit, ControlValueAccessor, OnInit {
    @ViewChild('calendarDiv', { static: true }) calendarDiv?: ElementRef;

    @ViewChild('inputRef', { static: true }) inputRef?: ElementRef;

    @Output()
    readonly showCalendarEmitter: EventEmitter<boolean> = new EventEmitter(false);

    @Input() dataQA = '';

    @Input() fieldId = '';

    @Input() format = 'DD-MMM-YYYY';

    @Input() hasError = '';

    @Input() inline = false;

    @Input() isMarkAsNotCollectedModal = false;

    @Input() isLastItem = '';

    @Input() isStartingFocus = false;

    @Input() locale = 'en';

    @Input() maxDate: Moment | undefined = undefined;

    @Input() minDate: Moment | undefined = undefined;

    dateDisplayed = '';

    selectedDate: Moment | undefined = moment();

    showCalendar = false;

    today: Moment = moment();

    private onChange: any;

    private onTouched: any;

    private requestClose = false;

    @HostListener('window:mousemove', [])
    onMouseMove(): void {
        if (this.isMarkAsNotCollectedModal) this.adjustCalendarPosition();
    }

    @HostListener('window:mousewheel', [])
    onMouseWheel(): void {
        if (this.isMarkAsNotCollectedModal) this.adjustCalendarPosition();
    }

    ngAfterViewInit(): void {
        if (this.isMarkAsNotCollectedModal) this.adjustCalendarPosition();
    }

    ngOnInit(): void {
        if (this.isStartingFocus) {
            this.focus();
        }
    }

    writeValue(value: Date): void {
        this.selectedDate = value ? moment(value) : undefined;
        this.updateDisplayDate(false);
    }

    registerOnChange(fn: (_: any) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(onTouched: any): void {
        this.onTouched = onTouched;
    }

    closeCalendar(dateSelected: Moment | undefined): void {
        this.setShowCalendar(false);
        this.requestClose = true;
        if (dateSelected) {
            this.updateDisplayDate(false, dateSelected.toString());
        }
        setTimeout(() => {
            this.requestClose = false;
        }, 100);
    }

    focus(): void {
        // Without the setTimeout, the input field does not get the focus
        setTimeout(() => this.inputRef && this.inputRef.nativeElement.focus());
    }

    /**
     * Gets the value of the date when the user moves out the focus from the date-input field
     */
    onBlur(event: FocusEvent): void {
        const { value } = event.target as HTMLInputElement;
        const tempDate = `${value.slice(0, 2)}-${value.slice(3, 5)}-${value.slice(6, 10)}`;
        // Sets the date to one of the accepted formats and sets the Moment locale, which is the language assigneded to this date
        const date = value ? moment(tempDate, 'DD-MM-YYYY') : undefined;
        this.notify(date, value);
        this.updateDisplayDate(true, value);
    }

    onClickInput(): void {
        if (!this.showCalendar && !this.requestClose) {
            this.setShowCalendar(true);
        }
    }

    onEnterKeydown(): void {
        this.setShowCalendar(false);
    }

    onFocus(event: FocusEvent): void {
        const { value } = event.target as HTMLInputElement;
        this.updateDisplayDate(true, value);
    }

    selectDate(dateSelected: Moment): void {
        this.notify(dateSelected, undefined);
        this.closeCalendar(dateSelected);
    }

    private adjustCalendarPosition(): void {
        const modalEl = document.getElementById('modalWrapper');
        const inputEl = this.inputRef?.nativeElement;
        const calendarEl = this.calendarDiv?.nativeElement;
        if (modalEl && inputEl && calendarEl) {
            const rectModal = modalEl.getBoundingClientRect();
            const rectInput = inputEl.getBoundingClientRect();
            const calendarHeight = document.getElementById('calendar')?.getBoundingClientRect().height || -1;

            let newPosition = rectInput.bottom - rectModal.top;
            if (this.isLastItem && calendarHeight > 0) {
                newPosition -= calendarHeight + rectInput.height + 4;
            }
            calendarEl.style.setProperty('bottom', `${newPosition}px`);
            calendarEl.style.setProperty('top', `${newPosition}px`);
            calendarEl.style.setProperty('y', `${newPosition}px`);
        }
    }

    /**
     * Triggers the onChange and onTouched listeners with the given date
     */
    private fireListeners(date: Moment | Date | undefined) {
        if (this.onChange) this.onChange(date);
        if (this.onTouched) this.onTouched();
    }

    /**
     * Sets the date which user entered, or the one picked in the calender as a selected date
     */
    private notify(date: Moment | undefined, value: string | undefined): void {
        if (date && date.isValid()) {
            this.selectedDate = date;
            this.fireListeners(date || undefined);
        } else if (date && value && !isNullOrBlank(value)) {
            this.selectedDate = date;
            this.fireListeners(date);
        } else {
            this.selectedDate = undefined;
            this.fireListeners(undefined);
        }
    }

    private setShowCalendar(showCalendar: boolean): void {
        this.showCalendar = showCalendar;
        this.showCalendarEmitter.emit(this.showCalendar);
    }

    private updateDisplayDate(formatDigit = false, value?: string): void {
        const format = formatDigit ? 'DD-MM-YYYY' : this.format;
        this.dateDisplayed =
            this.selectedDate && this.selectedDate.isValid() ? this.selectedDate.format(format) : value || '';
    }
}
