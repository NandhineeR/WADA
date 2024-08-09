import { Component, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { DataTableComponent, DaterangeComponent } from '@shared/components';
import { ColumnDef, DataSource, ErrorMessageKeyEnums, PROPERTY_MAX_MO_RESULTS, UserRolesEnum } from '@shared/models';
import { TestingOrderRow } from '@to/models';
import * as fromRootStore from '@core/store';
import * as fromStore from '@to/store';
import { Observable, Subject, combineLatest } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { TranslationService } from '@core/services';
import { TableTranslationService } from '@shared/services';
import { SearchCriteria } from '@to/models/search-criteria.model';
import { TestingOrderRowColumnNames } from '@to/models/enums/column-definitions/testing-order-row-column-names.enum';
import { formatDisplayDate } from '@shared/utils/date-utils';
import * as moment from 'moment';
import { isNullOrBlank } from '@shared/utils';

@Component({
    selector: 'app-view-testing-orders',
    templateUrl: './view-testing-orders.component.html',
    styleUrls: ['./view-testing-orders.component.scss'],
})
export class ViewTestingOrdersComponent implements OnInit {
    @ViewChild('testingOrderNumberHeader', { static: true }) set testingOrderNumberHeader(template: TemplateRef<any>) {
        this.setHeaderTemplate(TestingOrderRowColumnNames.TESTING_ORDER_NUMBER, template);
    }

    @ViewChild('adoReferenceNumberHeader', { static: true }) set adoReferenceNumberHeader(template: TemplateRef<any>) {
        this.setHeaderTemplate(TestingOrderRowColumnNames.ADO_REFERENCE_NUMBER, template);
    }

    @ViewChild('testingAuthorityHeader', { static: true }) set testingAuthorityHeader(template: TemplateRef<any>) {
        this.setHeaderTemplate(TestingOrderRowColumnNames.TESTING_AUTHORITY, template);
    }

    @ViewChild('testingDescriptionHeader', { static: true }) set testingDescriptionHeader(template: TemplateRef<any>) {
        this.setHeaderTemplate(TestingOrderRowColumnNames.TESTING_DESCRIPTION, template);
    }

    @ViewChild('issuedDateHeader', { static: true }) set issuedDateHeader(template: TemplateRef<any>) {
        this.setHeaderTemplate(TestingOrderRowColumnNames.ISSUED_DATE, template);
    }

    @ViewChild('startDateHeader', { static: true }) set startDateHeader(template: TemplateRef<any>) {
        this.setHeaderTemplate(TestingOrderRowColumnNames.START_DATE, template);
    }

    @ViewChild('testingCityHeader', { static: true }) set testingCityHeader(template: TemplateRef<any>) {
        this.setHeaderTemplate(TestingOrderRowColumnNames.TESTING_CITY, template);
    }

    @ViewChild('testingOrderStatusHeader', { static: true }) set testingOrderStatusHeader(template: TemplateRef<any>) {
        this.setHeaderTemplate(TestingOrderRowColumnNames.TESTING_ORDER_STATUS, template);
    }

    /* CELL TEMPLATES */
    @ViewChild('testingOrderNumber', { static: true }) set testingOrderNumber(template: TemplateRef<any>) {
        this.setCellTemplate(TestingOrderRowColumnNames.TESTING_ORDER_NUMBER, template);
    }

    @ViewChild('issuedDate', { static: true }) set issuedDate(template: TemplateRef<any>) {
        this.setCellTemplate(TestingOrderRowColumnNames.ISSUED_DATE, template);
    }

    @ViewChild('startDate', { static: true }) set startDate(template: TemplateRef<any>) {
        this.setCellTemplate(TestingOrderRowColumnNames.START_DATE, template);
    }

    @ViewChild('table', { static: true }) set table(component: DataTableComponent<TestingOrderRow>) {
        this._table = component;
    }

    @ViewChild('dateRange') dateRange!: DaterangeComponent;

    @HostListener('keydown', ['$event']) onKeydown(event: KeyboardEvent): void {
        this.resetNotFoundAlert();

        const { key } = event;
        if (key === 'Enter' && this.toNumberSearchString !== '') this.navigateToViewTestingOrder();
    }

    columns: Array<Partial<ColumnDef<TestingOrderRow>>> = [
        {
            key: TestingOrderRowColumnNames.TESTING_ORDER_NUMBER,
            header: this.getHeaderTranslation('testingOrderNumber'),
            headerTemplate: this.testingOrderNumberHeader,
            cellTemplate: this.testingOrderNumber,
            mandatory: true,
            hasFiltering: true,
            hasSorting: true,
            default: true,
        },
        {
            key: TestingOrderRowColumnNames.ADO_REFERENCE_NUMBER,
            header: this.getHeaderTranslation('adoReferenceNumber'),
            headerTemplate: this.adoReferenceNumberHeader,
            cell: (e) => e.adoReferenceNumber,
            mandatory: true,
            hasFiltering: true,
            hasSorting: true,
            default: true,
        },
        {
            key: TestingOrderRowColumnNames.TESTING_AUTHORITY,
            header: this.getHeaderTranslation('testingAuthority'),
            headerTemplate: this.testingAuthorityHeader,
            cell: (e) => e.testingAuthority,
            mandatory: true,
            hasFiltering: true,
            hasSorting: true,
            default: true,
        },
        {
            key: TestingOrderRowColumnNames.TESTING_DESCRIPTION,
            header: this.getHeaderTranslation('description'),
            headerTemplate: this.testingDescriptionHeader,
            cell: (e) => e.description,
            hasFiltering: true,
            hasSorting: true,
            default: true,
        },
        {
            key: TestingOrderRowColumnNames.TESTING_ORDER_STATUS,
            header: this.getHeaderTranslation('testingOrderStatus'),
            headerTemplate: this.testingOrderStatusHeader,
            cell: (e) => e.testingOrderStatus,
            mandatory: true,
            hasFiltering: true,
            hasSorting: true,
            default: true,
        },
        {
            key: TestingOrderRowColumnNames.ISSUED_DATE,
            header: this.getHeaderTranslation('issuedDate'),
            headerTemplate: this.issuedDateHeader,
            cellTemplate: this.issuedDate,
            hasFiltering: true,
            hasSorting: true,
            default: true,
        },
        {
            key: TestingOrderRowColumnNames.START_DATE,
            header: this.getHeaderTranslation('startDate'),
            headerTemplate: this.startDateHeader,
            cellTemplate: this.startDate,
            hasFiltering: true,
            hasSorting: true,
            default: true,
        },
        {
            key: TestingOrderRowColumnNames.TESTING_CITY,
            header: this.getHeaderTranslation('city'),
            headerTemplate: this.testingCityHeader,
            cell: (e) => e.city,
            hasFiltering: true,
            hasSorting: true,
            default: true,
        },
    ];

    hasListTOsError$: Observable<boolean> = combineLatest(
        this.store.select(fromStore.getGlobalError),
        this.store.select(fromStore.getErrorMessageKey)
    ).pipe(
        map(
            ([hasError, errorMessageKey]: [boolean, string | null]) =>
                hasError && (!errorMessageKey || errorMessageKey !== 'TESTING_ORDER_NOT_FOUND')
        )
    );

    isMissionOrderWriter$: Observable<boolean> = this.store.pipe(
        select(fromRootStore.getHasRole(UserRolesEnum.MISSION_ORDER_WRITER))
    );

    loading$: Observable<boolean> = this.store.select(fromStore.getLoadingTestingOrders);

    testingOrderRows$: Observable<Array<TestingOrderRow>> = this.store.select(fromStore.getTestingOrderRows);

    translations$ = this.translationService.translations$;

    _table: DataTableComponent<TestingOrderRow> | null = null;

    clearButtonDisabled = true;

    dataSource = new DataSource(Array<TestingOrderRow>());

    errorMessageKey = '';

    dateFormat = 'YYYY-MM-DD';

    isFilterCollapsed = true;

    maxMOResults$: Observable<number | null> = this.store.select(fromRootStore.getMaxMOResults);

    maxResults = '';

    searchcriteria: SearchCriteria = new SearchCriteria();

    showLimitListWarning = false;

    showNotFoundAlert = false;

    subjectCriteriaSearch = new Subject<any>();

    toId = '';

    toNumberSearchString = '';

    constructor(
        private store: Store<fromRootStore.IState>,
        private translationService: TranslationService,
        private tableTranslationService: TableTranslationService
    ) {}

    ngOnInit(): void {
        this.store.dispatch(fromStore.GetTestingOrderRows({ searchCriteria: new SearchCriteria() }));

        this.subjectCriteriaSearch.pipe(debounceTime(250)).subscribe((object: SearchCriteria) => {
            const searchCriteria: SearchCriteria = new SearchCriteria(object);
            searchCriteria.fromDate = this.displayDate(searchCriteria.fromDate);
            searchCriteria.toDate = this.displayDate(searchCriteria.toDate);
            this.store.dispatch(fromStore.GetTestingOrderRows({ searchCriteria }));
            this.renderDataSource();
        });

        this.renderDataSource();
    }

    clearFilter(): void {
        if (!this.clearButtonDisabled) {
            this.clearButtonDisabled = true;
            this.dateRange.dateChanged('', true);
            this.dateRange.dateChanged('', false);
            this.searchcriteria = new SearchCriteria();
            this.subjectCriteriaSearch.next(this.searchcriteria);
        }
    }

    displayDate(date: string): string {
        const displayDate = moment(date);
        return !isNullOrBlank(date) && displayDate.isValid()
            ? formatDisplayDate(displayDate, undefined, this.dateFormat)
            : '';
    }

    getHeaderTranslation(header: string): string {
        let headerTranslation = '';
        this.tableTranslationService.translateHeader(header).subscribe((value: string) => {
            headerTranslation = value;
        });
        return headerTranslation;
    }

    isDateRangeEmpty(): boolean {
        return isNullOrBlank(this.searchcriteria.fromDate) || isNullOrBlank(this.searchcriteria.toDate);
    }

    navigateToViewTestingOrder(): void {
        this.toId = this.toNumberSearchString.replace(/\D/g, '');
        this.store.dispatch(fromStore.CleanTestingOrder());
        this.store.dispatch(fromStore.GetTestingOrder({ id: this.toId }));

        this.store.select(fromStore.getErrorMessageKey).subscribe((action: any) => {
            if (action != null) {
                this.showNotFoundAlert = true;
                this.errorMessageKey = ErrorMessageKeyEnums.getValue(action) || '';
            }
        });

        this.store.select(fromStore.getTOId).subscribe((action: any) => {
            if (action != null) {
                this.store.dispatch(fromRootStore.Go({ path: ['to', 'view', action] }));
            }
        });
    }

    renderDataSource(): void {
        this.store.dispatch(fromRootStore.GetMaxMOResults({ property: PROPERTY_MAX_MO_RESULTS }));
        this.testingOrderRows$.subscribe((testingOrderRows: Array<TestingOrderRow>) => {
            this.dataSource.data = testingOrderRows;
            this.maxMOResults$.subscribe((maxMOResults: number | null) => {
                this.showLimitListWarning = false;
                if (maxMOResults && maxMOResults === testingOrderRows.length) {
                    this.showLimitListWarning = true;
                    this.maxResults = this.dataSource.data.length.toString();
                }
            });
        });

        if (this._table) this._table.render();
    }

    resetNotFoundAlert(): void {
        this.showNotFoundAlert = false;
    }

    toggleCollapse(): void {
        this.isFilterCollapsed = !this.isFilterCollapsed;
    }

    updateSearchCriteria(value: any, filterName: string): void {
        if (value.length !== 0) this.clearButtonDisabled = false;
        else this.clearButtonDisabled = true;

        switch (filterName) {
            case 'adoReferenceNumber':
                this.searchcriteria.adoReferenceNumber = value as string;
                break;
            case 'dateRange':
                this.searchcriteria.fromDate = moment(value?.from || '').toISOString();
                this.searchcriteria.toDate = moment(value?.to || '').toISOString();
                break;
            default:
                break;
        }
        this.subjectCriteriaSearch.next(this.searchcriteria);
    }

    private setCellTemplate(columnName: string, template: TemplateRef<any>) {
        (this.columns.find((column) => column.key === columnName) || {}).cellTemplate = template;
        this.columns = this.columns.slice();
    }

    private setHeaderTemplate(columnName: string, template: TemplateRef<any>) {
        (this.columns.find((column) => column.key === columnName) || {}).headerTemplate = template;
        this.columns = this.columns.slice();
    }
}
