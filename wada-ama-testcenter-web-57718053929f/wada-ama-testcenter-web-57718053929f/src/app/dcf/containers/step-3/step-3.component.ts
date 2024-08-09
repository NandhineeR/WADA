import { Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { NumberOfErrorsPerCategory } from '@shared/utils/form-util';
import { ProceduralInformation, SectionProceduralAutoCompletes, StepsSection, Timezone } from '@dcf/models';
import { FieldsSecurity, Participant, StatusEnum } from '@shared/models';
import * as fromAutoCompletesStore from '@autocompletes/store';
import * as fromRootStore from '@core/store';
import * as fromStore from '@dcf/store';
import { ConflictException } from '@core/models';
import { scrollELementById } from '@shared/utils';
import { CanComponentDeactivate } from '@dcf/guards';

@Component({
    selector: 'app-step-3',
    templateUrl: './step-3.component.html',
    styleUrls: ['./step-3.component.scss'],
})
export class Step3Component implements CanComponentDeactivate, OnInit, OnDestroy {
    athleteRepresentatives$: Observable<Array<Participant>> = this.store.pipe(
        select(fromAutoCompletesStore.getAutoCompletesAthleteRepresentatives)
    );

    autoCompletes$: Observable<SectionProceduralAutoCompletes> = this.store.pipe(
        select(fromAutoCompletesStore.getDCFSectionProceduralAutoCompletes)
    );

    conflictException$: Observable<ConflictException | null> = this.store.select(fromStore.getConflictException);

    dcfId$: Observable<string> = this.store
        .select(fromRootStore.getActiveRoute)
        .pipe(map((state: fromRootStore.RouterStateUrl) => state.params.id || ''));

    dopingControlOfficers$: Observable<Array<Participant>> = this.store.pipe(
        select(fromAutoCompletesStore.getAutoCompletesDcos)
    );

    fieldsSecurity$: Observable<FieldsSecurity | null> = this.store.select(fromStore.getFieldsSecurity);

    isCurrentStepValid$: Observable<boolean> = this.store.select(fromStore.getIsCurrentStepValid);

    isEditMode$: Observable<boolean> = this.store.select(fromStore.isEditMode);

    locale$: Observable<string> = this.store.select(fromRootStore.getLocale);

    proceduralInformation$: Observable<ProceduralInformation | undefined> = this.store.select(
        fromStore.getSectionProceduralFormValues
    );

    route$: Observable<string> = this.store
        .select(fromRootStore.getActiveRouteUrl)
        .pipe(map((url) => url.split('#')[0]));

    showErrors$: Observable<boolean> = this.store.select(fromStore.getSectionProceduralShowErrors);

    timezones$: Observable<Array<Timezone>> = this.store.pipe(select(fromAutoCompletesStore.getAutoCompletesTimezones));

    dcfStatus?: StatusEnum = undefined;

    hasOptimisticLockException = false;

    hasSaveConflict = false;

    inCreation = false;

    isStepValid = true;

    saveError = false;

    private subscriptions = new Subscription();

    constructor(private store: Store<fromRootStore.IState>) {}

    canDeactivate(): Observable<boolean> {
        const sub = this.store.select(fromStore.getIsCurrentStepValid).subscribe((valid) => {
            this.isStepValid = valid;
        });
        if (this.isStepValid) sub.unsubscribe();

        return this.store.pipe(select(fromStore.getIsCurrentStepValid)).pipe(
            take(1),
            tap((valid) => !valid && setTimeout(() => scrollELementById('notifications')))
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    ngOnInit(): void {
        this.subscriptions.add(
            this.store.select(fromStore.getStatus).subscribe((status) => {
                this.dcfStatus = status;
            })
        );

        this.subscriptions.add(
            this.store.select(fromRootStore.getActiveRoute).subscribe((state) => {
                this.inCreation = this.isInCreation(state.url);
            })
        );

        this.subscriptions.add(
            this.store.select(fromStore.getSaveError).subscribe((error: boolean | undefined) => {
                this.saveError = Boolean(error);
            })
        );
    }

    initStep3(): void {
        this.store.dispatch(fromStore.Step3Init());
    }

    isInCreation(module: string): boolean {
        return module.includes('new');
    }

    submitError(value: NumberOfErrorsPerCategory): void {
        this.store.dispatch(
            fromStore.SubmitCurrentStepErrors({ section: StepsSection.ProceduralSection, errors: value })
        );
    }

    submitForm(event: any): void {
        if (event.saving) {
            this.store.dispatch(fromStore.Step3SubmitForm({ values: event.value }));
        } else {
            this.store.dispatch(fromStore.Step3SectionProceduralSubmitForm({ values: event.value }));
        }
    }
}
