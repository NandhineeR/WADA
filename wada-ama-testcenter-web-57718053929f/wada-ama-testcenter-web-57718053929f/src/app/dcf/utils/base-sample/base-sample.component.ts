import { Component, OnDestroy } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { ConflictException } from '@core/models';
import { CalendarUtils } from '@shared/utils';
import { Observable, Subscription } from 'rxjs';
import * as fromRootStore from '@core/store';
import { Store } from '@ngrx/store';
import * as fromStore from '@dcf/store';
import { validateSampleCodeDuplication } from '../sample-validation.utils';

/**
 * Component base for samples, which contains functions that should be used whenever we inject an app-sample-input
 */
@Component({
    selector: 'app-base-sample-component',
    template: '',
})
export class BaseSampleComponent extends CalendarUtils implements OnDestroy {
    isSampleTimezoneRequired$: Observable<boolean> = this.store.select(fromRootStore.isSampleTimezoneRequired);

    conflictException: ConflictException | null = null;

    form: FormGroup = new FormGroup({});

    hasCodeValidationWarning = false;

    hasOptimisticLockException: boolean | undefined;

    hasSampleCodeValidationError: boolean | undefined;

    hasSaveConflict: boolean | undefined;

    isTimezoneRequired = false;

    sampleDuplicate: Map<string, string> | null = null;

    subscriptions = new Subscription();

    constructor(public store: Store<fromRootStore.IState>) {
        super();
        this.subscriptions.add(
            this.store
                .select(fromStore.getConflictException)
                .subscribe((conflictException: ConflictException | null) => {
                    this.conflictException = conflictException;
                    this.hasSaveConflict = Boolean(conflictException);
                    this.hasOptimisticLockException = conflictException
                        ? conflictException.hasOptimisticLockException()
                        : false;
                    this.hasSampleCodeValidationError = conflictException
                        ? conflictException.hasSampleCodeValidationError()
                        : false;
                    this.hasCodeValidationWarning = conflictException
                        ? conflictException.hasCodeValidationWarning()
                        : false;
                    this.setSampleCodeDuplicateValidation(conflictException);
                })
        );

        this.subscriptions.add(
            this.isSampleTimezoneRequired$.subscribe((sampleTimezoneRequired: boolean) => {
                this.isTimezoneRequired = sampleTimezoneRequired;
            })
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    setSampleCodeDuplicateValidation(conflictException: ConflictException | null): void {
        this.sampleDuplicate =
            conflictException && conflictException.conflict && conflictException.conflict.conflictParameters
                ? conflictException.conflict.conflictParameters
                : null;

        validateSampleCodeDuplication(
            this.samples,
            conflictException,
            this.hasCodeValidationWarning,
            this.hasSampleCodeValidationError,
            this.sampleDuplicate
        );
    }

    get samples(): FormArray | null {
        return this.form.get('samples') as FormArray;
    }
}
