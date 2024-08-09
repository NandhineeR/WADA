import { Component, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { TableFilters } from '@tdssa/store/states/tdssa-table.state';
import { MLA, TDSSARow, TDSSASheet, TDSSASubRow, Test } from '@tdssa/models';
import { Organization } from '@core/models';
import * as fromRootStore from '@core/store';
import * as fromTDSSAStore from '@tdssa/store';
import { latinize } from '@shared/utils/string-utils';
import { Country } from '@shared/models';
import { ITDSSAFormState } from '@tdssa/store/states/tdssa-form.state';

@Component({
    selector: 'app-tdssa-monitoring',
    templateUrl: './tdssa-monitoring.component.html',
    styleUrls: ['./tdssa-monitoring.component.scss'],
})
export class TDSSAMonitoringComponent implements OnDestroy {
    // These observables are consumed by the template
    tdssaSheetFiltered$: Observable<TDSSASheet>;

    loading$: Observable<boolean> = this.store.select(fromTDSSAStore.getLoading);

    error$: Observable<boolean> = this.store.select(fromTDSSAStore.getError);

    organizationName$: Observable<string> = this.store.select(fromRootStore.getOrganizationViewName);

    organizationShortName$: Observable<string> = this.store.select(fromRootStore.getOrganizationViewShortName);

    mlaArray$: Observable<Array<MLA>> = this.store.select(fromTDSSAStore.getMLAMonitoringArrayFilters);

    organizations$: Observable<Array<Organization>> = this.store.select(fromRootStore.getOrganizations);

    isWada$: Observable<boolean> = this.store.select(fromRootStore.getOrganizationisWada);

    tdssaSheet$: Observable<TDSSASheet> = this.store.select(fromTDSSAStore.getTDSSASheet);

    tableFilters$: Observable<TableFilters> = this.store.select(fromTDSSAStore.getTableFilters);

    topFilters$: Observable<ITDSSAFormState> = this.store.select(fromTDSSAStore.getFormState);

    private dateRangeSubscription: Subscription;

    constructor(private store: Store<fromRootStore.IState>) {
        this.tdssaSheetFiltered$ = combineLatest(
            this.tdssaSheet$,
            this.tableFilters$,
            this.topFilters$,
            this.filterTDSSASheet
        );

        this.store.dispatch(fromRootStore.GetOrganizations());
        this.store.dispatch(fromRootStore.GetSportNationalities());

        this.dateRangeSubscription = this.store
            .select(fromTDSSAStore.getDaterange)
            .pipe(take(1))
            .subscribe((daterange) => {
                if (
                    !Number.isNaN(new Date(daterange.to).getTime()) &&
                    !Number.isNaN(new Date(daterange.from).getTime())
                ) {
                    this.store.dispatch(
                        fromTDSSAStore.GetTDSSATable({
                            startDate: new Date(daterange.from),
                            endDate: new Date(daterange.to),
                        })
                    );
                }
            });
    }

    ngOnDestroy(): void {
        this.dateRangeSubscription.unsubscribe();
    }

    onSearch(value: string): void {
        this.store.dispatch(fromTDSSAStore.SearchBarFilterTDSSATable({ query: value }));
    }

    onMLAChange(mla: fromTDSSAStore.IMLAObject): void {
        this.store.dispatch(fromTDSSAStore.MlaMonitoringFilterTDSSATable({ mla }));
    }

    filterTDSSASheet = (
        tdssaSheet: TDSSASheet,
        tableFilters: TableFilters,
        topFilters: ITDSSAFormState
    ): TDSSASheet => {
        const tdssaSheetUpdated: TDSSASheet = tdssaSheet.clone();

        tdssaSheetUpdated.rows.forEach((row: TDSSARow) => {
            row.subRows = row.subRows.filter((subRow: TDSSASubRow) => {
                const disciplineOrSportMatch =
                    subRow.disciplineName.toLocaleLowerCase().includes(tableFilters.search.toLocaleLowerCase()) ||
                    row.sportName.toLocaleLowerCase().includes(tableFilters.search.toLocaleLowerCase());
                return disciplineOrSportMatch && this.filterTDSSASubRow(subRow, tableFilters, topFilters);
            });
        });

        tdssaSheetUpdated.rows = tdssaSheetUpdated.rows.filter((row: TDSSARow) => row.subRows.length > 0);

        tdssaSheetUpdated.updateTotal();

        return tdssaSheetUpdated;
    };

    filterTDSSASubRow(tdssaSubRow: TDSSASubRow, tableFilters: TableFilters, topFilters: ITDSSAFormState): boolean {
        tdssaSubRow.tests = tdssaSubRow.tests.filter(
            (test: Test) =>
                (topFilters.athleteInternational && test.international) ||
                (topFilters.athleteNational && test.national) ||
                (topFilters.athleteOther && test.other) ||
                test.noAthleteLevel
        );
        tdssaSubRow.tests = tdssaSubRow.tests.filter(
            (test: Test) =>
                (topFilters.testTypeInCompetition && test.inCompetition) ||
                (topFilters.testTypeOutCompetition && test.outOfCompetition)
        );
        if (topFilters.sportNationality.length > 0) {
            tdssaSubRow.tests = tdssaSubRow.tests.filter((test: Test) =>
                Boolean(
                    topFilters.sportNationality.find(
                        (country: Country) => country.id.toString() === test.sportNationality.toString()
                    )
                )
            );
        }

        tdssaSubRow.updateTotal();

        return tableFilters.mlaMonitoringArray.every((mlaFilter: MLA, index: number) =>
            this.rowMatchesFilter(tdssaSubRow, mlaFilter, index)
        );
    }

    private rowMatchesFilter(tdssaSubRow: TDSSASubRow, mlaFilter: MLA, index: number) {
        const getPercentage = (value: number, total: number) => (total === 0 ? 0 : (value / total) * 100);

        const { analyses } = tdssaSubRow.totals;
        const percentage = getPercentage(analyses[index].total, tdssaSubRow.totals.testTotal);

        const compliant = mlaFilter === MLA.Compliant && analyses[index].mla > 0 && percentage >= analyses[index].mla;
        const notCompliant =
            mlaFilter === MLA.NotCompliant && analyses[index].mla > 0 && percentage < analyses[index].mla;
        const all = mlaFilter === MLA.All;

        return compliant || notCompliant || all;
    }

    organizationSuggestions = (token: string): Observable<Array<Organization>> => {
        const latinizedToken = latinize(token.toLocaleLowerCase());

        return this.organizations$.pipe(
            map((organizations: Array<Organization>) =>
                organizations.filter(
                    (organization: Organization): boolean =>
                        latinize(organization.displayName.toLocaleLowerCase()).indexOf(latinizedToken) >= 0
                )
            )
        );
    };

    changeOrganization(organizationView: Organization): void {
        this.store.dispatch(fromRootStore.ChangeOrganizationView({ organizationView }));
    }
}
