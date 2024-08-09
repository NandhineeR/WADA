import { Component, Input, OnDestroy } from '@angular/core';
import { IUser } from '@core/models';
import { select, Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import * as fromRootStore from '@core/store';
import { ConcurrentUser, IFrequencyFilter, Month, PeriodType, Quarter, Year } from '@tdp/models';
import * as fromStore from '@tdp/store';

@Component({
    selector: 'app-frequency',
    templateUrl: './frequency.component.html',
    styleUrls: ['./frequency.component.scss'],
})
export class FrequencyComponent implements OnDestroy {
    readonly periodTypeEnum = PeriodType;

    readonly yearEnum = Year;

    readonly yearSubscription: Subscription;

    readonly yearsDataQA: Array<string> = [
        'lastYearDropdownOption',
        'currentYearDropdownOption',
        'nextYearDropdownOption',
    ];

    @Input() orgName = '';

    concurrentUser$: Observable<ConcurrentUser | null> = this.store.select(fromStore.getTDPSheetUser);

    currentUsername$: Observable<string> = this.store
        .select(fromRootStore.getUserProfile)
        .pipe(map((user: IUser) => user.username));

    filter$: Observable<IFrequencyFilter> = this.store.select(fromStore.getTDPFrequencyFilter).pipe(map((f) => f));

    yearSelected = '';

    years: Array<string> = [
        (new Date().getFullYear() - 1).toString(),
        new Date().getFullYear().toString(),
        (new Date().getFullYear() + 1).toString(),
    ];

    constructor(private store: Store<fromRootStore.IState>) {
        this.yearSubscription = this.store.pipe(select(fromStore.getTDPYear)).subscribe((year: number) => {
            this.yearSelected = year?.toString() || this.years[1];
        });
    }

    ngOnDestroy(): void {
        this.yearSubscription.unsubscribe();
    }

    changeFilter(frequency: PeriodType): void {
        this.store.dispatch(fromStore.SetTDPTableFrequency({ frequency }));
    }

    changeQuarterlyFilter(quarter: Quarter): void {
        this.store.dispatch(fromStore.SetTDPTableQuarter({ quarter }));
    }

    changeMonthlyFilter(month: Month): void {
        this.store.dispatch(fromStore.SetTDPTableMonth({ month }));
    }

    changeYearlyFilter(year: Year): void {
        this.store.dispatch(fromStore.SetTDPTableYear({ year }));
    }

    onYearChange(value: string): void {
        const date = new Date().getFullYear();
        const enumValue = parseInt(value, 10) - date;

        this.store.dispatch(fromStore.SetTDPTableYear({ year: enumValue + 1 }));
    }
}
