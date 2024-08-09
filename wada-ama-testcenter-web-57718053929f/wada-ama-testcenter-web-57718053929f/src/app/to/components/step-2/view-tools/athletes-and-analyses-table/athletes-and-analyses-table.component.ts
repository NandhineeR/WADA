import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import { NavigationEnd, NavigationExtras, Router } from '@angular/router';
import { TranslationService } from '@core/services';
import { environment } from '@env';
import { DataTableComponent } from '@shared/components';
import {
    Analysis,
    BLOOD_PASSPORT_SPECIFIC_CODE,
    ColumnDef,
    DataSource,
    SampleTypeEnum,
    SpecificCode,
    TOActionRight,
    TOFormControls,
} from '@shared/models';
import { CalculateAgePipe, RemoveParenthesisPipe } from '@shared/pipes';
import { TableTranslationService } from '@shared/services';
import { formatDisplayDate, isNullOrBlank, makeQueryParams, removeLastSlash } from '@shared/utils';
import { CreateMultipleDCFModalComponent } from '@to/components/step-2/view-tools/create-multiple-dcf-modal/create-multiple-dcf-modal.component';
import { testRowsToTestStatusUpdates } from '@to/mappers';
import {
    TestStatusUpdate,
    LabResultStatus,
    TestsMover,
    Test,
    TestRow,
    TestStatuses,
    TestingOrder,
    Warning,
    AnalysisResult,
    AnalysisDisplay,
} from '@to/models';
import { cloneDeep } from 'lodash-es';
import { Observable, Subject, Subscription, of } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { TestRowColumnNames } from '@to/models/enums/column-definitions/test-row-column-names.enum';
import { CloseTestModalComponent } from '@to/components/step-2/view-tools/close-test-modal/close-test-modal.component';
import { AnalysisSample } from '@sampleManagement/models';
import { Store } from '@ngrx/store';
import * as fromSampleMangementStore from '@sampleManagement/store';
import * as fromRootStore from '@core/store';
import { CancelTestModalComponent } from '../cancel-test-modal/cancel-test-modal.component';
import { CloseAnalysisModalComponent } from '../close-analysis-modal/close-analysis-modal.component';
import { MoveAthleteModalComponent } from '../move-athlete-modal/move-athlete-modal.component';

@Component({
    selector: 'app-athletes-and-analyses-table',
    templateUrl: './athletes-and-analyses-table.component.html',
    styleUrls: ['./athletes-and-analyses-table.component.scss'],
})
export class AthletesAndAnalysesTable implements OnInit, OnChanges, OnDestroy {
    readonly actionRight = TOActionRight;

    readonly adamsUrl = removeLastSlash(environment.adamsUrl);

    readonly bloodPassportSpecificCode = BLOOD_PASSPORT_SPECIFIC_CODE;

    readonly controls = TOFormControls;

    readonly labResultStatusEnum = LabResultStatus;

    readonly sampleManagementLink = environment.sampleManagementLink;

    readonly sampleTypeEnum = SampleTypeEnum;

    readonly specificCodeStatus = SpecificCode;

    @ViewChild('cancelTestModalRef', { static: true })
    cancelTestModalRef?: CancelTestModalComponent;

    @ViewChild('closeAnalysisModalRef', { static: true })
    closeAnalysisModalRef?: CloseAnalysisModalComponent;

    @ViewChild('closeTestModalRef', { static: true })
    closeTestModalRef?: CloseTestModalComponent;

    @ViewChild('createMultipleDCFModalRef', { static: true })
    createMultipleDCFModalRef?: CreateMultipleDCFModalComponent;

    @ViewChild('moveToAnotherTOModalRef', { static: true })
    moveToAnotherTOModalRef?: MoveAthleteModalComponent;

    @ViewChild('analyses', { static: true }) set analyses(template: TemplateRef<any>) {
        this.setCellTemplate(TestRowColumnNames.ANALYSES, template);
    }

    @ViewChild('athleteLevel', { static: true }) set athleteLevel(template: TemplateRef<any>) {
        this.setCellTemplate(TestRowColumnNames.ATHLETE_LEVEL, template);
    }

    @ViewChild('gender', { static: true }) set gender(template: TemplateRef<any>) {
        this.setCellTemplate(TestRowColumnNames.SEX, template);
    }

    @ViewChild('laboratories', { static: true }) set laboratories(template: TemplateRef<any>) {
        this.setCellTemplate(TestRowColumnNames.LABORATORIES, template);
    }

    @ViewChild('status', { static: true }) set status(template: TemplateRef<any>) {
        this.setCellTemplate(TestRowColumnNames.STATUS, template);
    }

    @ViewChild('table', { static: true }) set table(component: DataTableComponent<TestRow>) {
        this._table = component;
    }

    @ViewChild('totalSamples', { static: true }) set totalSamples(template: TemplateRef<any>) {
        this.setFooterTemplate(TestRowColumnNames.ANALYSES, template);
    }

    @Output() readonly analysisToCloseEmitter: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    readonly cleanCancelledTests: EventEmitter<boolean> = new EventEmitter<boolean>();

    @Output()
    readonly cleanClosedAnalysis: EventEmitter<boolean> = new EventEmitter<boolean>();

    @Output()
    readonly cleanClosedTests: EventEmitter<boolean> = new EventEmitter<boolean>();

    @Output()
    readonly moveToTOEmitter: EventEmitter<TestsMover> = new EventEmitter<TestsMover>();

    @Output() readonly submitData: EventEmitter<any> = new EventEmitter<any>();

    @Output() readonly testsToCancelEmitter: EventEmitter<Array<TestStatusUpdate>> = new EventEmitter<
        Array<TestStatusUpdate>
    >();

    @Output() readonly testsToCloseEmitter: EventEmitter<Array<TestStatusUpdate>> = new EventEmitter<
        Array<TestStatusUpdate>
    >();

    @Input() actions: Array<string> = [];

    @Input() cancelledTests: Array<Test> = [];

    @Input() changing: Subject<boolean> = new Subject();

    @Input() clearTableWarnings = false;

    @Input() closedAnalysis: Analysis | undefined;

    @Input() closedTests: Array<Test> = [];

    @Input() currentUrl = '';

    @Input() isBplrReaderOrWriter = false;

    @Input() isLrReaderOrWriter = false;

    @Input() missionOrderId = null;

    @Input() statusUpdateError = false;

    @Input() testStatuses: TestStatuses | null = null;

    @Input() testingOrder: TestingOrder | null = null;

    @Input() set tests(tests: Array<TestRow>) {
        this.testRows = tests;
        this.closedSampleTestRows = this.testRows.filter(
            (testRow) => testRow.status?.specificCode === SpecificCode.Closed
        );
        this.dataSource.data = this.setData(tests);
        this.changeDetectorRefs.detectChanges();
        if (this._table) {
            this._table.dataSource = this.dataSource;
            this._table.render();
        }
    }

    @Input() toEndDate = Date;

    @Input() toStartDate = Date;

    @Input() set whiteList(whiteList: Map<string, string>) {
        this._whiteList = whiteList;
        this.updateColumns();
    }

    translations$ = this.translationService.translations$;

    _table: DataTableComponent<TestRow> | null = null;

    _whiteList: Map<string, string> = new Map<string, string>();

    agePipe = new CalculateAgePipe();

    allSelectedSamplesAreClosed = false;

    athleteIds = '';

    cancelledTestsWarning = new Warning();

    closedAnalysisWarning = new Warning();

    closedSampleTestRows: Array<TestRow> = [];

    closedTestsWarning = new Warning();

    dataSource = new DataSource(Array<TestRow>());

    removeParenthesis = new RemoveParenthesisPipe();

    selectedRowCount = 0;

    selectedTestRows: Array<TestRow> = [];

    shouldReuseRoute = true;

    subscriptions: Subscription = new Subscription();

    testIds = '';

    testInWarnings: Array<TestRow> = [];

    testRows: Array<TestRow> = [];

    testsToMove: TestsMover = new TestsMover();

    total = 0;

    warningForAllTest = false;

    /**
     * Ordered by the UI showcases columns
     * Should be positioned following the initialization of the 'subscriptions' variable
     */
    columns: Array<Partial<ColumnDef<TestRow>>> = [
        {
            key: TestRowColumnNames.ATHLETE_ID,
            header: this.getHeaderTranslation('athleteId'),
            cell: (e) => e.athlete?.adamsId,
        },
        {
            key: TestRowColumnNames.NAME,
            header: this.getHeaderTranslation('name'),
            cell: (e) => e.name,
            mandatory: true,
            wrapContain: true,
        },
        {
            key: TestRowColumnNames.DATE_OF_BIRTH,
            header: this.getHeaderTranslation('dateOfBirth'),
            cell: (e) => formatDisplayDate(e.dateOfBirth),
        },
        {
            key: TestRowColumnNames.ANALYSES,
            header: this.getHeaderTranslation('analyses'),
            cell: (e) => e.analysisDisplay || [],
            total: () => this.countSamples(this.testRows),
            cellTemplate: this.analyses,
            footerTemplate: this.totalSamples,
            default: true,
            wrapContain: true,
        },
        {
            key: TestRowColumnNames.RESULTS,
            header: this.getHeaderTranslation('results'),
            cell: (e) => e.analysisResults,
            default: true,
        },
        {
            key: TestRowColumnNames.LABORATORIES,
            header: this.getHeaderTranslation('laboratories'),
            cell: (e) => e.laboratories,
            default: true,
            cellTemplate: this.laboratories,
        },
        {
            key: TestRowColumnNames.SPORT_NATIONALITY,
            header: this.getHeaderTranslation('sportNationality'),
            cell: (e) => this.removeParenthesis.transform(e.sportNationality),
        },
        {
            key: TestRowColumnNames.SPORT_DISCIPLINE,
            header: this.getHeaderTranslation('sportDiscipline'),
            cell: (e) => e.sportDiscipline?.displayDescriptionName || '',
            mandatory: true,
        },
        {
            key: TestRowColumnNames.SEX,
            header: this.getHeaderTranslation('sex'),
            cell: (e) => e.gender,
            cellTemplate: this.gender,
            default: true,
        },
        {
            key: TestRowColumnNames.AGE,
            header: this.getHeaderTranslation('age'),
            cell: (e) => (e.dateOfBirth !== null ? this.agePipe.transform(e.dateOfBirth) : ''),
            default: true,
        },
        {
            key: TestRowColumnNames.ATHLETE_LEVEL,
            header: this.getHeaderTranslation('athleteLevel'),
            cell: (e) => e.athleteLevel,
            default: true,
        },
        {
            key: TestRowColumnNames.STATUS,
            header: this.getHeaderTranslation('status'),
            cell: (e) => e.status,
            default: true,
            wrapContain: true,
        },
        {
            key: TestRowColumnNames.DISABILITIES,
            header: this.getHeaderTranslation('disabilities'),
            cell: (e) => e.disabilities || '',
            default: false,
        },
        {
            key: TestRowColumnNames.TEAM,
            header: this.getHeaderTranslation('team'),
            cell: (e) => e.team?.name || '',
            default: false,
        },
        {
            key: TestRowColumnNames.PLACEHOLDER,
            cell: (e) => e.placeholder,
            default: false,
            disabled: true,
        },
    ];

    private testingOrderId = '';

    constructor(
        private changeDetectorRefs: ChangeDetectorRef,
        private router: Router,
        private store: Store<fromRootStore.IState>,
        private tableTranslationService: TableTranslationService,
        private translationService: TranslationService,
        iconRegistry: MatIconRegistry,
        sanitizer: DomSanitizer
    ) {
        iconRegistry.addSvgIcon('open_in_new', sanitizer.bypassSecurityTrustResourceUrl('assets/open_in_new.svg'));
    }

    ngOnInit(): void {
        this.subscriptions.add(
            this.store.select(fromRootStore.getActiveRoute).subscribe((state: fromRootStore.RouterStateUrl) => {
                this.testingOrderId = state.params.id || '';
            })
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ngOnChanges(_changes: SimpleChanges): void {
        if (this.clearTableWarnings) {
            this.closedTestsWarning = new Warning();
        }
        if (this.selectedRowCount !== 0) {
            this.clearSelectedRowCount();
        }
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    areSelectedTestsUnlinked(): boolean {
        return this.selectedTestRows.filter((testRow) => testRow.unlinkedTest).length > 0;
    }

    buildTestList(): void {
        this.testInWarnings = [];
        if (this.selectedTestRows) {
            this.selectedTestRows.forEach((testRow: TestRow) => {
                if (
                    isNullOrBlank(testRow.athleteLevel) ||
                    testRow.dcfStatus?.specificCode === SpecificCode.NotProcessed ||
                    testRow.dcfStatus?.specificCode === SpecificCode.Complete ||
                    testRow.analyses.length === 0 ||
                    testRow.status?.specificCode === SpecificCode.Closed
                ) {
                    this.testInWarnings.push(testRow);
                }
            });
            this.warningForAllTest = this.testInWarnings.length === this.selectedTestRows.length;
        }
    }

    buildTestListWithoutWarning(testIds: string, warnings: Array<TestRow>): string {
        const ids = testIds.split(',');
        const idWithoutWarnings = new Array<string>();

        ids.forEach((id: string) => {
            const warning = warnings.find((test: TestRow) => {
                if (test.id) {
                    return test.id.toString() === id;
                }
                return true;
            });
            if (!warning) {
                idWithoutWarnings.push(id);
            }
        });
        return idWithoutWarnings.toString();
    }

    cancelTests(testsToCancel: Array<TestStatusUpdate>): void {
        this.testsToCancelEmitter.emit(testsToCancel);
    }

    canViewField(fieldName: string): boolean {
        return this._whiteList ? this._whiteList.has(fieldName) : true;
    }

    canViewLabResults(): boolean {
        return (
            this.canViewField(this.controls.TEST_ANALYSIS_RESULTS) &&
            this.actions?.includes(this.actionRight.ViewLabResults)
        );
    }

    cleanDataTableSelection(): void {
        if (this._table) {
            this._table.selection.clear();
            this.selectedTestRows = [];
        }
    }

    clearSelectedRowCount(): void {
        if (this._table) {
            this._table.selection.clear();
            this.updateSelections(this._table.selection.selected);
        }
    }

    closeAnalysis(analysis: AnalysisDisplay): void {
        this.analysisToCloseEmitter.emit(cloneDeep(analysis));
    }

    closeTests(testsToClose: Array<TestStatusUpdate>): void {
        this.testsToCloseEmitter.emit(testsToClose);
    }

    countSamples(tests: Array<TestRow>): number {
        return (tests || []).reduce((count: number, current: TestRow) => {
            return count + current.analyses.length;
        }, 0);
    }

    createMultipleDCF($event: boolean): void {
        if ($event) {
            const navigationExtras: NavigationExtras = {
                queryParams: {
                    id: this.buildTestListWithoutWarning(this.testIds, this.testInWarnings),
                },
            };
            this.router.navigate(['/dcf/multiple/new'], navigationExtras);
        }
    }

    createUA(): void {
        const navigationExtras: NavigationExtras = {
            queryParams: { id: this.testIds },
        };
        this.router.navigate(['/to/ua/new'], navigationExtras);
    }

    displayCancelledTestsWarning(warning: Warning): void {
        if (JSON.stringify(warning) !== JSON.stringify(this.cancelledTestsWarning)) {
            this.cancelledTestsWarning = warning;
            this.changeDetectorRefs.detectChanges();
        }
    }

    displayClosedAnalysisWarning(warning: Warning): void {
        if (JSON.stringify(warning) !== JSON.stringify(this.closedAnalysisWarning)) {
            this.closedAnalysisWarning = warning;
            this.changeDetectorRefs.detectChanges();
        }
    }

    displayClosedTestsWarning(warning: Warning): void {
        if (JSON.stringify(warning) !== JSON.stringify(this.closedTestsWarning)) {
            this.closedTestsWarning = warning;
            this.changeDetectorRefs.detectChanges();
        }
    }

    getAnalysisSample(analysis: any): Observable<AnalysisSample | null> {
        if (isNullOrBlank(analysis?.label)) return of(null);
        return this.store.select(fromSampleMangementStore.getSelectedAnalysisSample(analysis?.label));
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

    isCompletedStatus(specificCode: string): boolean {
        return specificCode.toLocaleLowerCase().includes(SpecificCode.Complete.toLocaleLowerCase());
    }

    isDraftStatus(specificCode: string): boolean {
        return specificCode.toLocaleLowerCase().includes(SpecificCode.NotProcessed.toLocaleLowerCase());
    }

    isLabResultAccessible(analysis: AnalysisResult): boolean {
        return (
            (analysis.sampleType !== this.bloodPassportSpecificCode && this.isLrReaderOrWriter) ||
            (analysis.sampleType === this.bloodPassportSpecificCode && this.isBplrReaderOrWriter)
        );
    }

    moveToTestingOrder(testsToMove: TestsMover): void {
        this.moveToTOEmitter.emit(testsToMove);
    }

    /**
     * Reloads page on bind modal deactivated
     */
    onDeactivateBindAthleteModal(): void {
        this.subscriptions.add(
            this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
                // Trick the Router into believing it's last link wasn't previously loaded
                this.router.navigated = false;
                window.location.reload();
            })
        );
    }

    /**
     * Opens modal -> Bind Athlete to Test
     * @param testId selected test to be linked to searched athlete
     */
    openBindToAthleteModal(testId: string): void {
        const navigationExtras: NavigationExtras = {
            state: { testId },
            queryParams: { isBindAthlete: true },
        };
        this.router.navigate(
            [this.currentUrl, { outlets: { modal: ['add-athlete', 'search-athlete'] } }],
            navigationExtras
        );
    }

    openTestingOrderInSampleManagement(): void {
        if (!isNullOrBlank(this.testingOrderId)) {
            window.open(`${this.sampleManagementLink}/testingOrders/${this.testingOrderId}`);
        }
    }

    removeColumn(columnKey: string): void {
        const index = this.columns.findIndex((column) => column.key === columnKey);
        this.columns.splice(index, 1);
    }

    retrieveAnalysisSamples(): void {
        this.store.dispatch(fromSampleMangementStore.GetAnalysisSamples());
    }

    setData(tests: Array<TestRow>): Array<TestRow> {
        TestRow.setRowOrder(tests);
        tests.forEach((test: TestRow) => {
            test.canBeSelected = !test.isCancelled() && !test.isClosed();
        });
        return tests;
    }

    showCancelTestsModal(): void {
        if (this.cancelTestModalRef) {
            this.cleanCancelledTests.emit(true);
            const selectedTestRows: Array<TestRow> = cloneDeep(this.selectedTestRows);
            this.cancelTestModalRef.show(selectedTestRows);
            this.cleanDataTableSelection();
        }
    }

    showCloseAnalysisModal(analysis: AnalysisDisplay | undefined): void {
        if (this.closeAnalysisModalRef) {
            this.cleanClosedAnalysis.emit(true);
            this.closeAnalysisModalRef.show(cloneDeep(analysis));
            this.cleanDataTableSelection();
        }
    }

    showCloseTestsModal(selectedTest: TestRow | null, returnToForm: boolean): void {
        if (this.closeTestModalRef) {
            this.cleanClosedTests.emit(true);
            let selectedTestRows: Array<TestRow> = cloneDeep(this.selectedTestRows);
            if (selectedTest) {
                selectedTestRows = [];
                selectedTestRows.push(selectedTest);
            }
            this.closeTestModalRef.show(testRowsToTestStatusUpdates(selectedTestRows), returnToForm);
            this.cleanDataTableSelection();
        }
    }

    showCreateMultipleDCFModal(): void {
        this.buildTestList();
        if (this.createMultipleDCFModalRef) {
            this.createMultipleDCFModalRef.show();
        }
    }

    showMoveToAnotherTOModal(): void {
        if (this.moveToAnotherTOModalRef) {
            this.moveToAnotherTOModalRef.show(this.selectedTestRows);
        }
    }

    updateColumns(): void {
        if (!this.canViewField(this.controls.ATHLETE_INFORMATION)) {
            this.removeColumn(TestRowColumnNames.NAME);
            this.removeColumn(TestRowColumnNames.SPORT_NATIONALITY);
            this.removeColumn(TestRowColumnNames.SEX);
            this.removeColumn(TestRowColumnNames.DATE_OF_BIRTH);
            this.removeColumn(TestRowColumnNames.AGE);
            this.removeColumn(TestRowColumnNames.ATHLETE_LEVEL);
            this.removeColumn(TestRowColumnNames.DISABILITIES);
            this.removeColumn(TestRowColumnNames.TEAM);
        }

        if (!this.canViewField(this.controls.TEST_INFORMATION)) {
            this.removeColumn(TestRowColumnNames.ANALYSES);
            this.removeColumn(TestRowColumnNames.SPORT_DISCIPLINE);
            this.removeColumn(TestRowColumnNames.STATUS);
            this.removeColumn(TestRowColumnNames.LABORATORIES);
            this.removeColumn(TestRowColumnNames.PLACEHOLDER);
        }

        if (!this.canViewLabResults()) {
            this.removeColumn(TestRowColumnNames.RESULTS);
        }

        // triggers update for child components
        this.columns = this.columns.slice();
    }

    updateClosedSelectedSamples(): void {
        const ids = this.testIds.split(',');
        this.allSelectedSamplesAreClosed = ids.every((id) =>
            this.closedSampleTestRows.find((testRow) => testRow.id?.toString() === id)
        );
    }

    updateSelections(tests: Array<TestRow>): void {
        const athleteIdList: Array<string> = tests.map((test) => test.athleteId);
        if (tests) {
            tests.sort((currentTest: TestRow, nextTest: TestRow): number => {
                if (currentTest.order && nextTest.order) {
                    if (currentTest.order < nextTest.order) return -1;
                    if (currentTest.order > nextTest.order) return 1;
                }
                return 0;
            });
        }
        const testIds: Array<string> = tests
            .map((test: TestRow) => test.id?.toString() || '')
            .filter((value: string) => value !== '');
        this.selectedRowCount = tests.length;
        this.athleteIds = makeQueryParams(athleteIdList, 'ids');
        this.testIds = testIds.toString();
        this.selectedTestRows = tests;

        this.updateClosedSelectedSamples();
    }

    viewLabAnalysisRequestForm(estimationType: number, analyses: Array<Analysis>, isLabReport: boolean): void {
        const toId = this.testingOrder?.id;

        if (analyses.length === 0) {
            return;
        }

        const laboratoryId = analyses[0].laboratory?.id || '';
        const sampleTypeIds = analyses.map((analysis) => analysis.sampleType.id).join('|');
        const analysisIds = analyses.map((analysis) => analysis.id).join('|');

        const classicUrl = `${
            this.adamsUrl
        }/requestTemplateConfiguration.do?action=generateOOPDF&entityType=MissionOrder&entityId=${toId}${
            isLabReport
                ? `&laboratoryId=${laboratoryId}&sampleTypeId=${sampleTypeIds}&analysisId=${analysisIds}&labReport=true&templateIdPDF=MOAnalysis&includePhotos=false&frameset=none&fromNG=true`
                : `&otherInfos=${laboratoryId}|${sampleTypeIds}|${analysisIds}|${estimationType}&templateIdPDF=MOAnalysis&includePhotos=false&frameset=none&fromNG=true`
        }`;

        window.open(classicUrl);
    }

    viewLabAnalysisRequestFormByAnalysis(analysisId: string) {
        const analyses: Analysis[] = this.testRows
            .map((testRow: TestRow) => testRow.analyses)
            .reduce((acc, cur) => [...acc, ...cur], []);
        const selectedAnalysis = analyses.filter((analysis) => analysis.id.toString() === analysisId);

        if (selectedAnalysis) {
            this.viewLabAnalysisRequestForm(0, selectedAnalysis, false);
        }
    }

    viewLabAnalysisRequestFormByLab(lab: string): void {
        const analysesFromSelectedLab: Array<Analysis> = this.testRows
            .reduce((acc: Analysis[], testRow: TestRow) => acc.concat(testRow.analyses), [])
            .filter((analysis) => analysis.laboratory?.name === lab);

        if (analysesFromSelectedLab.length > 0) {
            this.viewLabAnalysisRequestForm(0, analysesFromSelectedLab, true);
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

    get laboratoriesFromSelectedTests(): Set<string> {
        const labs = (this._table?.dataSource?.filteredData || [])
            .filter((testRow: TestRow) => testRow.analyses?.length > 0 && testRow.laboratories?.size > 0)
            .map((testRow: TestRow) => testRow.laboratories);

        return labs.length > 0
            ? labs.reduce((accumulator: Set<string>, current: Set<string>) => {
                  current.forEach((laboratory) => accumulator.add(laboratory));
                  return accumulator;
              })
            : new Set();
    }
}
