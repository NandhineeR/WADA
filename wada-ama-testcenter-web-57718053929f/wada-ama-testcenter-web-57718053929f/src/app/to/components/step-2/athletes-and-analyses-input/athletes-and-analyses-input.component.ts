import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { TranslationService } from '@core/services';
import { select, Store } from '@ngrx/store';
import { DataTableComponent, ErrorModalComponent } from '@shared/components';
import {
    ATHLETE_LEVEL_LIST,
    ColumnDef,
    CountryWithRegions,
    DataSource,
    FieldsSecurity,
    ListItem,
    SampleTypeEnum,
    SportDiscipline,
    TOActionRight,
    TOFormControls,
    UserRolesEnum,
} from '@shared/models';
import { CalculateAgePipe, RemoveParenthesisPipe } from '@shared/pipes';
import { TableTranslationService } from '@shared/services/table-translation.service';
import { formatDisplayDate, getSportDisciplineSuggestions, isNullOrBlank, makeQueryParams } from '@shared/utils';
import { SectionAthleteAndAnalysesAutoCompletes, TestRow, TestRowColumnNames, TestingOrderMode } from '@to/models';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { mapTestRowToTest } from '@to/mappers';
import * as fromAutoCompletesStore from '@autocompletes/store';
import * as fromRootStore from '@core/store';
import * as fromStore from '@to/store';
import { IOrganization } from '@core/models/organization.model';

@Component({
    selector: 'app-athletes-and-analyses-input',
    templateUrl: './athletes-and-analyses-input.component.html',
    styleUrls: ['./athletes-and-analyses-input.component.scss'],
})
export class AthletesAndAnalysesInputComponent implements OnInit, OnDestroy {
    readonly ATHLETE_LEVEL_LIST = ATHLETE_LEVEL_LIST;

    readonly actionRight = TOActionRight;

    readonly controls = TOFormControls;

    readonly sampleTypeEnum = SampleTypeEnum;

    @ViewChild('ageHeader', { static: true }) set ageHeader(template: TemplateRef<any>) {
        this.setHeaderTemplate(TestRowColumnNames.AGE, template);
    }

    @ViewChild('athleteIdHeader', { static: true }) set athleteIdHeader(template: TemplateRef<any>) {
        this.setHeaderTemplate(TestRowColumnNames.ATHLETE_ID, template);
    }

    @ViewChild('analyses', { static: true }) set analyses(template: TemplateRef<any>) {
        this.setCellTemplate(TestRowColumnNames.ANALYSES, template);
    }

    @ViewChild('analysesHeader', { static: true }) set analysesHeader(template: TemplateRef<any>) {
        this.setHeaderTemplate(TestRowColumnNames.ANALYSES, template);
    }

    @ViewChild('athleteHeader', { static: true }) set athleteHeader(template: TemplateRef<any>) {
        this.setHeaderTemplate(TestRowColumnNames.NAME, template);
    }

    @ViewChild('athleteLevelHeader', { static: true }) set athleteLevelHeader(template: TemplateRef<any>) {
        this.setHeaderTemplate(TestRowColumnNames.ATHLETE_LEVEL, template);
    }

    @ViewChild('dateOfBirthHeader', { static: true }) set dateOfBirthHeader(template: TemplateRef<any>) {
        this.setHeaderTemplate(TestRowColumnNames.DATE_OF_BIRTH, template);
    }

    @ViewChild('disabilitiesHeader', { static: true }) set disabilitiesHeader(template: TemplateRef<any>) {
        this.setHeaderTemplate(TestRowColumnNames.DISABILITIES, template);
    }

    @ViewChild('errorModalRef', { static: true })
    errorModalRef?: ErrorModalComponent;

    @ViewChild('gender', { static: true }) set gender(template: TemplateRef<any>) {
        this.setCellTemplate(TestRowColumnNames.SEX, template);
    }

    @ViewChild('genderHeader', { static: true }) set genderHeader(template: TemplateRef<any>) {
        this.setHeaderTemplate(TestRowColumnNames.SEX, template);
    }

    @ViewChild('laboratories', { static: true }) set laboratories(template: TemplateRef<any>) {
        this.setCellTemplate(TestRowColumnNames.LABORATORIES, template);
    }

    @ViewChild('laboratoriesHeader', { static: true }) set laboratoryHeader(template: TemplateRef<any>) {
        this.setHeaderTemplate(TestRowColumnNames.LABORATORIES, template);
    }

    @ViewChild('sportDisciplineHeader', { static: true })
    set sportDisciplineHeader(template: TemplateRef<any>) {
        this.setHeaderTemplate(TestRowColumnNames.SPORT_DISCIPLINE, template);
    }

    @ViewChild('sportNationalityHeader', { static: true }) set sportNationalityHeader(template: TemplateRef<any>) {
        this.setHeaderTemplate(TestRowColumnNames.SPORT_NATIONALITY, template);
    }

    @ViewChild('table', { static: true }) set table(component: DataTableComponent<TestRow>) {
        this._table = component;
    }

    @ViewChild('teamHeader', { static: true }) set teamHeader(template: TemplateRef<any>) {
        this.setHeaderTemplate(TestRowColumnNames.TEAM, template);
    }

    @ViewChild('totalSamples', { static: true }) set totalSamples(template: TemplateRef<any>) {
        this.setFooterTemplate(TestRowColumnNames.ANALYSES, template);
    }

    @Output() readonly submitData: EventEmitter<any> = new EventEmitter<any>();

    @Input() autoComplete: SectionAthleteAndAnalysesAutoCompletes = new SectionAthleteAndAnalysesAutoCompletes();

    @Input() changing: Subject<boolean> = new Subject();

    @Input() currentUrl = '';

    @Input() set fieldsSecurity(fieldsSecurity: FieldsSecurity) {
        if (fieldsSecurity) {
            this._fieldsSecurity = fieldsSecurity;
            this._whiteList = fieldsSecurity.fields;
        }

        this.inCreation$.pipe(filter((inCreation) => inCreation !== undefined)).subscribe((inCreation) => {
            if (!inCreation) this.updateColumns();
        });
    }

    get fieldsSecurity() {
        return this._fieldsSecurity;
    }

    @Input() noPlaceholders = true;

    @Input() set tests(tests: Array<TestRow>) {
        this.testRows = tests;
        this.dataSource.data = this.setData(tests);
        this.sportEmpty();
        this.changeDetectorRefs.detectChanges();
        if (this._table) this._table.render();
    }

    dtps$: Observable<Array<ListItem>> = this.store.select(fromAutoCompletesStore.getAutoCompletesDtps);

    inCreation$: Observable<boolean> = this.store.pipe(
        select(fromStore.getMode),
        map((mode) => mode === TestingOrderMode.Create)
    );

    isAthleteDemographicWriter$: Observable<boolean> = this.store.pipe(
        select(fromRootStore.getHasRole(UserRolesEnum.ATH_DEMOGRAPHIC_WRITER))
    );

    missionOrderId$: Observable<number | null> = this.store.select(fromStore.getTOId);

    realOrganization$ = this.store.pipe(select(fromRootStore.getOrganization));

    sourceOrganization$ = this.store.pipe(select(fromRootStore.getSourceOrganization));

    sportsDisciplines$: Observable<Array<SportDiscipline>> = this.store.pipe(
        select(fromAutoCompletesStore.getAutoCompletesSportDisciplines)
    );

    toEndDate$: Observable<string> = this.store.select(fromStore.getTOEndDate);

    toStartDate$: Observable<string> = this.store.select(fromStore.getTOStartDate);

    translations$ = this.translationService.translations$;

    _fieldsSecurity = new FieldsSecurity();

    _table: DataTableComponent<TestRow> | null = null;

    _whiteList: Map<string, string> = new Map<string, string>();

    agePipe = new CalculateAgePipe();

    areAthleteSportsEmpty = false;

    arePlaceholderSportsEmpty = false;

    athleteIds = '';

    dataSource = new DataSource(Array<TestRow>());

    isStepValid = true;

    removeParenthesis = new RemoveParenthesisPipe();

    selectedRowCount = 0;

    subscriptions: Subscription = new Subscription();

    testRowIdsSelected?: Array<string>;

    testRows: Array<TestRow> = [];

    total = 0;

    columns: Array<Partial<ColumnDef<TestRow>>> = [
        {
            key: TestRowColumnNames.ATHLETE_ID,
            headerTemplate: this.athleteIdHeader,
            cell: (e) => e.athlete?.adamsId,
        },
        {
            key: TestRowColumnNames.NAME,
            cell: (e) => e.name,
            mandatory: true,
            wrapContain: true,
            headerTemplate: this.athleteHeader,
        },
        {
            key: TestRowColumnNames.DATE_OF_BIRTH,
            headerTemplate: this.dateOfBirthHeader,
            cell: (e) => formatDisplayDate(e.dateOfBirth),
        },
        {
            key: TestRowColumnNames.ANALYSES,
            headerTemplate: this.analysesHeader,
            wrapContain: true,
            cell: (e) => e.analysisDisplay || [],
            total: () => this.countSamples(this.testRows),
            cellTemplate: this.analyses,
            footerTemplate: this.totalSamples,
            mandatory: true,
        },
        {
            key: TestRowColumnNames.SPORT_DISCIPLINE,
            headerTemplate: this.sportDisciplineHeader,
            cell: (e) => e.sportDiscipline || '',
            mandatory: true,
        },
        {
            key: TestRowColumnNames.ATHLETE_LEVEL,
            headerTemplate: this.athleteLevelHeader,
            cell: (e) => e.athleteLevel,
            mandatory: true,
        },
        {
            key: TestRowColumnNames.SPORT_NATIONALITY,
            headerTemplate: this.sportNationalityHeader,
            cell: (e) => this.removeParenthesis.transform(e.sportNationality),
        },
        {
            key: TestRowColumnNames.LABORATORIES,
            headerTemplate: this.laboratoryHeader,
            cell: (e) => e.laboratories,
            default: false,
            cellTemplate: this.laboratories,
        },
        {
            key: TestRowColumnNames.SEX,
            headerTemplate: this.genderHeader,
            cell: (e) => e.gender,
            cellTemplate: this.gender,
        },
        {
            key: TestRowColumnNames.AGE,
            headerTemplate: this.ageHeader,
            cell: (e) => (e.dateOfBirth !== null ? this.agePipe.transform(e.dateOfBirth) : ''),
        },
        {
            key: TestRowColumnNames.DISABILITIES,
            headerTemplate: this.disabilitiesHeader,
            cell: (e) => e.disabilities || '',
            default: false,
        },
        {
            key: TestRowColumnNames.TEAM,
            headerTemplate: this.teamHeader,
            cell: (e) => e.team,
            default: false,
        },
        {
            key: TestRowColumnNames.PLACEHOLDER,
            cell: (e) => e.placeholder,
            default: false,
            disabled: true,
        },
    ];

    constructor(
        private translationService: TranslationService,
        private store: Store<fromRootStore.IState>,
        private tableTranslationService: TableTranslationService,
        private changeDetectorRefs: ChangeDetectorRef,
        private router: Router
    ) {}

    canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
        this.submitDataSource();
        return of(true);
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    ngOnInit(): void {
        this.subscriptions.add(
            this.store
                .select(fromStore.getSubmitCurrentStep)
                .pipe(distinctUntilChanged(), filter(Boolean))
                .subscribe(() => this.submitDataSource())
        );

        this.subscriptions.add(
            this.store.select(fromStore.getIsCurrentStepValid).subscribe((valid: boolean) => {
                this.isStepValid = valid;
            })
        );

        this.changing.subscribe(() => {
            const testRowsModified = this.dataSource.data.map((testRow: TestRow) => {
                const countryWithRegions = this.getCountryWithRegions(testRow.sportNationality);
                return mapTestRowToTest(testRow, countryWithRegions);
            });
            this.store.dispatch(fromStore.Step2RemoveTestsWithoutSport({ tests: testRowsModified }));
            this.submitDataSource();
        });
    }

    addAnalysesToAthlete(): void {
        if (this.selectedRowCount !== 0) {
            const navigationExtras: NavigationExtras = {
                state: this.testRowIdsSelected,
            };
            this.openAddOrEditAnalyses(navigationExtras);
        }
    }

    canViewField(fieldName: string): boolean {
        return this._whiteList.has(fieldName);
    }

    checkPlaceholders(tests: Array<TestRow>): any {
        this.noPlaceholders = true;
        tests.forEach((test) => {
            if (test.isPlaceholder && test.athleteId === '') {
                this.noPlaceholders = false;
            }
        });
    }

    cleanDataTableSelection(): void {
        setTimeout(() => this._table && this._table.selection.clear());
        this.testRowIdsSelected = [];
    }

    countSamples(tests: Array<TestRow>): number {
        return (tests || []).reduce((count: number, current: TestRow) => {
            return count + current.analyses.length;
        }, 0);
    }

    deleteRow($event: TestRow): void {
        this.submitStep();
        this.store.dispatch(fromStore.Step2DeleteTest({ id: $event.id, tempId: $event.tempId }));
    }

    editAnalyses(selectedTempId: string): void {
        const tempIdArray: Array<string> = [];
        tempIdArray.push(selectedTempId);
        const navigationExtras: NavigationExtras = {
            state: tempIdArray,
            queryParams: { isEditAnalyses: true },
        };
        this.openAddOrEditAnalyses(navigationExtras);
    }

    /**
     * Get a country with its region from the store
     * @param countryName - the name of the country
     * @returns a country with its regions
     */
    getCountryWithRegions(countryName: string): CountryWithRegions {
        let countryWithRegions = new CountryWithRegions();
        const countryWithRegions$ = this.store.select(
            fromAutoCompletesStore.getCountryWithRegionsByCountry(countryName)
        );
        this.subscriptions.add(
            countryWithRegions$.subscribe((country: CountryWithRegions | undefined) => {
                countryWithRegions = country || countryWithRegions;
            })
        );
        return countryWithRegions;
    }

    getHeaderTranslation(header: string): string {
        let headerTranslation = '';
        this.subscriptions.add(
            this.tableTranslationService.translateHeader(header).subscribe((value: string) => {
                headerTranslation = value;
            })
        );
        return headerTranslation;
    }

    isDTPWithNoSelectedThirdPartyContract(
        dtps: Array<ListItem>,
        realOrganization: IOrganization,
        sourceOrganization: IOrganization
    ): boolean {
        const isDTP = dtps.find((d) => d.id === realOrganization.id);
        if (isDTP) {
            return realOrganization?.id.toString() === sourceOrganization?.id.toString();
        }

        return false;
    }

    openAddFromGroup(): void {
        this.submitStep();
        // delay the opening of the search athlete modal until the complete closing of the menu
        setTimeout(() => {
            if (!isNullOrBlank(this.currentUrl)) {
                this.router.navigate([
                    this.currentUrl,
                    { outlets: { modal: ['add-athlete', 'add-athlete-from-group'] } },
                ]);
            }
        }, 100);
    }

    openAddOrEditAnalyses(navigationExtras: NavigationExtras): void {
        this.submitDataSource();
        if (!isNullOrBlank(this.currentUrl)) {
            this.router.navigate(
                [
                    this.currentUrl,
                    {
                        outlets: {
                            modal: ['add-athlete', 'add-analyses-athlete'],
                        },
                    },
                ],
                navigationExtras
            );
            this.cleanDataTableSelection();
        }
    }

    openAddPlaceholder(): void {
        this.submitStep();
        if (!isNullOrBlank(this.currentUrl)) {
            // delay the opening of the add placeholder modal until the complete closing of the menu
            setTimeout(() => {
                if (!isNullOrBlank(this.currentUrl)) {
                    this.router.navigate([
                        this.currentUrl,
                        {
                            outlets: {
                                modal: ['add-athlete', 'add-placeholder'],
                            },
                        },
                    ]);
                }
            }, 100);
        }
    }

    openSearchAthlete(): void {
        this.submitStep();
        // delay the opening of the search athlete modal until the complete closing of the menu
        setTimeout(() => {
            if (!isNullOrBlank(this.currentUrl)) {
                this.router.navigate([this.currentUrl, { outlets: { modal: ['add-athlete', 'search-athlete'] } }]);
            }
        }, 100);
    }

    removeColumn(columnKey: string): void {
        const index = this.columns.findIndex((column) => column.key === columnKey);
        this.columns.splice(index, 1);
    }

    setData(tests: Array<TestRow>): Array<TestRow> {
        TestRow.setRowOrder(tests);
        return tests;
    }

    showErrorModal(): void {
        if (this.errorModalRef && !this.noPlaceholders && this.selectedRowCount !== 0) {
            this.errorModalRef.show();
        }
    }

    sportDisciplineSuggestions = (token: string): Observable<Array<SportDiscipline>> => {
        return getSportDisciplineSuggestions(token, this.sportsDisciplines$);
    };

    sportEmpty(): void {
        this.areAthleteSportsEmpty = false;
        this.arePlaceholderSportsEmpty = false;
        this.dataSource.data.forEach((testRow: TestRow) => {
            if (testRow.sportDiscipline === null || testRow.sportDiscipline === undefined) {
                if (testRow.isPlaceholder && testRow.unlinkedTest) {
                    this.arePlaceholderSportsEmpty = true;
                } else {
                    this.areAthleteSportsEmpty = true;
                }
            }
        });

        this.store.dispatch(fromStore.SetDisableSaving({ disableSaving: this.areAthleteSportsEmpty }));
    }

    submitDataSource(): void {
        if (this.areAthleteSportsEmpty) {
            this.store.dispatch(fromStore.CancelCurrentStepSubmission());
        } else {
            this.submitData.emit(this.dataSource);
        }
    }

    submitStep(): void {
        this.submitData.emit(this.dataSource);
    }

    updateColumns(): void {
        if (!this.canViewField(this.controls.ATHLETE_INFORMATION)) {
            this.removeColumn(TestRowColumnNames.NAME);
            this.removeColumn(TestRowColumnNames.SPORT_NATIONALITY);
            this.removeColumn(TestRowColumnNames.SEX);
            this.removeColumn(TestRowColumnNames.DATE_OF_BIRTH);
            this.removeColumn(TestRowColumnNames.AGE);
            this.removeColumn(TestRowColumnNames.DISABILITIES);
            this.removeColumn(TestRowColumnNames.TEAM);
        }

        if (!this.canViewField(this.controls.TEST_INFORMATION)) {
            this.removeColumn(TestRowColumnNames.ANALYSES);
            this.removeColumn(TestRowColumnNames.SPORT_DISCIPLINE);
            this.removeColumn(TestRowColumnNames.ATHLETE_LEVEL);
            this.removeColumn(TestRowColumnNames.STATUS);
            this.removeColumn(TestRowColumnNames.LABORATORIES);
            this.removeColumn(TestRowColumnNames.TEAM);
            this.removeColumn(TestRowColumnNames.PLACEHOLDER);
        }

        // triggers update for child components
        this.columns = this.columns.slice();
    }

    updateSelections(tests: Array<TestRow>): void {
        this.testRowIdsSelected = tests.map((testRow) => testRow.tempId);
        const athleteIdList: Array<string> = tests.map((test) => test.athleteId);
        this.selectedRowCount = tests.length;
        this.checkPlaceholders(tests);
        if (this.noPlaceholders) {
            this.athleteIds = makeQueryParams(athleteIdList, 'ids');
        }
    }

    private setCellTemplate(columnName: string, template: TemplateRef<any>) {
        (this.columns.find((column) => column.key === columnName) || {}).cellTemplate = template;
        this.columns = this.columns.slice();
    }

    private setFooterTemplate(columnName: string, template: TemplateRef<any>) {
        (this.columns.find((column) => column.key === columnName) || {}).footerTemplate = template;
        this.columns = this.columns.slice();
    }

    private setHeaderTemplate(columnName: string, template: TemplateRef<any>) {
        (this.columns.find((column) => column.key === columnName) || {}).headerTemplate = template;
        this.columns = this.columns.slice();
    }

    get actions() {
        return this._fieldsSecurity?.actions || [];
    }
}
