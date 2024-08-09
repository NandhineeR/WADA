import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, first, map, take, tap } from 'rxjs/operators';
import { CanComponentDeactivate } from '@shared/guards';
import * as fromAutoCompletesStore from '@autocompletes/store';
import * as fromRootStore from '@core/store';
import * as fromStore from '@to/store';
import {
    AthleteAndAnalysesInformation,
    SectionAthleteAndAnalysesAutoCompletes,
    StepsSection,
    TestRow,
    TestingOrderMode,
} from '@to/models';
import { FieldsSecurity, LaboratoryNote, MAX_NUMBER_OF_TESTS_WARNING, TOFormControls } from '@shared/models';
import { scrollELementById } from '@shared/utils/html-util';
import { NumberOfErrorsPerCategory } from '@shared/utils/form-util';
import { ConflictException } from '@core/models';
import { athleteAndAnalysesSectionMissingFields } from '@to/utils';

@Component({
    selector: 'app-step-2',
    templateUrl: './step-2.component.html',
    styleUrls: ['./step-2.component.scss'],
})
export class Step2Component implements CanComponentDeactivate, OnInit, AfterViewInit, OnDestroy {
    readonly controls = TOFormControls;

    autoCompletes$: Observable<SectionAthleteAndAnalysesAutoCompletes> = this.store.pipe(
        select(fromAutoCompletesStore.getTestingOrderSectionAthleteAndAnalysesAutoCompletes)
    );

    fieldsSecurity$: Observable<FieldsSecurity | null> = this.store.select(fromStore.getFieldsSecurity);

    isEditMode$: Observable<boolean> = this.store.pipe(
        select(fromStore.getMode),
        map((mode) => mode === TestingOrderMode.Edit)
    );

    isStepValid$: Observable<boolean> = this.store.pipe(select(fromStore.getIsCurrentStepValid));

    changingValue: Subject<boolean> = new Subject();

    conflictException: ConflictException | undefined = undefined;

    hasOptimisticLockException = false;

    hasSaveConflict = false;

    laboratoryNotes: Array<LaboratoryNote> = [];

    route: fromRootStore.RouterStateUrl | null = null;

    saveError = false;

    testRows: Array<TestRow> = [];

    private subscriptions = new Subscription();

    constructor(private store: Store<fromRootStore.IState>) {}

    ngOnInit(): void {
        /**
         * It's no longer in use since all step 2 autocompletes are now retrieved in the preload action.
         * this.store.dispatch(fromStore.InitStep2());
         */

        this.subscriptions.add(
            this.store.select(fromStore.getTOLaboratoryNotes).subscribe((notes: Array<LaboratoryNote> | null) => {
                if (notes) {
                    this.laboratoryNotes = notes;
                }
            })
        );

        this.subscriptions.add(
            this.store.select(fromStore.getTOTestRows).subscribe((testRows: Array<TestRow> | null) => {
                if (testRows) {
                    this.testRows = testRows;
                    const athleteAndAnalyses: AthleteAndAnalysesInformation = new AthleteAndAnalysesInformation();
                    athleteAndAnalyses.tests = testRows;
                    this.store.dispatch(
                        fromStore.SubmitCurrentStepErrors({
                            section: StepsSection.AthleteAndAnalysesSection,
                            errors: this.buildError(athleteAndAnalyses),
                        })
                    );
                }
            })
        );

        this.subscriptions.add(
            this.store
                .pipe(select(fromRootStore.getActiveRoute), first())
                .subscribe((route: fromRootStore.RouterStateUrl) => {
                    if (this.route === null) {
                        this.route = route;
                    }
                })
        );

        this.subscriptions.add(
            this.store
                .select(fromStore.getConflictException)
                .subscribe((conflictException: ConflictException | undefined) => {
                    this.hasSaveConflict = Boolean(conflictException);
                    this.conflictException = conflictException;
                    if (conflictException) {
                        this.hasOptimisticLockException = conflictException.hasOptimisticLockException();
                    }
                })
        );

        this.subscriptions.add(
            this.store.select(fromStore.getError).subscribe((error: boolean | null) => {
                this.saveError = Boolean(error);
            })
        );

        this.changingValue.subscribe(() => {
            const athleteAndAnalyses: AthleteAndAnalysesInformation = new AthleteAndAnalysesInformation();
            athleteAndAnalyses.laboratoryNotes = this.laboratoryNotes;
            this.store.dispatch(fromStore.Step2SubmitForm({ values: athleteAndAnalyses }));
        });
    }

    ngAfterViewInit(): void {
        this.subscriptions.add(
            this.store
                .select(fromStore.getSubmitCurrentStep)
                .pipe(distinctUntilChanged(), filter(Boolean))
                .subscribe(() => this.submitEmptyForm())
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
        this.store.dispatch(fromStore.Step2ClearAthleteGroups());
    }

    buildError(athleteAndAnalyses: AthleteAndAnalysesInformation): NumberOfErrorsPerCategory {
        const sportDisciplineErrors = athleteAndAnalysesSectionMissingFields(athleteAndAnalyses);
        return {
            Format: 0,
            Business: 0,
            Mandatory: 0,
            Warning: 0,
            MandatoryDraft: sportDisciplineErrors,
        };
    }

    canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
        this.changingValue.next(true);

        return this.store.pipe(select(fromStore.getIsCurrentStepValid)).pipe(
            take(1),
            tap((valid) => !valid && setTimeout(() => scrollELementById('notifications')))
        );
    }

    exceedsMaxTestThreshold(): boolean {
        return this.testRows.length > MAX_NUMBER_OF_TESTS_WARNING;
    }

    submitData(data: any): void {
        const athleteAndAnalyses: AthleteAndAnalysesInformation = new AthleteAndAnalysesInformation();
        athleteAndAnalyses.tests = data.data;
        athleteAndAnalyses.laboratoryNotes = this.laboratoryNotes;
        this.store.dispatch(
            fromStore.SubmitCurrentStepErrors({
                section: StepsSection.AthleteAndAnalysesSection,
                errors: this.buildError(athleteAndAnalyses),
            })
        );
        this.store.dispatch(fromStore.Step2SubmitForm({ values: athleteAndAnalyses }));
    }

    submitEmptyForm() {
        if (this.testRows && !this.testRows.length) {
            const athleteAndAnalyses: AthleteAndAnalysesInformation = new AthleteAndAnalysesInformation();
            this.store.dispatch(fromStore.Step2SubmitForm({ values: athleteAndAnalyses }));
        }
    }
}
