import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as fromStore from '@tdpm/store';
import * as fromRootStore from '@core/store';
import { DatePickerMode, FromToDate } from '@shared/models';
import { TestTypeToShow } from '@tdpm/models';
import { TranslationMap, TranslationService } from '@core/services';

@Component({
    selector: 'app-tdpm-filters',
    templateUrl: './tdpm-filters.component.html',
    styleUrls: ['./tdpm-filters.component.scss'],
})
export class TDPMFiltersComponent implements OnChanges {
    @Input() showType: TestTypeToShow = TestTypeToShow.CompleteNoLabResultMatched;

    @Input() dateRange: FromToDate = new FromToDate(
        0,
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getFullYear()
    );

    isFilterCollapsed$: Observable<boolean> = this.store.select(fromStore.getIsCollapsed);

    translations$ = this.translationService.translations$;

    monthLabels$ = this.translationService.translations$.pipe(
        map((translationMap: TranslationMap) =>
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(
                (month) => translationMap[this.translationService.getMonthKey(month.toString())]
            )
        )
    );

    currentYear: number = new Date().getFullYear();

    showTypeEnum = TestTypeToShow;

    modeEnum = DatePickerMode;

    mode: DatePickerMode = DatePickerMode.YearToDate;

    isYearMode = this.getIsYearMode();

    modeString = this.getModeString();

    constructor(private store: Store<fromRootStore.IState>, private translationService: TranslationService) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.dateRange && this.dateRange) {
            this.mode = this.dateRange.getModeFromDate();
        }
    }

    toggleCollapse(): void {
        this.store.dispatch(fromStore.toggleTDPMFilters());
    }

    onDateChange(fromToDate: FromToDate): void {
        this.mode = fromToDate.getModeFromDate();
        this.isYearMode = this.getIsYearMode();
        this.modeString = this.getModeString();
        this.store.dispatch(fromStore.setTDPMTablesDate({ fromToDate }));
    }

    testTypeChanged(testType: TestTypeToShow): void {
        this.store.dispatch(fromStore.setTDPMTablesShowType({ showType: testType }));
    }

    private getModeString(): string {
        return DatePickerMode[this.mode];
    }

    private getIsYearMode(): boolean {
        return (
            this.mode === DatePickerMode.ThreeYearsAgo ||
            this.mode === DatePickerMode.TwoYearsAgo ||
            this.mode === DatePickerMode.LastYear ||
            this.mode === DatePickerMode.NextYear
        );
    }
}
