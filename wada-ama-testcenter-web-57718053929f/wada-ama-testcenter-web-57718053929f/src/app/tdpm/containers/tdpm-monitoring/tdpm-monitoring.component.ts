import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { ActivatedRoute, ParamMap } from '@angular/router';
import * as fromRootStore from '@core/store';
import * as fromTDPMStore from '@tdpm/store';
import { FromToDate } from '@shared/models';
import { TDPMSheetInfo, TestTypeToShow } from '@tdpm/models';

import { TDPMToCSVConvertorService } from '@tdpm/services';
import { TranslationMap, TranslationService } from '@core/services';
import { Organization } from '@core/models';
import { latinize } from '@shared/utils';

@Component({
    selector: 'app-tdpm-monitoring',
    templateUrl: './tdpm-monitoring.component.html',
    styleUrls: ['./tdpm-monitoring.component.scss'],
})
export class TDPMMonitoringComponent implements OnInit {
    // These observables are consumed by the template
    tdpmSheetInfoFiltered$: Observable<TDPMSheetInfo> = this.store.select(fromTDPMStore.getTDPMSheetInfo);

    organizationName$: Observable<string> = this.store.select(fromRootStore.getOrganizationViewName);

    organizationShortName$: Observable<string> = this.store.select(fromRootStore.getOrganizationViewShortName);

    organizations$: Observable<Array<Organization>> = this.store.select(fromRootStore.getOrganizations);

    getError$: Observable<boolean> = this.store.select(fromTDPMStore.getError);

    dateRange$: Observable<FromToDate> = this.store.select(fromTDPMStore.getDateRange);

    showType$: Observable<TestTypeToShow> = this.store.select(fromTDPMStore.getShowTestType);

    isWada$: Observable<boolean> = this.store.select(fromRootStore.getOrganizationisWada);

    loadingSubscription: Subscription;

    loading = true;

    currentYear = new Date().getFullYear();

    constructor(
        private store: Store<fromRootStore.IState>,
        private csvService: TDPMToCSVConvertorService,
        private translationSerice: TranslationService,
        private route: ActivatedRoute
    ) {
        this.loadingSubscription = this.store.select(fromTDPMStore.getLoading).subscribe((loading: boolean) => {
            this.loading = loading;
        });

        this.store.dispatch(fromRootStore.GetOrganizations());
    }

    ngOnInit(): void {
        this.route.paramMap
            .pipe(
                map((params: ParamMap) => Number(params.get('year'))),
                map((year) => year || this.currentYear)
            )
            .subscribe((year: number) => {
                this.store.dispatch(
                    fromTDPMStore.setTDPMTablesDate({
                        fromToDate: new FromToDate(0, year, new Date().getMonth(), year),
                    })
                );
            });
    }

    onSearch(value: string): void {
        this.store.dispatch(fromTDPMStore.searchBarFilterTDPMTable({ query: value }));
    }

    exportToCSV(): void {
        combineLatest([
            this.tdpmSheetInfoFiltered$,
            this.dateRange$,
            this.organizationShortName$,
            this.showType$,
            this.translationSerice.translations$,
        ])
            .pipe(first())
            .subscribe(
                ([tdpmSheetInfo, dateRange, orgName, showType, translations]: [
                    TDPMSheetInfo,
                    FromToDate,
                    string,
                    TestTypeToShow,
                    TranslationMap
                ]) => {
                    const csvData = this.csvService.TDPMSheetToCSVData(
                        tdpmSheetInfo,
                        translations,
                        dateRange,
                        orgName,
                        showType
                    );
                    const csvString = this.csvService.CSVDataToString(csvData);
                    this.csvService.exportCSVString('exportToCsv.csv', csvString);
                }
            );
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
