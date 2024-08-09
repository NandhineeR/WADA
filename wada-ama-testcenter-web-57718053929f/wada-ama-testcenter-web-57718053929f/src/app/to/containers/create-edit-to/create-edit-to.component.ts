import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { TranslationService } from '@core/services/translation.service';
import { select, Store } from '@ngrx/store';
import { ConfirmLeaveComponent } from '@shared/components';
import { ConfirmLeaveService } from '@shared/services';
import { StepRouteData } from '@to/to.routes';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import * as fromRootStore from '@core/store';
import {
    InfoBubbleSourceEnum,
    ModificationInfo,
    StatusEnum,
    ErrorMessageKeyEnums,
    TestParticipant,
} from '@shared/models';
import * as fromStore from '@to/store';

@Component({
    selector: 'app-create-edit-to',
    templateUrl: './create-edit-to.component.html',
    styleUrls: ['./create-edit-to.component.scss'],
})
export class CreateEditTOComponent implements OnInit, AfterViewInit {
    @ViewChild('cancelCreateModalRef')
    cancelCreateModalRef?: ConfirmLeaveComponent;

    @ViewChild('confirmLeaveModalRef')
    confirmLeaveModalRef?: ConfirmLeaveComponent;

    @ViewChild('confirmChangeSampleCollectionAuthorityRef')
    confirmChangeSampleCollectionAuthorityRef?: ConfirmLeaveComponent;

    @HostListener('window:beforeunload', ['$event'])
    unloadHandler() {
        return false;
    }

    doSaveOnScaChangeConfirmed = false;

    infoBubbleSource = InfoBubbleSourceEnum.Green;

    participants$: Observable<Array<TestParticipant> | null> = this.store.select(fromStore.getTOTestParticipants);

    scaId$: Observable<number | null> = this.store.select(fromStore.getSampleCollectionAuthorityId);

    status$: Observable<StatusEnum> = this.store.select(fromStore.getTOStatus);

    saveAsDraftTO$: Observable<boolean> = of(true);

    creationInfo$: Observable<ModificationInfo | null> = this.store.select(fromStore.getTOCreationInfo);

    updateInfo$: Observable<ModificationInfo | null> = this.store.select(fromStore.getTOUpdateInfo);

    isSavingDisabled$ = this.store.select(fromStore.shouldSavingBeDisabled);

    error$ = this.store.select(fromStore.getGlobalError);

    saveError$ = this.store.select(fromStore.getSaveError);

    unprocessableEntityError$ = this.store.select(fromStore.getUnprocessableEntityError);

    errorMsgKey$: Observable<string | undefined> = this.store.pipe(
        select(fromStore.getErrorMessageKey),
        map((messageKey: string | null) => ErrorMessageKeyEnums.getValue(messageKey))
    );

    translations$ = this.translationService.translations$;

    toId$: Observable<string> = this.store
        .select(fromRootStore.getActiveRoute)
        .pipe(map((state: fromRootStore.RouterStateUrl) => state.params.id || ''));

    inEdit$: Observable<boolean> = this.toId$.pipe(map((id) => Boolean(id)));

    copiedTestingOrderNumber$: Observable<string | null> = this.store
        .select(fromStore.getTOCopiedTestingOrderNumber)
        .pipe(map((copiedTestingOrderNumber: string | null) => copiedTestingOrderNumber));

    route$: Observable<string> = this.toId$.pipe(map((id) => (id ? `edit/${id}` : 'new')));

    stepData$: Observable<StepRouteData> = this.store
        .select(fromRootStore.getActiveRoute)
        .pipe(map((state: fromRootStore.RouterStateUrl) => state.data as StepRouteData));

    activeStep$: Observable<number> = this.stepData$.pipe(map((data) => data.step));

    nextStep$: Observable<number> = this.stepData$.pipe(
        map((data) => data.nextStep),
        map((next) => next || -1)
    );

    private previousScaId: number | null = null;

    private isParticipantListEmpty = true;

    constructor(
        private store: Store<fromRootStore.IState>,
        private cdr: ChangeDetectorRef,
        private confirmLeaveService: ConfirmLeaveService,
        private translationService: TranslationService
    ) {}

    ngOnInit(): void {
        this.toId$.pipe(take(1)).subscribe((id: string) => {
            if (id) {
                this.store.dispatch(fromStore.InitEditTestingOrder({ toId: id }));
            } else {
                this.store.dispatch(fromStore.InitCreateTestingOrder());
            }
            this.store.dispatch(fromStore.PreloadAutoCompletesCreateOrEdit());
            this.cdr.detectChanges();
        });

        this.participants$.subscribe((participants: Array<TestParticipant> | null) => {
            this.isParticipantListEmpty = participants
                ? participants.length === 0 || (participants.length === 1 && this.isParticipantEmpty(participants[0]))
                : true;
        });

        this.scaId$.subscribe((scaId: number | null) => {
            if (this.previousScaId === null) {
                this.previousScaId = scaId;
            } else {
                this.confirmLeaveService.confirmChangeStepComponent =
                    this.previousScaId !== scaId && !this.isParticipantListEmpty
                        ? this.confirmChangeSampleCollectionAuthorityRef
                        : undefined;
            }
        });
    }

    ngAfterViewInit(): void {
        this.confirmLeaveService.confirmLeaveComponent = this.confirmLeaveModalRef;
    }

    isStepLoading(activeStep: number): Observable<boolean> {
        switch (activeStep) {
            case 1:
                return this.store.select(fromStore.getLoadingStep1);
            case 2:
                return this.store.select(fromStore.getLoadingStep2);
            case 3:
                return this.store.select(fromStore.getLoadingStep3);
            case 4:
                return this.store.select(fromStore.getLoadingStep4);
            default:
                return of(false);
        }
    }

    redirectOnConfirm(redirect: boolean): void {
        if (redirect) {
            this.confirmLeaveService.confirmLeaveComponent = undefined; // prevent multiple confirmations from happening
            this.confirmLeaveService.confirmChangeStepComponent = undefined;
            this.resetStateObjects();
            this.store.pipe(select(fromStore.getMode), take(1)).subscribe((mode) => {
                this.store.dispatch(fromStore.CancelChangeTestingOrder({ mode }));
            });
        }
    }

    resetStateObjects() {
        this.store.dispatch(fromStore.Step1ResetMajorEvent());
    }

    save(isSavingDisabled: boolean): void {
        if (!isSavingDisabled && !this.askSampleCollectionAuthorityChangeConfirmation(true)) {
            this.confirmLeaveService.confirmChangeStepComponent = undefined;
            this.store.dispatch(fromStore.SubmitCurrentStep());
        }
    }

    showCancelCreateModal(): void {
        if (this.cancelCreateModalRef) {
            this.cancelCreateModalRef.show();
        }
    }

    askSampleCollectionAuthorityChangeConfirmation(doSave: boolean): boolean {
        this.doSaveOnScaChangeConfirmed = doSave;
        if (
            this.confirmChangeSampleCollectionAuthorityRef &&
            this.confirmLeaveService.confirmChangeStepComponent === this.confirmChangeSampleCollectionAuthorityRef
        ) {
            this.confirmChangeSampleCollectionAuthorityRef.show();
            return true;
        }
        return false;
    }

    sampleCollectionAuthorityChangeConfirmed(isConfirmed: boolean): void {
        if (isConfirmed) {
            this.confirmLeaveService.confirmChangeStepComponent = undefined;
            this.store.dispatch(fromStore.ClearParticipants());
            if (this.doSaveOnScaChangeConfirmed) {
                this.doSaveOnScaChangeConfirmed = false;
                this.save(false);
            }
        }
    }

    isParticipantEmpty(testParticipant: TestParticipant): boolean {
        return (
            testParticipant.firstName === null &&
            testParticipant.lastName === null &&
            testParticipant.status === null &&
            testParticipant.comment === null
        );
    }

    returnToFormAfterError(): void {
        this.store.dispatch(fromStore.ResetTestingOrderError());
    }
}
