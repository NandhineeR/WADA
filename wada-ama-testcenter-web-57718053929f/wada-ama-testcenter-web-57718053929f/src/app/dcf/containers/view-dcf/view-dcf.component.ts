import {
    SampleTargetFieldEnum,
    ProceduralInformation,
    Sample,
    SampleCorrection,
    SampleInformation,
    UrineSampleBoundaries,
    Urine,
    AthleteInformation,
    AuthorizationInformation,
    NotificationInformation,
    SampleValidityUpdate,
} from '@dcf/models';
import { Sample as SampleManagementSample } from '@sampleManagement/models';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { select, Store } from '@ngrx/store';
import { combineLatest, Observable, of, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import * as fromAutoCompletesStore from '@autocompletes/store';
import * as fromRootStore from '@core/store';
import * as fromStore from '@dcf/store';
import * as fromSMStore from '@sampleManagement/store';
import * as moment from 'moment';
import {
    Attachment,
    AttachmentType,
    DCFActionRight,
    FieldsSecurity,
    ModificationInfo,
    ObjectTargetEnum,
    StatusEnum,
    UserRolesEnum,
    ErrorMessageKeyEnums,
    DataSource,
    GenericActivity,
    Reason,
    TOItem,
    Test,
    UserTypeEnum,
} from '@shared/models';
import { calculate60minTimeSlot } from '@shared/utils/calculate-60-min-timeslot';
import { TranslationService } from '@core/services';
import { isNotNull, isNullOrBlank, removeLastSlash, sampleIsDiluted } from '@shared/utils';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { DeleteModalComponent, ModalFieldComponent } from '@shared/components';
import { SampleInformationErrors } from '@dcf/components/step-2/sample-information/sample-information-errors';
import { DcfBinding } from '@dcf/models/bind-dcf-to-testing-order.model';
import { Moment } from 'moment';
import { TableTranslationService } from '@shared/services/table-translation.service';
import { environment } from '@env';
import { SampleFactory } from '@dcf/utils/base-sample/sample.factory';

@Component({
    selector: 'app-view-dcf',
    templateUrl: './view-dcf.component.html',
    styleUrls: ['./view-dcf.component.scss'],
    providers: [DatePipe],
})
export class ViewDCFComponent implements OnInit, OnDestroy {
    readonly CANCELLED = 'canceled';

    readonly COMPLETED = 'completed';

    readonly DRAFT = 'draft';

    readonly actionRight = DCFActionRight;

    readonly adamsUrl = removeLastSlash(environment.adamsUrl);

    readonly attachmentType = AttachmentType;

    readonly objectTargetEnum = ObjectTargetEnum;

    @ViewChild(DeleteModalComponent, { static: true })
    deleteDcfModalRef?: DeleteModalComponent;

    @ViewChild(ModalFieldComponent) modal?: ModalFieldComponent;

    abpAccess$: Observable<string> = this.store
        .select(fromRootStore.getActiveRoute)
        .pipe(map((state: fromRootStore.RouterStateUrl) => state.queryParams?.abpAccess || ''));

    accessible$: Observable<boolean> = of(false);

    activitiesError$: Observable<boolean> = this.store.select(fromStore.getActivitiesError);

    arrivalDate$: Observable<Moment | undefined> = this.store.select(fromStore.getArrivalDate);

    athlete$: Observable<AthleteInformation> = this.store.select(fromStore.getSourceAthlete);

    athleteId$: Observable<string | null> = this.store.select(fromStore.getAthleteId);

    attachments$: Observable<Array<Attachment>> = this.store.select(fromStore.getAttachments);

    authorization$: Observable<AuthorizationInformation | null> = this.store.select(fromStore.getAuthorization);

    creationInfo$: Observable<ModificationInfo | null> = this.store.select(fromStore.getCreationInfo);

    currentUserType$: Observable<string> = this.store.select(fromRootStore.getUserType);

    dcfAthlete$: Observable<AthleteInformation | null> = this.store.select(fromStore.getAthlete);

    dcfId$: Observable<string> = this.store
        .select(fromRootStore.getActiveRoute)
        .pipe(map((state: fromRootStore.RouterStateUrl) => state.params.id || ''));

    dcfHasBeenDeleted$: Observable<boolean> = this.store.select(fromStore.getHasBeenDeleted);

    dcfNotification$: Observable<NotificationInformation | null> = this.store.select(fromStore.getNotification);

    dcfProceduralInformation$: Observable<ProceduralInformation | null> = this.store.select(
        fromStore.getProceduralInformation
    );

    dcfSampleInformation$: Observable<SampleInformation | null> = this.store.select(fromStore.getSampleInformation);

    error$: Observable<boolean> = this.store.select(fromStore.getSaveError);

    errorMsgKey$: Observable<string | undefined> = this.store.pipe(
        select(fromStore.getErrorMessageKey),
        map((messageKey: string | null) => ErrorMessageKeyEnums.getValue(messageKey))
    );

    fieldsSecurity$: Observable<FieldsSecurity | null> = this.store.select(fromStore.getFieldsSecurity);

    fullName$: Observable<string | undefined> = this.store.select(fromStore.getAthleteFullName);

    genericActivities$: Observable<Array<GenericActivity>> = this.store.select(fromStore.getGenericActivities);

    hasBeenSaved$: Observable<boolean> = this.store.select(fromStore.getHasBeenSaved);

    samples$: Observable<Sample[] | null> = this.store.select(fromStore.getSamples);

    urineSampleBoundaries$: Observable<UrineSampleBoundaries | null> = this.store.pipe(
        select(fromStore.getUrineSampleBoundaries)
    );

    hasDiluteSamples$: Observable<boolean> = combineLatest([
        this.urineSampleBoundaries$.pipe(filter(isNotNull)),
        this.samples$.pipe(
            filter(isNotNull),
            map((samples) => SampleFactory.getUrineSamples(samples))
        ),
    ]).pipe(map(([urineBoundaries, samples]) => this.checkHasDiluteSamples(urineBoundaries, samples)));

    inTimeSlot$: Observable<boolean> = of(false);

    isDCFDecommissioned$: Observable<boolean> = this.store.select(fromRootStore.isDCFDecommissioned);

    isBplrReaderOrWriter$: Observable<boolean> = this.store.select(
        fromRootStore.getHasRole(UserRolesEnum.BPLR_WRITER, [UserRolesEnum.BPLR_READER])
    );

    isLrReaderOrWriter$: Observable<boolean> = this.store.select(
        fromRootStore.getHasRole(UserRolesEnum.LAB_RESULT_WRITER, [UserRolesEnum.LAB_RESULT_READER])
    );

    isTestActivityReaderOrWriter$: Observable<boolean> = combineLatest([
        this.store.pipe(select(fromRootStore.getHasRole(UserRolesEnum.TEST_ACTIVITY_READER))),
        this.store.pipe(select(fromRootStore.getHasRole(UserRolesEnum.TEST_ACTIVITY_WRITER))),
    ]).pipe(
        map(
            ([hasTestActivityReader, hasTestActivityWriter]: [boolean, boolean]) =>
                hasTestActivityReader || hasTestActivityWriter
        )
    );

    isTestActivityWriter$: Observable<boolean> = this.store.pipe(
        select(fromRootStore.getHasRole(UserRolesEnum.TEST_ACTIVITY_WRITER))
    );

    isUserAnonymous$: Observable<boolean> = this.store.pipe(select(fromStore.getIsUserAnonymous));

    isUserCorrector$: Observable<boolean> = this.store.select(fromRootStore.getHasRole(UserRolesEnum.CORRECTOR));

    loading$: Observable<boolean> = this.store.select(fromStore.getLoadingPage);

    notificationDate$: Observable<Moment | null> = this.store.select(fromStore.getNotificationDate);

    route$: Observable<string> = this.store
        .select(fromRootStore.getActiveRouteUrl)
        .pipe(map((url) => url.split('#')[0]));

    sample$: Observable<Sample | null | undefined> = this.store.select(fromStore.getSample);

    sampleManagementTestInformation$: Observable<SampleManagementSample[]> = this.store.select(
        fromSMStore.getTestInformation
    );

    sampleTypes$ = this.store.select(fromAutoCompletesStore.getAutoCompletesSampleTypes);

    showSampleMatchingResultConfirmedMessage$: Observable<boolean | null | undefined> = this.store.select(
        fromStore.showSampleMatchingResultConfirmedMessage
    );

    showSampleMatchingResultRejectedMessage$: Observable<boolean | null | undefined> = this.store.select(
        fromStore.showSampleMatchingResultRejectedMessage
    );

    status$: Observable<StatusEnum | null> = this.store.select(fromStore.getStatus);

    testGender$: Observable<string> = this.store.pipe(
        select(fromStore.getTest),
        map((test: Test | null) => test?.gender || '')
    );

    testId$: Observable<string> = this.store.pipe(
        select(fromStore.getTest),
        map((test: Test | null) => test?.id || '')
    );

    testingOrderHasChanged$: Observable<boolean> = this.store.select(fromStore.getTestingOrderHasChanged);

    testingOrders$: Observable<Array<TOItem>> = this.store.select(fromStore.getTestingOrders);

    translations$ = this.translationService.translations$;

    updateInfo$: Observable<ModificationInfo | null> = this.store.select(fromStore.getUpdateInfo);

    wasSampleValidityUpdated$: Observable<boolean | null> = this.store.pipe(
        select(fromStore.getSampleValidityWasUpdated)
    );

    arrivalDate: Moment | undefined;

    attachmentsAthletePhoto: Attachment | undefined = new Attachment();

    attachmentsChainOfCustody: Attachment | undefined = new Attachment();

    attachmentsNotification: Attachment | undefined = new Attachment();

    attachmentsSignedCopy: Attachment | undefined = new Attachment();

    dataSource = new DataSource(Array<GenericActivity>());

    dcfHasBeenDeleted = false;

    dcfId = '';

    dcfRetentionPeriod: string | null = null;

    hasSampleManagementReader = false;

    isCancelled = false;

    isComplete = false;

    isDraft = false;

    isFirstSaveAsComplete = false;

    isFirstSaveAsDraft = false;

    notificationTime = '';

    route: fromRootStore.RouterStateUrl | null = null;

    sampleInformation: SampleInformation | null = null;

    sampleInformationErrors = new SampleInformationErrors();

    showAthleteInformationErrors = false;

    showAttachmentsAthletePhoto = false;

    showAttachmentsChainOfCustody = false;

    showAttachmentsNotification = false;

    showAttachmentsNotificationPhoto = false;

    showAttachmentsSignedCopy = false;

    showAuthorizationErrors = false;

    showCancelledConfirmation = false;

    showNotificationErrors = false;

    showProceduralInformationErrors = false;

    status = '';

    testId = '';

    private hasUnmatchedLabResults = false;

    private missingFieldsCountAthleteInformation = 0;

    private missingFieldsCountAuthorization = 0;

    private missingFieldsCountNotification = 0;

    private subscriptions = new Subscription();

    constructor(
        iconRegistry: MatIconRegistry,
        sanitizer: DomSanitizer,
        private store: Store<fromRootStore.IState>,
        private translationService: TranslationService,
        private tableTranslationService: TableTranslationService
    ) {
        iconRegistry.addSvgIcon('more_vert', sanitizer.bypassSecurityTrustResourceUrl('assets/more_vert.svg'));
    }

    ngOnInit(): void {
        this.store.dispatch(fromStore.InitViewDCF());
        this.store.dispatch(fromStore.PreloadAutoCompletesView());

        this.subscriptions.add(
            this.currentUserType$.subscribe((userType) => {
                if (userType !== UserTypeEnum.DCO && userType !== UserTypeEnum.ATHLETE) {
                    this.store.dispatch(fromSMStore.GetTestInformation());
                    this.hasSampleManagementReader = true;
                }
            })
        );

        this.subscriptions.add(
            this.store.select(fromStore.getReloadDCFView).subscribe((reloadDCFView: boolean) => {
                if (reloadDCFView) {
                    window.location.reload();
                }
            })
        );

        this.subscriptions.add(
            this.store.select(fromStore.getReloadDCFView).subscribe((reloadDCFView: boolean) => {
                if (reloadDCFView) {
                    window.location.reload();
                }
            })
        );

        this.subscriptions.add(
            this.store.select(fromStore.getStatus).subscribe((status) => {
                this.status = this.getStatus(status.toString());
                this.isDraft = this.status === this.DRAFT;
                this.isComplete = this.status === this.COMPLETED;
                this.isCancelled = this.status === this.CANCELLED;
            })
        );

        this.subscriptions.add(
            this.store.select(fromRootStore.getDcfDataRetentionPeriod).subscribe((dcfRetentionPeriod) => {
                this.dcfRetentionPeriod = dcfRetentionPeriod;
            })
        );

        this.subscriptions.add(
            this.store.select(fromStore.getUnmatchedLabReults).subscribe((unmatchedLabResults) => {
                this.hasUnmatchedLabResults = Boolean(unmatchedLabResults.length === 0);
            })
        );

        this.subscriptions.add(
            this.dcfId$.subscribe((dcfId) => {
                this.dcfId = dcfId;
            })
        );

        this.subscriptions.add(
            this.testId$.subscribe((testId) => {
                this.testId = testId;
            })
        );

        this.subscriptions.add(
            this.arrivalDate$.subscribe((arrivalDate) => {
                this.arrivalDate = arrivalDate;
            })
        );

        this.subscriptions.add(
            this.store.select(fromStore.getHasStatusChanged).subscribe((statusChanged) => {
                this.isFirstSaveAsDraft = statusChanged && this.isDraft;
                this.isFirstSaveAsComplete = statusChanged && this.isComplete;
            })
        );

        this.subscriptions.add(
            this.store.select(fromStore.getSampleInformation).subscribe((sampleInformation) => {
                this.sampleInformation = sampleInformation;
            })
        );

        this.subscriptions.add(
            this.store.pipe(select(fromStore.getSectionAthleteShowErrors)).subscribe((show) => {
                this.showAuthorizationErrors = show;
            })
        );

        this.subscriptions.add(
            this.dcfNotification$.subscribe((notification: NotificationInformation | null) => {
                if (notification && notification.notificationDate) {
                    const date = moment(notification.notificationDate).toDate();
                    this.store.dispatch(fromStore.Step1GetTimeSlots({ date }));

                    const hour = moment(notification.notificationDate).hour();
                    const minutes = moment(notification.notificationDate).minutes();
                    this.notificationTime = `${hour}:${minutes}`;
                }
            })
        );

        this.subscriptions.add(
            this.store.select(fromStore.getTimeSlots).subscribe((timeSlots) => {
                if (timeSlots) {
                    this.inTimeSlot$ = of(calculate60minTimeSlot(timeSlots, this.notificationTime));
                }
            })
        );

        this.subscriptions.add(
            this.store.select(fromStore.getAttachmentsSignedCopy).subscribe((attachmentsSignedCopy) => {
                this.attachmentsSignedCopy = attachmentsSignedCopy;
                if (this.showAttachmentsSignedCopy && this.attachmentsSignedCopy) {
                    window.open(this.attachmentsSignedCopy.url, '_blank');
                    this.showAttachmentsSignedCopy = false;
                }
            })
        );

        this.subscriptions.add(
            this.store.select(fromStore.getAttachmentsNotification).subscribe((attachmentsNotification) => {
                this.attachmentsNotification = attachmentsNotification;
                if (
                    this.showAttachmentsNotification &&
                    this.attachmentsNotification &&
                    this.attachmentsNotification.mimeType
                ) {
                    if (this.attachmentsNotification.mimeType.includes('/pdf')) {
                        window.open(this.attachmentsNotification.url, '_blank');
                        this.showAttachmentsNotification = false;
                    } else if (this.attachmentsNotification.mimeType.includes('image')) {
                        this.showAttachmentsNotificationPhoto = true;
                        this.showAttachmentsNotification = false;
                    }
                }
            })
        );

        this.subscriptions.add(
            this.store.select(fromStore.getAttachmentsAthletePhoto).subscribe((attachmentsAthletePhoto) => {
                if (attachmentsAthletePhoto) {
                    this.attachmentsAthletePhoto = attachmentsAthletePhoto;
                }
            })
        );

        this.subscriptions.add(
            this.store.select(fromStore.getAttachmentsChainOfCustody).subscribe((attachmentsChainOfCustody) => {
                this.attachmentsChainOfCustody = attachmentsChainOfCustody;
                if (this.showAttachmentsChainOfCustody && this.attachmentsChainOfCustody) {
                    window.open(this.attachmentsChainOfCustody.url, '_blank');
                    this.showAttachmentsChainOfCustody = false;
                }
            })
        );

        this.renderDataSource();
    }

    ngOnDestroy(): void {
        this.store.dispatch(fromStore.ResetNonDCFField());
        this.subscriptions.unsubscribe();
    }

    /**
     * Dispatches an action to execute the Bind dcf to testing order operation
     */
    bindDCFToTestingOrder(bindDCFToTO: DcfBinding): void {
        this.store.dispatch(fromStore.BindDCFToTestingOrder({ bindDCFToTO }));
    }

    breakSampleMatch(sampleCorrection: SampleCorrection): void {
        this.store.dispatch(
            fromStore.BreakSampleMatch({
                dcfId: sampleCorrection.dcfId,
                sampleId: sampleCorrection.sampleId,
                sampleJarCode: sampleCorrection.sampleJarCode,
                reason: sampleCorrection.reason,
            })
        );
    }

    cancelDcf(reason: string): void {
        this.store.dispatch(fromStore.ChangeDCFStatusCancel({ reason }));
        this.showCancelledConfirmation = true;
    }

    changeSample(sampleCorrection: SampleCorrection): void {
        if (!isNullOrBlank(sampleCorrection.sampleTargetField)) {
            switch (sampleCorrection.sampleTargetField) {
                case SampleTargetFieldEnum.SAMPLE_CODE:
                    this.changeSampleCode(sampleCorrection);
                    break;
                case SampleTargetFieldEnum.SAMPLE_TYPE:
                    this.changeSampleType(sampleCorrection);
                    break;
                case SampleTargetFieldEnum.VALIDITY:
                    this.changeSampleValidity(sampleCorrection);
                    break;
                case SampleTargetFieldEnum.MATCH_TYPE:
                    this.breakSampleMatch(sampleCorrection);
                    break;
                default:
                    break;
            }
        }
    }

    changeSampleCode(sampleCorrection: SampleCorrection): void {
        this.store.dispatch(
            fromStore.ChangeSampleCode({
                dcfId: sampleCorrection.dcfId,
                sampleId: sampleCorrection.sampleId,
                reason: sampleCorrection.reason,
                sampleCode: sampleCorrection.sampleCode,
            })
        );
    }

    changeSampleType(sampleCorrection: SampleCorrection): void {
        this.store.dispatch(
            fromStore.ChangeSampleType({
                dcfId: sampleCorrection.dcfId,
                sampleId: sampleCorrection.sampleId,
                reason: sampleCorrection.reason,
                sampleType: sampleCorrection.sampleType,
            })
        );
    }

    changeSampleValidity(sampleCorrection: SampleCorrection): void {
        const sampleValidityUpdate = new SampleValidityUpdate({
            sampleId: sampleCorrection.sampleId,
            reason: sampleCorrection.reason,
            valid: sampleCorrection.valid,
        });

        this.store.dispatch(
            fromStore.ChangeSampleValidity({
                dcfId: sampleCorrection.dcfId,
                sampleValidityUpdate,
            })
        );
    }

    closeAttachmentsAthletePhoto(): void {
        this.showAttachmentsAthletePhoto = false;
    }

    closeAttachmentsNotificationPhoto(): void {
        this.showAttachmentsNotificationPhoto = false;
    }

    dcfToBeDeleted(): boolean {
        if (isNullOrBlank(this.arrivalDate?.toString())) {
            return false;
        }

        const currentDate = moment();
        const monthsDifference = currentDate.diff(this.arrivalDate, 'months');

        return monthsDifference > Number(this.dcfRetentionPeriod) && this.hasUnmatchedLabResults;
    }

    deleteDcf(reason: Reason): void {
        if (!isNullOrBlank(this.dcfId) && !isNullOrBlank(reason.details)) {
            this.store.dispatch(fromStore.DeleteDCF({ dcfId: this.dcfId, reason: reason.details }));
        }
    }

    formatFileSize(fileSize: number): string {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (fileSize === 0) return '0 Bytes';
        const i = parseInt(String(Math.floor(Math.log(fileSize) / Math.log(1024))), 10);
        return `${Math.round(fileSize / 1024 ** i)} ${sizes[i]}`;
    }

    getHeaderTranslation(header: string): string {
        let headerTranslation = '';
        this.tableTranslationService.translateHeader(header).subscribe((value: string) => {
            headerTranslation = value;
        });
        return headerTranslation;
    }

    missingFieldsCountStep1(): number {
        return (
            this.missingFieldsCountAthleteInformation +
            this.missingFieldsCountAuthorization +
            this.missingFieldsCountNotification
        );
    }

    getStatus(status: string): string {
        switch (status) {
            case '0':
                return this.DRAFT;
            case '1':
                return this.COMPLETED;
            case '2':
                return this.CANCELLED;
            default:
                return '';
        }
    }

    hasSampleMatched(sampleInformation: SampleInformation): boolean {
        return sampleInformation.samples.filter((sample) => sample.results.length > 0).length > 0;
    }

    isLastMatchedSample(): boolean {
        return this.sampleInformation?.samples.filter((sample) => sample.results.length > 0).length === 1;
    }

    minTwoDigits(num?: number | null): string {
        if (num !== undefined && num !== null) {
            return (num < 10 ? '0' : '') + num;
        }
        return '00';
    }

    onClickThreeDotMenu(): void {
        this.store.dispatch(
            fromStore.GetAttachments({
                dcfId: this.dcfId,
                types: [
                    AttachmentType.ATHLETE_PHOTO,
                    AttachmentType.CHAIN_OF_CUSTODY,
                    AttachmentType.NOTIFICATION,
                    AttachmentType.SIGNED_DCF,
                ],
            })
        );
    }

    openDeleteDcf(): void {
        if (this.isCancelled && this.deleteDcfModalRef) {
            this.deleteDcfModalRef.onOpen();
        }
    }

    renderDataSource(): void {
        this.genericActivities$.subscribe((genericActivities: Array<GenericActivity>) => {
            this.dataSource.data = genericActivities;
        });
    }

    setMissingFieldsCountAthleteInformation(numberMissingFields: number): void {
        this.missingFieldsCountAthleteInformation = Number(numberMissingFields);
    }

    setMissingFieldsCountAuthorization(numberMissingFields: number): void {
        this.missingFieldsCountAuthorization = Number(numberMissingFields);
    }

    setMissingFieldsCountNotification(numberMissingFields: number): void {
        this.missingFieldsCountNotification = Number(numberMissingFields);
    }

    viewAttachmentsAthletePhoto(): void {
        if (!this.attachmentsAthletePhoto || !this.attachmentsAthletePhoto.id) return;
        this.showAttachmentsAthletePhoto = true;
        this.store.dispatch(
            fromStore.GetAttachmentsAthletePhoto({
                dcfId: this.dcfId,
                fileKey: this.attachmentsAthletePhoto.id,
            })
        );
    }

    viewAttachmentsChainOfCustody(): void {
        if (!this.attachmentsChainOfCustody || !this.attachmentsChainOfCustody.id) return;
        this.showAttachmentsChainOfCustody = true;
        this.store.dispatch(
            fromStore.GetAttachmentsChainOfCustody({
                dcfId: this.dcfId,
                fileKey: this.attachmentsChainOfCustody.id,
            })
        );
    }

    viewAttachmentsNotification(): void {
        this.showAttachmentsNotification = true;
        if (this.attachmentsNotification && this.attachmentsNotification.id) {
            this.store.dispatch(
                fromStore.GetAttachmentsNotification({
                    dcfId: this.dcfId,
                    fileKey: this.attachmentsNotification.id,
                })
            );
        }
    }

    viewAttachmentsSignedCopy(): void {
        this.showAttachmentsSignedCopy = true;
        if (this.attachmentsSignedCopy && this.attachmentsSignedCopy.id) {
            this.store.dispatch(
                fromStore.GetAttachmentsSignedCopy({
                    dcfId: this.dcfId,
                    fileKey: this.attachmentsSignedCopy.id,
                })
            );
        }
    }

    viewDCF(): void {
        this.athleteId$.subscribe((athleteId) => {
            window.open(
                `${this.adamsUrl}/requestTemplateConfiguration.do?action=generatePDF&entityType=DCF&entityId=${this.dcfId}&athleteId=${athleteId}&templateIdPDF=DCFForm&noDuplicates=5&imageFormat=false`
            );
        });
    }

    private checkHasDiluteSamples(boundaries: UrineSampleBoundaries, urineSamples: Urine[]): boolean {
        let hasDiluteSamples = false;
        urineSamples.forEach((sample) => {
            const specificGravity = parseFloat(sample.specificGravity || '');

            if (sampleIsDiluted(specificGravity, sample.volume, boundaries)) {
                hasDiluteSamples = true;
            }
        });

        return hasDiluteSamples;
    }

    get isCancellable(): boolean {
        if (this.sampleInformation) {
            return (this.isDraft || this.isComplete) && !this.hasSampleMatched(this.sampleInformation);
        }
        return false;
    }
}
