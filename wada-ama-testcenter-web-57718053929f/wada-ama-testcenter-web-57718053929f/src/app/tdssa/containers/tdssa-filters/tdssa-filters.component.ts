import { Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { formatDate } from 'ngx-bootstrap/chronos';
import { Country, Daterange } from '@shared/models';
import * as fromTDSSAStore from '@tdssa/store';
import * as fromRootStore from '@core/store';
import { displayDateFormat, latinize } from '@shared/utils/string-utils';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { ValidationCategory, withCategory } from '@shared/utils';

@Component({
    selector: 'app-tdssa-filters',
    templateUrl: './tdssa-filters.component.html',
    styleUrls: ['./tdssa-filters.component.scss'],
})
export class TDSSAFiltersComponent implements OnInit, OnDestroy {
    form = new FormGroup(
        {
            daterange: new FormControl({
                from: new Date(new Date().getFullYear(), 0, 1).toISOString(),
                to: new Date().toISOString(),
                quickFilter: {
                    value: 'yearToDate',
                    displayName: 'Year to Date',
                },
            }),
            athleteInternational: new FormControl(true, [
                withCategory(Validators.required, ValidationCategory.Mandatory),
            ]),
            athleteNational: new FormControl(true, [withCategory(Validators.required, ValidationCategory.Mandatory)]),
            athleteOther: new FormControl(false, [withCategory(Validators.required, ValidationCategory.Mandatory)]),
            testTypeInCompetition: new FormControl(true, [
                withCategory(Validators.required, ValidationCategory.Mandatory),
            ]),
            testTypeOutCompetition: new FormControl(true, [
                withCategory(Validators.required, ValidationCategory.Mandatory),
            ]),
            sportNationality: new FormControl([], [withCategory(Validators.required, ValidationCategory.Mandatory)]),
        },
        { updateOn: 'change' }
    );

    dateFormat = 'YYYY-MM-DD';

    isFilterCollapsed$: Observable<boolean> = this.store.pipe(select(fromTDSSAStore.getIsCollapsed));

    suggestions$: Observable<Array<Country>> = this.store.pipe(select(fromRootStore.getSportNationalities));

    isYearMode = this.getIsYearMode('yearToDate');

    private subscriptions = new Subscription();

    constructor(private store: Store<fromRootStore.IState>) {}

    ngOnInit(): void {
        this.subscriptions.add(
            this.store.pipe(select(fromTDSSAStore.getFormState)).subscribe((tdssaForm) => {
                this.store.dispatch(
                    fromTDSSAStore.GetTDSSATable({
                        startDate: new Date(tdssaForm.daterange.from),
                        endDate: new Date(tdssaForm.daterange.to),
                    })
                );
            })
        );

        this.subscriptions.add(
            this.store.pipe(select(fromTDSSAStore.getDaterange)).subscribe((daterange: Daterange) => {
                this.isYearMode = this.getIsYearMode(daterange.quickFilter.value);
            })
        );
    }

    ngOnDestroy(): void {
        this.store.pipe(select(fromTDSSAStore.getIsCollapsed), take(1)).subscribe((isFilters: boolean) => {
            if (!isFilters) {
                this.store.dispatch(fromTDSSAStore.ToggleTDSSAFilters());
            }
        });
        this.store.dispatch(fromTDSSAStore.ResetTDSSAForm());
        this.subscriptions.unsubscribe();
    }

    toggleCollapse(): void {
        this.store.dispatch(fromTDSSAStore.ToggleTDSSAFilters());
    }

    loadSuggestions = (token: string): Observable<Array<Country>> => {
        const latinizedToken = latinize(token.toLocaleLowerCase());

        return this.suggestions$.pipe(
            map((suggestions: Array<Country>) =>
                suggestions.filter(
                    (state: Country): boolean => latinize(state.name.toLocaleLowerCase()).indexOf(latinizedToken) >= 0
                )
            )
        );
    };

    displayDate(date: any): string {
        return formatDate(new Date(date), displayDateFormat);
    }

    getIsYearMode(mode: string): boolean {
        return mode === 'previousYear' || mode === 'twoYearAgo';
    }

    onAthleteInternationalSelected(event: any): void {
        this.store.dispatch(fromTDSSAStore.SetTDSSAFormAthleteInternational({ value: event }));
    }

    onAthleteNationalSelected(event: any): void {
        this.store.dispatch(fromTDSSAStore.SetTDSSAFormAthleteNational({ value: event }));
    }

    onAthleteOtherSelected(event: any): void {
        this.store.dispatch(fromTDSSAStore.SetTDSSAFormAthleteOther({ value: event }));
    }

    onDateRangeSelected(event: any): void {
        this.store.dispatch(fromTDSSAStore.SetTDSSAFormDateRange({ value: event }));
    }

    onSportNationalitySelected(event: any): void {
        this.store.dispatch(fromTDSSAStore.SetTDSSAFormSportNationality({ value: event }));
    }

    onTestTypeInCompetitionSelected(event: any): void {
        this.store.dispatch(fromTDSSAStore.SetTDSSAFormTestTypeInCompetition({ value: event }));
    }

    onTestTypeOutCompetitionSelected(event: any): void {
        this.store.dispatch(fromTDSSAStore.SetTDSSAFormTestTypeOutCompetition({ value: event }));
    }

    get daterange(): AbstractControl | null {
        return this.form.get('daterange');
    }

    get athleteInternational(): AbstractControl | null {
        return this.form.get('athleteInternational');
    }

    get athleteNational(): AbstractControl | null {
        return this.form.get('athleteNational');
    }

    get athleteOther(): AbstractControl | null {
        return this.form.get('athleteOther');
    }

    get testTypeInCompetition(): AbstractControl | null {
        return this.form.get('testTypeInCompetition');
    }

    get testTypeOutCompetition(): AbstractControl | null {
        return this.form.get('testTypeOutCompetition');
    }

    get sportNationality(): AbstractControl | null {
        return this.form.get('sportNationality');
    }
}
