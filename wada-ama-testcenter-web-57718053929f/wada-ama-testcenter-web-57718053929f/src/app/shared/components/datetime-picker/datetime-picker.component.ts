/* eslint-disable prettier/prettier */
import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Moment } from 'moment';
import * as moment from 'moment';
import { IDatePickerConfig } from 'ng2-date-picker';
import { isNullOrBlank } from '@shared/utils/string-utils';
import { isNotUndefinedNorNull } from '@shared/utils';

export const DATETIME_PICKER_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DatetimePickerComponent),
    multi: true,
};

@Component({
    selector: 'app-datetime-picker',
    templateUrl: './datetime-picker.component.html',
    styleUrls: ['./datetime-picker.component.scss'],
    providers: [DATETIME_PICKER_VALUE_ACCESSOR],
})
export class DatetimePickerComponent implements ControlValueAccessor {
    readonly format = 'DD-MM-YYYY HH:mm';

    @Output() readonly selected = new EventEmitter<any>();

    @Input()
    set disabled(disabled: boolean | undefined) {
        if (disabled) {
            this.selectedDatetime = undefined;
            this.datetimeDisplayed = '';
        }

        this._disabled = disabled;
    }

    get disabled(): boolean | undefined {
        return this._disabled;
    }

    @Input() fieldId = '';

    @Input() hasError = '';

    @Input() set locale(locale: string | undefined) {
        if (locale) {
            this.datetimePickerConfig.locale = locale;
        }
    }

    _disabled: boolean | undefined;

    datetimeDisplayed = '';

    datetimePickerConfig: IDatePickerConfig = {
        format: this.format,
        locale: 'en',
        showTwentyFourHours: true,
        monthFormat: 'MMMM YYYY',
        showGoToCurrent: false,
        closeOnEnter: true,
        hideOnOutsideClick: true,
        drops: 'down',
    };

    selectedDatetime: Moment | undefined;

    selectedMonthDate: Moment | undefined = moment();

    private onChange: any;

    private onTouched: any;

    modelChangeFn(value: Moment | string | undefined): void {
        if (isNullOrBlank(value?.toString())) {
            this.selectedDatetime = undefined;
            this.datetimeDisplayed = '';
        } else {
            const dateValue: string = (typeof value === 'string') ? value : value?.format(this.format) || '';
            const date = moment(dateValue, this.format, true);
            if (date.isValid()) this.datetimeDisplayed = date.format(this.format);
            else if (!date.isValid() && (typeof value === 'string')) this.datetimeDisplayed = dateValue;
        }
    }

    onFocusOutEvent(value: any): void {
        if (!value.relatedTarget?.dataset?.date) {
            // Sets the date to one of the accepted formats and sets the Moment locale, which is the language assigned to this date
            const date = moment(this.datetimeDisplayed, this.format, true);
            this.notify(date, this.datetimeDisplayed);
            this.selected.emit();
        }
    }

    onKeyUp(value: any): void {
        this.datetimeDisplayed = value.target.value;
    }

    onLeftNav(): void {
        this.selectedMonthDate = this.selectedMonthDate?.subtract(1, 'months')
    }

    onOpen(): void {
        this.selectedMonthDate = isNotUndefinedNorNull(this.selectedDatetime) ? moment(this.selectedDatetime) : moment();
    }

    onRightNav(): void {
        this.selectedMonthDate = this.selectedMonthDate?.subtract(-1, 'months')
    }

    registerOnChange(fn: (_: any) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(onTouched: any): void {
        this.onTouched = onTouched;
    }

    writeValue(value: Moment): void {
        if (value === undefined || value === null) {
            this.selectedDatetime = undefined;
            this.datetimeDisplayed = '';
        } else if (value.isValid()) {
            this.selectedDatetime = moment(value, this.format, true);
            this.datetimeDisplayed = this.selectedDatetime?.format(this.format) || '';
        }
    }

    private notify(datetime: Moment | undefined, value: string | undefined): void {
        if (datetime && datetime.isValid()) {
            this.selectedDatetime = datetime;
            if (this.onChange) this.onChange(datetime);
        } else if (datetime && !isNullOrBlank(value)) {
            if (this.onChange) this.onChange(datetime);
        } else {
            this.selectedDatetime = undefined;
            if (this.onChange) this.onChange(undefined);
        }

        if (this.onTouched) this.onTouched();
    }
}
