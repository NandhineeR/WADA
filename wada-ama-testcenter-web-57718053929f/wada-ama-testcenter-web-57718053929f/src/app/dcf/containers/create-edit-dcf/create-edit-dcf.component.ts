import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, of, Subscription } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { ModificationInfo, StatusEnum, ErrorMessageKeyEnums } from '@shared/models';
import * as fromRootStore from '@core/store';
import { ConfirmLeaveService } from '@shared/services';
import { ConfirmLeaveComponent } from '@shared/components';
import { TranslationService } from '@core/services/translation.service';
import * as fromStore from '@dcf/store';
import { StepRouteData } from '@dcf/dcf.routes';
import { AthleteInformation } from '@dcf/models';

@Component({
    selector: 'app-create-edit-dcf',
    templateUrl: './create-edit-dcf.component.html',
    styleUrls: ['./create-edit-dcf.component.scss'],
})
export class CreateEditDCFComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('cancelCreateModalRef')
    cancelCreateModalRef?: ConfirmLeaveComponent;

    @ViewChild('confirmLeaveModalRef')
    confirmLeaveModalRef?: ConfirmLeaveComponent;

    @HostListener('window:beforeunload', ['$event'])
    unloadHandler() {
        return false;
    }

    athlete$: Observable<AthleteInformation> = this.store.select(fromStore.getSourceAthlete);

    creationInfo$: Observable<ModificationInfo | null> = this.store.select(fromStore.getCreationInfo);

    dcfId$: Observable<string> = this.store
        .select(fromRootStore.getActiveRoute)
        .pipe(map((state: fromRootStore.RouterStateUrl) => state.params.id || ''));

    disableSaving$ = this.store
        .select(fromStore.getDisableSaving)
        .pipe(
            switchMap((disableSaving) =>
                this.isClickDisabled$.pipe(map((isClickDisabled) => disableSaving || isClickDisabled))
            )
        );

    error$ = this.store.select(fromStore.getGlobalError);

    errorMsgKey$: Observable<string | undefined> = this.store.pipe(
        select(fromStore.getErrorMessageKey),
        map((messageKey: string | null) => ErrorMessageKeyEnums.getValue(messageKey))
    );

    inEdit$: Observable<boolean> = this.dcfId$.pipe(map((id) => Boolean(id)));

    isClickDisabled$ = this.store.select(fromStore.getRequestActive);

    isStatusCompleted$: Observable<boolean> = of(false);

    stepData$: Observable<StepRouteData> = this.store
        .select(fromRootStore.getActiveRoute)
        .pipe(map((state: fromRootStore.RouterStateUrl) => state.data as StepRouteData));

    nextStep$: Observable<number> = this.stepData$.pipe(
        map((data) => data.nextStep),
        map((next) => next || -1)
    );

    route$: Observable<string> = this.dcfId$.pipe(map((id) => (id ? `edit/${id}` : 'new')));

    saveAsDraftDCF$: Observable<boolean> = this.store.select(fromStore.saveAsDraftDCF);

    saveError$ = this.store.select(fromStore.getSaveError);

    status$: Observable<StatusEnum> = this.store.select(fromStore.getStatus);

    translations$ = this.translationService.translations$;

    updateInfo$: Observable<ModificationInfo | null> = this.store.select(fromStore.getUpdateInfo);

    athleteId = '';

    activeStep = 0;

    testId = '';

    private subscriptions = new Subscription();

    constructor(
        private store: Store<fromRootStore.IState>,
        private cdr: ChangeDetectorRef,
        private confirmLeaveService: ConfirmLeaveService,
        private translationService: TranslationService
    ) {}

    ngAfterViewInit(): void {
        this.confirmLeaveService.confirmLeaveComponent = this.confirmLeaveModalRef;
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    ngOnInit(): void {
        this.dcfId$.pipe(take(1)).subscribe((id: string) => {
            if (id) {
                this.store.dispatch(fromStore.InitEditDCF({ dcfId: +id }));
            } else {
                this.store.dispatch(fromStore.InitCreateDCF());
            }
            this.store.dispatch(fromStore.PreloadAutoCompletesCreateOrEdit());
            this.cdr.detectChanges();
        });

        this.subscriptions.add(
            this.stepData$.pipe(map((data) => data.step)).subscribe((activeStep: number) => {
                this.activeStep = activeStep;
            })
        );

        this.isStatusCompleted$ = this.store.select(fromStore.getStatus).pipe(
            take(1),
            map((status) => status === StatusEnum.Completed)
        );

        this.subscriptions.add(
            this.store.select(fromRootStore.getActiveRouteQueryParams).subscribe((params: any) => {
                this.athleteId = params.athleteId;
                this.testId = params.testId;
            })
        );
    }

    isStepLoading(): Observable<boolean> {
        switch (this.activeStep) {
            case 1:
                return this.store.select(fromStore.getLoadingStep1);
            case 2:
                return this.store.select(fromStore.getLoadingStep2);
            case 3:
                return this.store.select(fromStore.getLoadingStep3);
            default:
                return of(false);
        }
    }

    redirectOnConfirm(redirect: boolean): void {
        if (redirect) {
            this.confirmLeaveService.confirmLeaveComponent = undefined; // prevent multiple confirmations from happening
            this.resetStateObjects();
            this.store.pipe(select(fromStore.getMode), take(1)).subscribe((mode) => {
                this.store.dispatch(fromStore.CancelDCF({ mode }));
            });
        }
    }

    resetStateObjects() {
        this.store.dispatch(fromStore.Step2ResetMajorEvent());
    }

    returnToFormAfterError(): void {
        this.store.dispatch(fromStore.ResetDCFError());
    }

    save(isClickDisabled: boolean): void {
        if (!isClickDisabled && !this.cancelCreateModalRef?.showModal) {
            this.store.dispatch(fromStore.SubmitCurrentStep());
        }
    }

    showCancelCreateModal(): void {
        if (this.cancelCreateModalRef) {
            this.cancelCreateModalRef.show();
        }
    }
}
