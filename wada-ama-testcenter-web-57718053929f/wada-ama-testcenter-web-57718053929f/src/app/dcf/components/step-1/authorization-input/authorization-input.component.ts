import { Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, map, take } from 'rxjs/operators';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { DCFFormControls, FieldsSecurity, ListItem, StatusEnum, TOItem } from '@shared/models';
import {
    controlHasModeRelatedErrors,
    fieldRequired,
    isNullOrBlank,
    latinize,
    numberOfErrorPerCategoryValidation,
    NumberOfErrorsPerCategory,
    numberOfErrorsPerCategory,
    ValidationCategory,
    withCategory,
} from '@shared/utils';
import * as fromAutoCompletesStore from '@autocompletes/store';
import * as fromRootStore from '@core/store';
import * as fromStore from '@dcf/store';
import { ConflictException } from '@core/models';
import { AuthorizationInformation, DCFMode, SectionAuthorizationAutoCompletes, StepsSection } from '@dcf/models';

@Component({
    selector: 'app-authorization-input',
    templateUrl: './authorization-input.component.html',
    styleUrls: ['./authorization-input.component.scss'],
})
export class AuthorizationInputComponent implements OnInit, OnDestroy {
    readonly controls = DCFFormControls;

    readonly dcfModeType = DCFMode;

    readonly statusType = StatusEnum;

    athleteId$: Observable<string | null> = this.store.select(fromStore.getAthleteId);

    autoCompletes$: Observable<SectionAuthorizationAutoCompletes> = this.store.pipe(
        select(fromAutoCompletesStore.getDCFSectionAuthorizationAutoCompletes)
    );

    dcfId$: Observable<string> = this.store
        .select(fromRootStore.getActiveRoute)
        .pipe(map((state: fromRootStore.RouterStateUrl) => state.params.id || ''));

    dcfMode$: Observable<DCFMode> = this.store.select(fromStore.getMode);

    fieldsSecurity$: Observable<FieldsSecurity | null> = this.store.select(fromStore.getFieldsSecurity);

    hasSampleCodeValidationError$ = this.store.select(fromStore.hasSampleValidationError);

    isBoundToTO$: Observable<boolean> = this.store.select(fromStore.isBoundToTO);

    isMatchingResultType1$: Observable<boolean> = this.store.select(fromStore.isMatchingResultType1);

    isMatchingResultType3or2or1$: Observable<boolean> = this.store.select(fromStore.isMatchingResultType3or2or1);

    loadingTOs$: Observable<boolean> = this.store.select(fromStore.getLoadingTOs);

    route$: Observable<string> = this.store
        .select(fromRootStore.getActiveRouteUrl)
        .pipe(map((url) => url.split('#')[0]));

    testingOrderNumber$: Observable<string> = this.store.select(fromStore.getTestingOrderNumber);

    toItems$: Observable<Array<TOItem>> = this.store.pipe(
        select(fromStore.getTestingOrders),
        filter((tos) => tos !== undefined),
        take(1)
    );

    conflictException: ConflictException | null = null;

    dcfStatus?: StatusEnum = undefined;

    form = new FormGroup(
        {
            testingOrder: new FormControl(undefined, []),
            adoReferenceNumber: new FormControl('', []),
            testingAuthority: new FormControl(undefined, [
                withCategory(fieldRequired('description'), ValidationCategory.MandatoryDraft),
            ]),
            sampleCollectionAuthority: new FormControl(undefined, [
                withCategory(fieldRequired('description'), ValidationCategory.MandatoryDraft),
            ]),
            resultManagementAuthority: new FormControl(undefined, [
                withCategory(fieldRequired('description'), ValidationCategory.MandatoryDraft),
            ]),
            testCoordinator: new FormControl(undefined, []),
        },
        { updateOn: 'blur' }
    );

    hasOptimisticLockException = false;

    hasSaveConflict = false;

    saveError = false;

    showErrors = false;

    showTestingOrderNumberWarning = true;

    tosInitialized = false;

    private subscriptions = new Subscription();

    constructor(private store: Store<fromRootStore.IState>) {}

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    ngOnInit(): void {
        this.store.dispatch(fromStore.Step1Init({ section: StepsSection.AuthorizationSection }));

        this.subscriptions.add(
            this.store.pipe(select(fromStore.getSectionAuthorizationShowErrors)).subscribe((show) => {
                this.showErrors = show;
            })
        );

        this.subscriptions.add(
            this.store
                .pipe(select(fromStore.getSectionAuthorizationFormValues))
                .subscribe((data: AuthorizationInformation | undefined) => {
                    if (data) {
                        this.form.patchValue(data);
                    }
                })
        );

        this.subscriptions.add(
            this.store.select(fromStore.getStatus).subscribe((status: StatusEnum) => {
                this.dcfStatus = status;
            })
        );

        this.subscriptions.add(
            this.form.statusChanges
                .pipe(
                    map(() => (this.form.invalid ? numberOfErrorsPerCategory(this.form) : {})),
                    distinctUntilChanged((a: NumberOfErrorsPerCategory, b: NumberOfErrorsPerCategory) =>
                        numberOfErrorPerCategoryValidation(a, b)
                    )
                )
                .subscribe((errors) => {
                    this.store.dispatch(
                        fromStore.SubmitCurrentStepErrors({
                            section: StepsSection.AuthorizationSection,
                            errors,
                        })
                    );
                })
        );

        this.subscriptions.add(
            this.store
                .select(fromStore.getConflictException)
                .subscribe((conflictException: ConflictException | null) => {
                    this.hasSaveConflict = Boolean(conflictException);
                    this.conflictException = conflictException;
                    if (conflictException) {
                        this.hasOptimisticLockException = conflictException.hasOptimisticLockException();
                    }
                })
        );

        this.subscriptions.add(
            this.store.select(fromStore.getSaveError).subscribe((error: boolean | undefined) => {
                this.saveError = Boolean(error);
            })
        );
    }

    dispatchSampleCodeValidation(): void {
        setTimeout(() => {
            this.submitForm();
            this.store.dispatch(fromStore.Step2ExecuteSampleCodeValidation());
        }, 250);
    }

    triggerFormSubmission(): void {
        setTimeout(() => {
            this.submitForm();
        }, 250);
    }

    initializeTOs() {
        if (!this.tosInitialized) {
            this.subscriptions.add(
                this.athleteId$
                    .pipe(
                        filter((athleteId: string | null) => !isNullOrBlank(athleteId)),
                        map((athleteId: string | null) => athleteId || ''),
                        take(1)
                    )
                    .subscribe((athleteId: string) => this.store.dispatch(fromStore.GetTestingOrders({ athleteId })))
            );
            this.tosInitialized = true;
        }
    }

    isDCFCompleted() {
        return this.dcfStatus === StatusEnum.Completed;
    }

    resetTO(): void {
        this.store.dispatch(fromStore.Step1ResetTOAndTest());
    }

    resultManagementSuggestions = (token: string): Observable<Array<ListItem>> => {
        const latinizedToken = latinize(token.toLocaleLowerCase());
        return this.autoCompletes$.pipe(
            map((suggestions: SectionAuthorizationAutoCompletes) =>
                suggestions.concatOrganizations.filter(
                    (resultManagementAuthority: ListItem): boolean =>
                        latinize(resultManagementAuthority.displayDescriptionName.toLocaleLowerCase()).indexOf(
                            latinizedToken
                        ) >= 0
                )
            )
        );
    };

    sampleCollectionSuggestions = (token: string): Observable<Array<ListItem>> => {
        const latinizedToken = latinize(token.toLocaleLowerCase());
        return this.autoCompletes$.pipe(
            map((suggestions: SectionAuthorizationAutoCompletes) =>
                suggestions.concatOrganizations.filter(
                    (sampleCollectionAuthority: ListItem): boolean =>
                        latinize(sampleCollectionAuthority.displayDescriptionName.toLocaleLowerCase()).indexOf(
                            latinizedToken
                        ) >= 0
                )
            )
        );
    };

    selectTestingOrderNumber(to: TOItem): void {
        if (!to || !to.testingAuthority || !to.sampleCollectionAuthority || !to.resultManagementAuthority) return;
        this.store.dispatch(fromStore.Step1SetTOAndTest({ to }));
    }

    submitForm(): void {
        this.store.dispatch(fromStore.Step1SectionAuthorizationSubmitForm({ values: this.form.value }));
    }

    testCoordinatorSuggestions = (token: string): Observable<Array<ListItem>> => {
        const latinizedToken = latinize(token.toLocaleLowerCase());
        return this.autoCompletes$.pipe(
            map((suggestions: SectionAuthorizationAutoCompletes) =>
                suggestions.concatOrganizations.filter(
                    (testCoordinator: ListItem): boolean =>
                        latinize(testCoordinator.displayDescriptionName.toLocaleLowerCase()).indexOf(latinizedToken) >=
                        0
                )
            )
        );
    };

    testingAuthoritySuggestions = (token: string): Observable<Array<ListItem>> => {
        const latinizedToken = latinize(token.toLocaleLowerCase());
        return this.autoCompletes$.pipe(
            map((suggestions: SectionAuthorizationAutoCompletes) =>
                suggestions.ados.filter(
                    (testingAuthority: ListItem): boolean =>
                        latinize(testingAuthority.displayDescriptionName.toLocaleLowerCase()).indexOf(latinizedToken) >=
                        0
                )
            )
        );
    };

    get adoReferenceNumber(): AbstractControl | null {
        return this.form.get('adoReferenceNumber');
    }

    get resultManagementAuthority(): AbstractControl | null {
        return this.form.get('resultManagementAuthority');
    }

    get resultManagementAuthorityHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.resultManagementAuthority,
            this.showErrors || this.isDCFCompleted(),
            false,
            false
        );
    }

    get sampleCollectionAuthority(): AbstractControl | null {
        return this.form.get('sampleCollectionAuthority');
    }

    get sampleCollectionAuthorityHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.sampleCollectionAuthority,
            this.showErrors || this.isDCFCompleted(),
            false,
            false
        );
    }

    get testCoordinator(): AbstractControl | null {
        return this.form.get('testCoordinator');
    }

    get testingAuthority(): AbstractControl | null {
        return this.form.get('testingAuthority');
    }

    get testingAuthorityHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.testingAuthority,
            this.showErrors || this.isDCFCompleted(),
            false,
            false
        );
    }

    get testingOrder(): AbstractControl | null {
        return this.form.get('testingOrder');
    }
}
