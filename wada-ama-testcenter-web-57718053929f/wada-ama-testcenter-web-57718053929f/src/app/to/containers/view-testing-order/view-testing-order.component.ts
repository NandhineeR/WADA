import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import * as fromStore from '@to/store';
import * as fromRootStore from '@core/store';
import * as fromSampleManagementStore from '@sampleManagement/store';
import {
    AthleteAndAnalysesInformation,
    AuthorizationInformation,
    TestStatusUpdate,
    DopingControlPersonnelInformation,
    IncompatibleTestParticipantDiscipline,
    TestsMover,
    Test,
    TestStatuses,
    TestingOrder,
    AnalysisDisplay,
} from '@to/models';
import {
    Attachment,
    AttachmentType,
    FieldsSecurity,
    ModificationInfo,
    ObjectTargetEnum,
    Reason,
    StatusEnum,
    SpecificCode,
    TOActionRight,
    UserRolesEnum,
    ErrorMessageKeyEnums,
    TestParticipant,
    DataSource,
    GenericActivity,
    ListItem,
    MAX_NUMBER_OF_TESTS_WARNING,
    Analysis,
} from '@shared/models';
import { UnprocessableEntity } from '@core/models';
import {
    SEND_NOTIFICATION_RESULT_TO_COUNT_EXCEEDED,
    TESTINGORDER_TEST_COUNT_EXCEEDED,
} from '@shared/utils/exception-code';
import { TranslationService } from '@core/services';
import { environment } from '@env';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ChangeStatusModalComponent, DeleteModalComponent } from '@shared/components';
import { map } from 'rxjs/operators';
import { removeLastSlash } from '@shared/utils';

type RouterStateUrl = fromRootStore.RouterStateUrl;

@Component({
    selector: 'app-testing-order',
    templateUrl: './view-testing-order.component.html',
    styleUrls: ['./view-testing-order.component.scss'],
})
export class ViewTestingOrderComponent implements OnInit, OnDestroy {
    readonly SEND_NOTIFICATION_RESULT_TO_COUNT_EXCEEDED = SEND_NOTIFICATION_RESULT_TO_COUNT_EXCEEDED;

    readonly TEST_SUB_STATUS = 'SUBSTATUS';

    readonly TEST_STATUS = 'STATUS';

    readonly TESTINGORDER_TEST_COUNT_EXCEEDED = TESTINGORDER_TEST_COUNT_EXCEEDED;

    readonly actionRight = TOActionRight;

    readonly adamsUrl = removeLastSlash(environment.adamsUrl);

    readonly attachmentType = AttachmentType;

    readonly objectTargetEnum = ObjectTargetEnum;

    readonly statusEnum = StatusEnum;

    @ViewChild(DeleteModalComponent) deleteTOModalRef?: DeleteModalComponent;

    @Output() readonly moveToTOEmitter = new EventEmitter<TestsMover>();

    @ViewChild(ChangeStatusModalComponent) changeTOStatusModalRef?: ChangeStatusModalComponent;

    @Input() missionOrderId$: Observable<number | null> = this.store.select(fromStore.getTOId);

    @Input() toEndDate$: Observable<string> = this.store.select(fromStore.getTOEndDate);

    @Input() toStartDate$: Observable<string> = this.store.select(fromStore.getTOStartDate);

    activitiesError$: Observable<boolean> = this.store.select(fromStore.getActivitiesError);

    athleteAndAnalyses$: Observable<AthleteAndAnalysesInformation | null> = this.store.select(
        fromStore.getTOAthleteAndAnalyses
    );

    authorization$: Observable<AuthorizationInformation | null> = this.store.select(fromStore.getTOAuthorization);

    behalfOfSCA$: Observable<ListItem | null> = this.store.select(fromStore.getTOBehalfOfSCA);

    cancelledTests$: Observable<Array<Test>> = this.store.select(fromStore.getCancelledTests);

    clearTableWarnings: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    clearTableWarnings$: Observable<boolean> = this.clearTableWarnings.asObservable();

    closedAnalysis$: Observable<Analysis | undefined> = this.store.select(fromStore.getClosedAnalysis);

    closedTests$: Observable<Array<Test>> = this.store.select(fromStore.getClosedTests);

    copiedTestingOrderNumber$: Observable<string | null> = this.store
        .select(fromStore.getTOCopiedTestingOrderNumber)
        .pipe(map((copiedTestingOrderNumber: string | null) => copiedTestingOrderNumber));

    creationInfo$: Observable<ModificationInfo | null> = this.store.select(fromStore.getTOCreationInfo);

    dopingControlPersonnel$: Observable<DopingControlPersonnelInformation | null> = this.store.select(
        fromStore.getTODopingControlPersonnel
    );

    error$ = this.store.select(fromStore.getGlobalError);

    errorMsgKey$: Observable<string | undefined> = this.store.pipe(
        select(fromStore.getErrorMessageKey),
        map((messageKey: string | null) => ErrorMessageKeyEnums.getValue(messageKey))
    );

    fieldsSecurity$: Observable<FieldsSecurity | null> = this.store.select(fromStore.getFieldsSecurity);

    genericActivities$: Observable<Array<GenericActivity>> = this.store.select(fromStore.getGenericActivities);

    hasActiveTests$: Observable<boolean> = this.store.pipe(
        select(fromStore.getTO),
        map((to) => {
            const activeTests = to?.tests.filter(
                (test) =>
                    test.status?.specificCode === SpecificCode.NotProcessed ||
                    test.status?.specificCode === SpecificCode.Pending
            );

            return (activeTests?.length || 0) > 0;
        })
    );

    hasBeenCancelled$: Observable<boolean> = this.store.select(fromStore.getHasBeenCancelled);

    hasBeenCompleted$: Observable<boolean> = this.store.select(fromStore.getHasBeenCompleted);

    hasBeenDeleted$: Observable<boolean> = this.store.select(fromStore.getHasBeenDeleted);

    hasBeenIssued$: Observable<boolean> = this.store.select(fromStore.getHasBeenIssued);

    hasBeenSaved$: Observable<boolean> = this.store.select(fromStore.getHasBeenSaved);

    hasDeleteNotification$ = combineLatest([
        this.store.select(fromStore.getHasDCF),
        this.store.select(fromStore.getHasUA),
        this.store.select(fromStore.getHasClosedStatus),
    ]).pipe(
        map(
            ([testHasDcf, testHasUA, testHasClosedStatus]: [boolean, boolean, boolean]) =>
                testHasDcf || testHasUA || testHasClosedStatus
        )
    );

    incompatibleTestParticipants$: Observable<Array<IncompatibleTestParticipantDiscipline>> = this.store.select(
        fromStore.getIncompatibleTestParticipants
    );

    isBplrReaderOrWriter$: Observable<boolean> = this.store.select(
        fromRootStore.getHasRole(UserRolesEnum.BPLR_WRITER, [UserRolesEnum.BPLR_READER])
    );

    isDraft$: Observable<boolean> = this.store.select(fromStore.getIsDraft);

    isIssued$: Observable<boolean> = this.store.select(fromStore.getIsIssued);

    isLrReaderOrWriter$: Observable<boolean> = this.store.select(
        fromRootStore.getHasRole(UserRolesEnum.LAB_RESULT_WRITER, [UserRolesEnum.LAB_RESULT_READER])
    );

    isMissionOrderActivityReaderOrWriter$: Observable<boolean> = combineLatest([
        this.store.pipe(select(fromRootStore.getHasRole(UserRolesEnum.MISSION_ORDER_ACTIVITY_READER))),
        this.store.pipe(select(fromRootStore.getHasRole(UserRolesEnum.MISSION_ORDER_ACTIVITY_WRITER))),
    ]).pipe(
        map(
            ([hasMissionOrderActivityReader, hasMissionOrderActivityWriter]: [boolean, boolean]) =>
                hasMissionOrderActivityReader || hasMissionOrderActivityWriter
        )
    );

    isMissionOrderActivityWriter$: Observable<boolean> = this.store.pipe(
        select(fromRootStore.getHasRole(UserRolesEnum.MISSION_ORDER_ACTIVITY_WRITER))
    );

    isMissionOrderReader$: Observable<boolean> = this.store.select(
        fromRootStore.getHasRole(undefined, [UserRolesEnum.MISSION_ORDER_WRITER])
    );

    isMissionOrderWriter$: Observable<boolean> = combineLatest([
        this.store.pipe(select(fromRootStore.getHasRole(UserRolesEnum.MISSION_ORDER_WRITER))),
        this.store.pipe(select(fromRootStore.getHasRole(UserRolesEnum.DCO_RIGHT))),
    ]).pipe(map(([hasMissionOrderWriter, hasDCORight]: [boolean, boolean]) => hasMissionOrderWriter || hasDCORight));

    isTODecommissioned$: Observable<boolean> = this.store.select(fromRootStore.isTODecommissioned);

    isUserCorrector$: Observable<boolean> = this.store.select(fromRootStore.getHasRole(UserRolesEnum.CORRECTOR));

    loading$ = this.store.select(fromStore.getGlobalLoading);

    route$: Observable<string> = this.store.select(fromRootStore.getActiveRouteFirstUrlFragment);

    routeState$: Observable<RouterStateUrl> = this.store.select(fromRootStore.getActiveRoute);

    status$: Observable<StatusEnum> = this.store.select(fromStore.getTOStatus);

    statusUpdateError$: Observable<boolean> = this.store.select(fromStore.getStatusUpdateError);

    testHasClosedStatus$: Observable<boolean> = this.store.select(fromStore.getHasClosedStatus);

    testHasDcf$: Observable<boolean> = this.store.select(fromStore.getHasDCF);

    testHasUA$: Observable<boolean> = this.store.select(fromStore.getHasUA);

    testingOrderId$: Observable<number | null> = this.store.select(fromStore.getTOId);

    testParticipants$: Observable<Array<TestParticipant> | null> = this.store.select(fromStore.getTOTestParticipants);

    testStatuses$: Observable<TestStatuses | null> = this.store.select(fromStore.getTestStatuses);

    hasAnalysisInTests = false;

    testsAthleteWithoutSamples$: Observable<Array<string>> = this.store.pipe(
        select(fromStore.getTO),
        map((to) => {
            this.hasAnalysisInTests = to?.tests.some((test) => test.analyses.length > 0);
            return to?.tests
                .filter((test) => test?.athlete?.id && test.analyses.length <= 0)
                .map((test: Test) => test.displayAthleteName);
        })
    );

    testsHaveBeenMoved$: Observable<boolean> = this.store.select(fromStore.getTestsHaveBeenMoved);

    testsWithDCF$: Observable<Array<Test>> = this.store.select(fromStore.getTOTestsWithDCF);

    to$: Observable<TestingOrder | null> = this.store.select(fromStore.getTO);

    toAttachments$: Observable<Array<Attachment>> = this.store.select(fromStore.getAttachments);

    toStatus$: Observable<string | null> = this.store.select(fromStore.getTOStatusDescription);

    translations$ = this.translationService.translations$;

    updateInfo$: Observable<ModificationInfo | null> = this.store.select(fromStore.getTOUpdateInfo);

    unprocessableEntityError$ = this.store.select(fromStore.getUnprocessableEntityError);

    adoCountErrorUnprocessableEntity: UnprocessableEntity | undefined;

    currentStatus: StatusEnum | undefined = undefined;

    dataSource = new DataSource(Array<GenericActivity>());

    dcfArrivalDate: string | null = '';

    dcfFullName: string | null = '';

    dcfHasBeenDeleted = false;

    dcoAttachement: Attachment | undefined = new Attachment();

    isCancelled = false;

    isComplete = false;

    newStatus: StatusEnum | undefined = undefined;

    showAthletesAndAnalysesErrors = false;

    showAuthorizationErrors = false;

    showDcoAttachement = false;

    showDopingControlPersonnelErrors = false;

    testsCount = 0;

    testCountErrorUnprocessableEntity: UnprocessableEntity | undefined;

    testsToMove: TestsMover = new TestsMover();

    toId = '';

    private subscriptions = new Subscription();

    constructor(
        private iconRegistry: MatIconRegistry,
        private sanitizer: DomSanitizer,
        private store: Store<fromRootStore.IState>,
        private translationService: TranslationService,
        public activatedRoute: ActivatedRoute
    ) {
        iconRegistry.addSvgIcon('more_vert', sanitizer.bypassSecurityTrustResourceUrl('assets/more_vert.svg'));
    }

    ngOnInit(): void {
        this.store.dispatch(fromStore.InitViewTestingOrder());
        this.store.dispatch(fromStore.PreloadAutoCompletesView());
        this.store.dispatch(fromStore.PreloadDCFAutoCompletes());
        this.store.dispatch(fromSampleManagementStore.GetAnalysisSamples());

        this.subscriptions.add(
            this.store.select(fromRootStore.getActiveRoute).subscribe((state: fromRootStore.RouterStateUrl) => {
                this.toId = state.params.id || '';
            })
        );

        this.subscriptions.add(
            this.store.select(fromStore.getDcoAttachement).subscribe((dcoAttachement) => {
                this.dcoAttachement = dcoAttachement;
                if (this.showDcoAttachement && this.dcoAttachement) {
                    window.open(this.dcoAttachement.url, '_blank');
                    this.showDcoAttachement = false;
                }
            })
        );

        this.subscriptions.add(
            this.status$.subscribe((status) => {
                if (status) {
                    if (this.currentStatus === undefined) {
                        this.currentStatus = status;
                    }
                    this.isCancelled = status === StatusEnum.Cancelled;
                    this.clearTableWarnings.next(status !== this.currentStatus);
                    this.currentStatus = status;
                }
            })
        );

        this.subscriptions.add(
            this.store.select(fromStore.getTOTestsCount).subscribe((testsCount) => {
                this.testsCount = testsCount;
            })
        );

        this.renderDataSource();

        this.getTestStatuses();
        // adds underscore to not processed status
        const notProcessedStatus = [
            SpecificCode.NotProcessed.slice(0, 3),
            '_',
            SpecificCode.NotProcessed.slice(3),
        ].join('');
        this.getTestingOrders([notProcessedStatus, SpecificCode.Pending]);
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    cancelTests(testsToCancel: Array<TestStatusUpdate>): void {
        this.store.dispatch(fromStore.CancelTests({ testsToCancel }));
    }

    /**
     * Changes status of testing Order to cancelled, given a reason
     */
    cancelTO(reasonDetails: string): void {
        const reason = new Reason({
            objectId: this.toId,
            details: reasonDetails,
        });

        this.store.dispatch(fromStore.CancelTestingOrder({ reason }));
    }

    /**
     * Updates a testing order status given a reason
     */
    changeTOStatus(reason: Reason): void {
        if (this.newStatus === StatusEnum.Completed) {
            this.store.dispatch(fromStore.CompleteTestingOrder({ reason }));
        } else if (this.newStatus === StatusEnum.Issued) {
            this.store.dispatch(fromStore.IssueTestingOrder({ reason }));
        }
    }

    cleanCancelledTests(): void {
        this.store.dispatch(fromStore.CleanCancelledTests());
    }

    cleanClosedAnalysis(): void {
        this.store.dispatch(fromStore.CleanClosedAnalysis());
    }

    cleanClosedTests(): void {
        this.store.dispatch(fromStore.CleanClosedTests());
    }

    closeAnalysis(analysis: AnalysisDisplay): void {
        this.store.dispatch(
            fromStore.CloseAnalysis({ testId: analysis.testId.toString(), analysisId: analysis.id.toString() })
        );
    }

    closeTests(testsToClose: Array<TestStatusUpdate>): void {
        this.store.dispatch(fromStore.CloseTests({ testsToClose }));
    }

    createTestingOrderFromCopy(): void {
        this.store.dispatch(
            fromStore.GoToCreateTestingOrder({
                copiedTestingOrderNumber: this.toId,
            })
        );
    }

    /**
     * Deletes a testing order given a reason
     */
    deleteTestingOrder(reason: string): void {
        this.store.dispatch(fromStore.DeleteTestingOrder({ testingOrderId: this.toId, reason }));
    }

    exceedsMaxTestThreshold(): boolean {
        return this.testsCount > MAX_NUMBER_OF_TESTS_WARNING;
    }

    /**
     * Gets an array of testing orders
     */
    getTestingOrders(statuses: Array<string>): void {
        this.store.dispatch(fromStore.GetCondensedTestingOrders({ statuses }));
    }

    getTestStatuses(): void {
        this.store.dispatch(
            fromStore.Step2GetTestStatuses({
                testType: `${this.TEST_SUB_STATUS},${this.TEST_STATUS}`,
            })
        );
    }

    moveToTestingOrder(testsToMove: TestsMover): void {
        this.testsToMove = testsToMove;
        this.store.dispatch(fromStore.MoveToTestingOrder({ testsToMove }));
    }

    /**
     * Listens to opening of three dot menu
     */
    onClickThreeDotMenu(): void {
        this.store.dispatch(
            fromStore.GetAttachments({
                toId: this.toId,
                types: [AttachmentType.DCO_REPORT],
            })
        );
    }

    /**
     * Opens modal for changing TO status
     */
    openChangeTOStatusModal(newStatus: StatusEnum): void {
        if (this.changeTOStatusModalRef) {
            this.newStatus = newStatus;
            this.changeTOStatusModalRef.onOpen();
        }
    }

    /**
     * Opens modal for deleting TO
     */
    openDeleteTO(): void {
        if (this.isCancelled && this.deleteTOModalRef) {
            this.deleteTOModalRef.onOpen();
        }
    }

    renderDataSource(): void {
        this.genericActivities$.subscribe((genericActivities: Array<GenericActivity>) => {
            this.dataSource.data = genericActivities || [];
        });
    }

    viewAuthorization(): void {
        window.open(
            `${this.adamsUrl}/requestTemplateConfiguration.do?action=generateSamePDFTemplateMultiplePages&entityType=MissionOrder&entityId=${this.toId}&templateIdPDF=MOAuthorization&includePhotos=false`
        );
    }

    viewDcoReport(): void {
        this.showDcoAttachement = true;
        if (this.dcoAttachement && this.dcoAttachement.id) {
            this.store.dispatch(
                fromStore.GetDcoReportAttachment({
                    toId: this.toId,
                    fileKey: this.dcoAttachement.id,
                })
            );
        }
    }

    viewTestingOrder(): void {
        window.open(
            `${this.adamsUrl}/requestTemplateConfiguration.do?action=generateOOPDF&entityType=MissionOrder&entityId=${this.toId}&templateIdPDF=MOForm&includePhotos=false`
        );
    }

    get maxTestCount(): string {
        return (
            (this.testCountErrorUnprocessableEntity &&
                this.testCountErrorUnprocessableEntity.parameters &&
                this.testCountErrorUnprocessableEntity.parameters.get('MAXIMUM')) ||
            ''
        );
    }

    get maxAdoCount(): string {
        return this.adoCountErrorUnprocessableEntity?.parameters?.get('MAXIMUM') || '';
    }
}
