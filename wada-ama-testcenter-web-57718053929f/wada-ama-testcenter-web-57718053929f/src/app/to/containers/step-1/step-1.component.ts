import * as moment from 'moment';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { CanComponentDeactivate } from '@shared/guards';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ConflictException } from '@core/models';
import { distinctUntilChanged, filter, map, startWith, take, tap } from 'rxjs/operators';
import { environment } from '@env';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import {
    Country,
    CountryWithRegions,
    FieldsSecurity,
    InfoBubbleSourceEnum,
    ListItem,
    MajorEvent,
    Region,
    StatusEnum,
    TOFormControls,
} from '@shared/models';
import { select, Store } from '@ngrx/store';
import * as fromRootStore from '@core/store';
import {
    OrganizationRelationship,
    AuthorizationInformation,
    SectionAuthorizationAutoCompletes,
    TestTimingEnum,
    TestingOrderMode,
    StepsSection,
} from '@to/models';
import {
    CalendarUtils,
    controlWasTouchedAndHasWarnings,
    dateObservable,
    fieldRequired,
    isDateValid,
    isNotNull,
    isNotUndefined,
    latinize,
    numberOfErrorPerCategoryValidation,
    numberOfErrorsPerCategory,
    NumberOfErrorsPerCategory,
    isEqual,
    scrollELementById,
    validateCreatorOfTO,
    validateDateFormat,
    validateMaxDate,
    validateMinDate,
    validateServiceProvider,
    validateTASharingRuleAccess,
    ValidationCategory,
    wadaShortName,
    withCategory,
    deepEqual,
    updateValidators,
} from '@shared/utils';
import * as fromAutoCompletesStore from '@autocompletes/store';
import * as fromStore from '@to/store';

type Moment = moment.Moment;

@Component({
    selector: 'app-step-1',
    templateUrl: './step-1.component.html',
    styleUrls: ['./step-1.component.scss'],
})
export class Step1Component extends CalendarUtils implements CanComponentDeactivate, OnInit, OnDestroy {
    readonly adamsUrl = environment.adamsUrl;

    readonly controls = TOFormControls;

    readonly infoBubbleSource = InfoBubbleSourceEnum.Green;

    readonly testTimingEnum = TestTimingEnum;

    readonly toModeType = TestingOrderMode;

    @ViewChild('firstFormElement', { static: true })
    firstFormElement?: ElementRef;

    behalfOfSCA$: Observable<ListItem | null> = this.store.select(fromStore.getTOBehalfOfSCA);

    competitionCategories$: Observable<Array<ListItem>> = this.store.pipe(
        select(fromAutoCompletesStore.getAutoCompletesCompetitionCategories)
    );

    fieldsSecurity$: Observable<FieldsSecurity | null> = this.store.select(fromStore.getFieldsSecurity);

    hasDCFs$: Observable<boolean> = this.store.select(fromStore.getTO).pipe(
        map((to) => {
            const dcfIds = to?.tests.filter((test) => test.dcfId !== null);
            return (dcfIds?.length || 0) > 0;
        })
    );

    isEditMode$: Observable<boolean> = this.store.pipe(
        select(fromStore.getMode),
        map((mode) => mode === TestingOrderMode.Edit)
    );

    isIssued$: Observable<boolean> = this.store.select(fromStore.getIsIssued);

    locale$: Observable<string> = this.store.select(fromRootStore.getLocale);

    majorEvents$: Observable<Array<ListItem>> = this.store.pipe(select(fromStore.getMajorEvents));

    maxNumberAdos$: Observable<number | null> = this.store.pipe(
        select(fromRootStore.getMaxNumberAdos),
        map((max) => max || 0)
    );

    notificationSuggestionsSubject = new BehaviorSubject<Array<ListItem>>([]);

    notificationSuggestions$ = this.notificationSuggestionsSubject.asObservable();

    selectedCountryIdSubject = new BehaviorSubject<string>('');

    selectedCountryId$ = this.selectedCountryIdSubject.asObservable();

    selectedMajorEventSubject = new BehaviorSubject<ListItem>(new ListItem());

    selectedMajorEvent$ = this.selectedMajorEventSubject.asObservable();

    toMode$: Observable<TestingOrderMode> = this.store.select(fromStore.getMode);

    areAuthorityFieldsInvalid = false;

    authorization: AuthorizationInformation = new AuthorizationInformation();

    autoCompletes: SectionAuthorizationAutoCompletes | null = null;

    conflictException: ConflictException | undefined = undefined;

    countries: Array<CountryWithRegions> = [];

    hasMajorEventBeenSelected = false;

    hasOptimisticLockException = false;

    hasSaveConflict = false;

    hasTestingOrderTests = false;

    maxStartDate: Moment | undefined = undefined;

    minEndDate: Moment | undefined = undefined;

    organizationOfTA = null;

    sendToItems = new Array<ListItem>();

    showErrors = false;

    removeItem: ListItem | undefined = undefined;

    saveError = false;

    toCreator: ListItem | null = null;

    toMode = '';

    toStatus?: StatusEnum = undefined;

    /**
     * Form control being initialized, part of the validations are set only when the autocompletes are retrieved
     */
    form = new FormGroup(
        {
            testType: new FormControl('', [withCategory(Validators.required, ValidationCategory.Mandatory)]),
            majorEvent: new FormControl('', []),
            testTiming: new FormControl('', [withCategory(Validators.required, ValidationCategory.Mandatory)]),
            startDate: new FormControl('', []),
            endDate: new FormControl('', []),
            competitionCategory: new FormControl('', []),
            competitionName: new FormControl('', []),
            country: new FormControl(undefined, []),
            region: new FormControl(undefined, []),
            city: new FormControl(undefined, []),
            adoReferenceNumber: new FormControl(undefined, []),
            testingAuthority: new FormControl(undefined, [
                withCategory(fieldRequired('description'), ValidationCategory.MandatoryDraft),
            ]),
            feeForService: new FormControl(false, []),
            sampleCollectionAuthority: new FormControl(undefined, [
                withCategory(fieldRequired('description'), ValidationCategory.MandatoryDraft),
            ]),
            grantSCAWriteAccess: new FormControl(false, [
                withCategory(Validators.required, ValidationCategory.Mandatory),
            ]),
            resultManagementAuthority: new FormControl(undefined, [
                withCategory(fieldRequired('description'), ValidationCategory.MandatoryDraft),
            ]),
            testCoordinator: new FormControl(undefined, []),
            notificationTo: new FormControl([], []),
            descriptionOfTesting: new FormControl(undefined, []),
        },
        { updateOn: 'blur' }
    );

    private subscriptions = new Subscription();

    constructor(private store: Store<fromRootStore.IState>) {
        super();
    }

    ngOnInit(): void {
        this.store.dispatch(fromStore.Step1GetAutoCompletes());

        this.addConflictExceptionSubscriptions();
        this.addSaveErrorSubscriptions();
        this.addStep1ErrorsSubscriptions();
        this.addAuthorizationSubscriptions();
        this.addSubmitCurrentStepSubscriptions();
        this.addTestingOrderModeSubscriptions();
        this.addStatusSubscriptions();
        this.addOrganizationSubscriptions();
        this.addAutoCompleteSubscriptions();
        this.addDateSubscriptions();
        this.addCountrySubscriptions();
        this.addMajorEventSubscriptions();
        this.addMajorEvents();
        this.addTestingAuthoritySubscriptions();
        this.addTestingOrderTestsSubscription();

        setTimeout(() => this.firstFormElement && this.firstFormElement.nativeElement.focus());
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    canDeactivate(): Observable<boolean> {
        this.submitForm();

        // Element Id notifications is gonna be implemented in the future (Notifications Warnings and Errors at the top)
        return this.store.pipe(select(fromStore.getIsCurrentStepValid)).pipe(
            take(1),
            tap((valid) => !valid && setTimeout(() => scrollELementById('notifications')))
        );
    }

    competitionCategorySuggestions = (token: string): Observable<Array<ListItem>> => {
        const latinizedToken = latinize(token.toLocaleLowerCase());
        return this.competitionCategories$.pipe(
            map((suggestions: Array<ListItem>) =>
                suggestions.filter(
                    (c: ListItem) => latinize(c.description.toLocaleLowerCase()).indexOf(latinizedToken) >= 0
                )
            )
        );
    };

    countrySuggestions = (token: string): Observable<Array<Country>> => {
        const latinizedToken = latinize(token.toLocaleLowerCase());
        return this.store.pipe(select(fromAutoCompletesStore.getAutoCompletesCountriesWithRegions)).pipe(
            map((countriesWithRegions: Array<CountryWithRegions>) =>
                countriesWithRegions.filter(
                    (c: CountryWithRegions) => latinize(c.name.toLocaleLowerCase()).indexOf(latinizedToken) >= 0
                )
            ),
            map((list: Array<CountryWithRegions>) =>
                list.map((c: CountryWithRegions) => new Country({ id: c.id, name: c.name }))
            )
        );
    };

    notificationToSuggestions = (token: string): Observable<Array<ListItem>> => {
        const latinizedToken = latinize(token.toLocaleLowerCase());
        const testingAuthorityId =
            this.testingAuthority && this.testingAuthority.value && this.testingAuthority.value.id
                ? this.testingAuthority.value.id
                : null;
        return this.notificationSuggestions$.pipe(
            map((suggestions: Array<ListItem>) => {
                return suggestions.filter(
                    // By default the TA and Wada Agency is not part of the list
                    (suggestion: ListItem): boolean =>
                        suggestion.id !== testingAuthorityId &&
                        suggestion.name !== wadaShortName &&
                        latinize(suggestion.displayDescriptionName.toLocaleLowerCase()).indexOf(latinizedToken) >= 0
                );
            })
        );
    };

    onNotificationToSelected(selected: Array<ListItem>): void {
        if (this.notificationTo) {
            this.notificationTo.setValue(selected);
        }
    }

    regionSuggestions = (token: string): Observable<Array<Region>> => {
        const latinizedToken = latinize(token.toLocaleLowerCase());
        return combineLatest([
            this.selectedCountryId$,
            this.store.pipe(select(fromAutoCompletesStore.getAutoCompletesCountriesWithRegions)),
        ]).pipe(
            map(([id, countriesWithRegions]: [string, Array<CountryWithRegions>]) =>
                countriesWithRegions.find((country: CountryWithRegions) => country.id === id)
            ),
            filter(isNotUndefined),
            map((c: CountryWithRegions) =>
                c.regions.filter(
                    (r: Region): boolean => latinize(r.name.toLocaleLowerCase()).indexOf(latinizedToken) >= 0
                )
            )
        );
    };

    resultManagementSuggestions = (token: string): Observable<Array<ListItem>> => {
        const latinizedToken = latinize(token.toLocaleLowerCase());
        return this.store
            .pipe(select(fromAutoCompletesStore.getAutoCompletesAdos))
            .pipe(
                map((suggestions: Array<ListItem>) =>
                    suggestions.filter(
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
        return this.store
            .pipe(select(fromAutoCompletesStore.getAutoCompletesConcatOrganizations))
            .pipe(
                map((suggestions: Array<ListItem>) =>
                    suggestions.filter(
                        (sampleCollectionAuthority: ListItem): boolean =>
                            latinize(sampleCollectionAuthority.displayDescriptionName.toLocaleLowerCase()).indexOf(
                                latinizedToken
                            ) >= 0
                    )
                )
            );
    };

    selectCountry(country: Country): void {
        this.selectedCountryIdSubject.next(country?.id || '');
        this.region?.patchValue(undefined);
    }

    selectedMajorEvent(majorEvent: ListItem): void {
        this.store
            .pipe(select(fromStore.getMajorEvent))
            .pipe(take(1))
            .subscribe((majorEventFromStore) => {
                if (
                    majorEvent &&
                    majorEvent.id &&
                    (!majorEventFromStore || majorEventFromStore.id !== majorEvent.id.toString())
                ) {
                    this.hasMajorEventBeenSelected = true;
                    this.selectedMajorEventSubject.next(majorEvent);
                    this.store.dispatch(
                        fromStore.Step1GetMajorEvent({
                            majorEventId: majorEvent.id.toString(),
                        })
                    );
                } else if (!majorEvent && majorEventFromStore) {
                    this.store.dispatch(fromStore.Step1ResetMajorEvent());
                }
            });
    }

    selectedTA(testingAuthority: ListItem): void {
        if (testingAuthority) {
            if (this.notificationTo && this.notificationTo.value) {
                // Item to be removed from the NotificationTo in case is one of the selected items
                this.removeItem = this.notificationTo.value.find(
                    (element: ListItem) => element.id === testingAuthority.id
                );
            }
        }
    }

    selectedTestType(inCompetition: boolean): void {
        if (!inCompetition) {
            // Reset the competition data when the testing order is Out of Competition
            if (this.majorEvent?.value) {
                this.store.dispatch(fromStore.Step1ResetCompetition());
            }
            if (this.majorEvent) {
                this.majorEvent.setValue(null);
            }
            if (this.testTiming) {
                this.testTiming?.setValue(null);
            }
        }
    }

    setCountry(countryId: string): void {
        if (this.country && this.autoCompletes) {
            const defaultCountry = this.autoCompletes.countriesWithRegions.find((country) => country.id === countryId);
            if (defaultCountry) {
                const country = new Country({
                    id: defaultCountry.id,
                    name: defaultCountry.name,
                });
                this.country.setValue(country);
                this.selectCountry(country);
            }
        }
    }

    testCoordinatorSuggestions = (token: string): Observable<Array<ListItem>> => {
        const latinizedToken = latinize(token.toLocaleLowerCase());
        return this.store
            .pipe(select(fromAutoCompletesStore.getAutoCompletesConcatOrganizations))
            .pipe(
                map((suggestions: Array<ListItem>) =>
                    suggestions.filter(
                        (testCoordinator: ListItem): boolean =>
                            latinize(testCoordinator.displayDescriptionName.toLocaleLowerCase()).indexOf(
                                latinizedToken
                            ) >= 0
                    )
                )
            );
    };

    testingAuthoritySuggestions = (token: string): Observable<Array<ListItem>> => {
        const latinizedToken = latinize(token.toLocaleLowerCase());
        return this.store
            .pipe(select(fromAutoCompletesStore.getAutoCompletesAdos))
            .pipe(
                map((suggestions: Array<ListItem>) =>
                    suggestions.filter(
                        (testingAuthority: ListItem): boolean =>
                            latinize(testingAuthority.displayDescriptionName.toLocaleLowerCase()).indexOf(
                                latinizedToken
                            ) >= 0
                    )
                )
            );
    };

    updateEndDateValidator(): void {
        if (this.endDate) {
            updateValidators(this.endDate, [
                withCategory(Validators.required, ValidationCategory.Mandatory),
                withCategory(validateMinDate(this.minEndDate), ValidationCategory.Business),
                withCategory(validateDateFormat, ValidationCategory.Format),
            ]);
        }
    }

    updateStartDateValidator(): void {
        if (this.startDate) {
            updateValidators(this.startDate, [
                withCategory(Validators.required, ValidationCategory.Mandatory),
                withCategory(validateMaxDate(this.maxStartDate), ValidationCategory.Business),
                withCategory(validateDateFormat, ValidationCategory.Format),
            ]);
        }
    }

    updateTestingAuthorityValidator(
        organizationRelationships: Array<OrganizationRelationship>,
        creator: ListItem | null,
        serviceProvider: Array<ListItem>,
        userOrganization: ListItem | null
    ): void {
        if (this.testingAuthority) {
            updateValidators(this.testingAuthority, [
                withCategory(fieldRequired('description'), ValidationCategory.MandatoryDraft),
                withCategory(validateCreatorOfTO(creator, userOrganization), ValidationCategory.Warning),
                withCategory(validateServiceProvider(serviceProvider, userOrganization), ValidationCategory.Warning),
                withCategory(
                    validateTASharingRuleAccess(organizationRelationships, userOrganization),
                    ValidationCategory.Warning
                ),
            ]);
        }
    }

    validateAuthorityFields(): void {
        this.areAuthorityFieldsInvalid =
            this.testingAuthority?.value === undefined ||
            (this.testingAuthority?.value !== null && this.testingAuthority?.value.displayDescriptionName === '') ||
            this.resultManagementAuthority?.value === undefined ||
            (this.resultManagementAuthority?.value !== null &&
                this.resultManagementAuthority?.value.displayDescriptionName === '') ||
            this.sampleCollectionAuthority?.value === undefined ||
            (this.sampleCollectionAuthority?.value !== null &&
                this.sampleCollectionAuthority?.value.displayDescriptionName === '');

        this.store.dispatch(fromStore.SetDisableSaving({ disableSaving: this.areAuthorityFieldsInvalid }));
    }

    private addAuthorizationSubscriptions() {
        this.subscriptions.add(
            this.store
                .pipe(select(fromStore.getTOAuthorization))
                .subscribe((authorization: AuthorizationInformation) => {
                    if (!deepEqual(this.authorization, authorization)) {
                        this.authorization = authorization;
                        if (authorization.notificationTo) {
                            this.sendToItems = authorization.notificationTo.map((item: ListItem) => item);
                        }
                        this.form.patchValue(authorization);
                    }
                })
        );
    }

    private addAutoCompleteSubscriptions() {
        this.subscriptions.add(
            this.store
                .pipe(select(fromAutoCompletesStore.getTestingOrderSectionAuthorizationAutoCompletes))
                .pipe(distinctUntilChanged())
                .subscribe((autoCompletes: SectionAuthorizationAutoCompletes) => {
                    this.autoCompletes = autoCompletes;
                    this.notificationSuggestionsSubject.next(autoCompletes.ados);
                })
        );
    }

    private addConflictExceptionSubscriptions() {
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
    }

    private addCountrySubscriptions() {
        // Triggers the first selection of a country if there is any value coming from the retrieved TO
        if (this.country) {
            this.subscriptions.add(
                this.country.valueChanges
                    .pipe(startWith(this.country.value), filter(isNotNull), take(1))
                    .subscribe((country: Country) => {
                        this.selectedCountryIdSubject.next(country?.id || '');
                    })
            );
        }
    }

    private addDateSubscriptions() {
        // Watches dates in order to update the date validators
        if (this.startDate && this.endDate) {
            this.subscriptions.add(
                combineLatest([dateObservable(this.startDate), dateObservable(this.endDate)]).subscribe(
                    ([startDate, endDate]: [Moment, Moment]) => {
                        this.maxStartDate = isDateValid(endDate) ? moment(endDate) : undefined;
                        this.minEndDate = isDateValid(startDate) ? moment(startDate) : undefined;
                        this.updateStartDateValidator();
                        this.updateEndDateValidator();
                    }
                )
            );
        }
    }

    private addMajorEventSubscriptions() {
        if (this.majorEvent) {
            this.subscriptions.add(
                combineLatest([
                    this.store.pipe(select(fromStore.getMajorEvent)),
                    this.store.pipe(select(fromStore.getMajorEvents)),
                ])
                    .pipe(
                        distinctUntilChanged(
                            (prev, curr) =>
                                prev &&
                                curr &&
                                prev[0] !== null &&
                                curr[0] !== null &&
                                prev[0].id === curr[0].id &&
                                isEqual(prev[1], curr[1])
                        )
                    )
                    .subscribe(([majorEvent, majorEvents]: [MajorEvent | null, Array<ListItem>]) => {
                        if (this.hasMajorEventBeenSelected) {
                            this.updateDataFromMajorEvent(majorEvent, majorEvents);
                            this.hasMajorEventBeenSelected = false;
                        }
                    })
            );
        }
    }

    private addMajorEvents(): void {
        const numberPriorMonths = 12;
        this.store.dispatch(
            fromStore.GetMajorEvents({
                numberPriorMonths: numberPriorMonths.toString(),
            })
        );
    }

    private addOrganizationSubscriptions() {
        this.subscriptions.add(
            combineLatest([
                this.store.pipe(select(fromAutoCompletesStore.getAutoCompletesOrganizationRelationships)),
                this.store.pipe(select(fromStore.getTOCreator)),
                this.store.pipe(select(fromAutoCompletesStore.getAutoCompletesConcatOrganizations)),
                this.store.pipe(select(fromRootStore.getOrganizationAsListItem)),
            ])
                .pipe(distinctUntilChanged())
                .subscribe(
                    ([organizationRelationships, creator, serviceProviders, userOrganization]: [
                        Array<OrganizationRelationship>,
                        ListItem | null,
                        Array<ListItem>,
                        ListItem | null
                    ]) => {
                        this.toCreator = creator;
                        this.updateTestingAuthorityValidator(
                            organizationRelationships,
                            creator,
                            serviceProviders,
                            userOrganization
                        );
                    }
                )
        );
    }

    private addSaveErrorSubscriptions() {
        this.subscriptions.add(
            this.store.select(fromStore.getError).subscribe((error: boolean | null) => {
                this.saveError = Boolean(error);
            })
        );
    }

    private addStatusSubscriptions() {
        this.subscriptions.add(
            this.store.select(fromStore.getTOStatus).subscribe((status) => {
                this.toStatus = status;
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
    }

    private addStep1ErrorsSubscriptions() {
        this.subscriptions.add(
            this.store.pipe(select(fromStore.getStep1ShowErrors)).subscribe((show) => {
                this.showErrors = show;
            })
        );
    }

    private addSubmitCurrentStepSubscriptions() {
        this.subscriptions.add(
            this.store
                .select(fromStore.getSubmitCurrentStep)
                .pipe(distinctUntilChanged(), filter(Boolean))
                .subscribe(() => this.submitForm())
        );
    }

    private addTestingOrderModeSubscriptions() {
        this.subscriptions.add(
            this.toMode$.subscribe((mode: TestingOrderMode) => {
                this.toMode = mode.toString();
            })
        );
    }

    private addTestingAuthoritySubscriptions() {
        if (this.testingAuthority) {
            this.subscriptions.add(
                this.testingAuthority.valueChanges.subscribe((testingAuthority) => {
                    if (testingAuthority && testingAuthority.id) {
                        if (this.notificationTo && this.notificationTo.value) {
                            // Item to be removed from the NotificationTo in case is one of the selected items
                            this.removeItem = this.notificationTo.value.find(
                                (element: ListItem) => element.id === testingAuthority.id
                            );
                        }
                    }
                })
            );
        }
    }

    private addTestingOrderTestsSubscription() {
        this.subscriptions.add(
            this.store.select(fromStore.getTOTests).subscribe((tests) => {
                if (tests.length) this.hasTestingOrderTests = true;
            })
        );
    }

    private controlHasErrors(control: AbstractControl | null): boolean {
        // We don't ignore mandatory errors when the status is Completed
        // We also assume that for each control, we only have one error, the most critical one
        if (control && control.invalid && (control.dirty || control.touched || this.showErrors)) {
            const required = Object.values(control.errors || {})
                .map((error) => error.category)
                .includes(ValidationCategory.Mandatory);
            const warning = Object.values(control.errors || {})
                .map((error) => error.category)
                .includes(ValidationCategory.Warning);
            return required ? Boolean(this.toStatus === StatusEnum.Completed) : !warning;
        }
        return false;
    }

    private submitForm(): void {
        this.store.dispatch(fromStore.Step1SubmitForm({ values: this.form.value }));
    }

    private updateDataFromMajorEvent(majorEvent: MajorEvent | null, majorEvents: ListItem[]) {
        // Checks if major game event is included in the list of Major Game Events
        const isMajorEventIncluded =
            majorEvent &&
            majorEvent.id &&
            majorEvents.map((majEvent) => majEvent && majEvent.id && majEvent.id.toString()).includes(majorEvent.id);
        if (isMajorEventIncluded && this.majorEvent) {
            this.majorEvent.setValue(majorEvent);
            this.updateDatesDataFromMajorEvent(majorEvent);
            this.updateLocationDataFromMajorEvent(majorEvent);
            this.updateOrganizationsDataFromMajorEvent(majorEvent);
        } else if (this.majorEvent) {
            this.majorEvent.setValue(null);
        }
    }

    private updateDatesDataFromMajorEvent(majorEvent: MajorEvent | null) {
        if (this.startDate && majorEvent && majorEvent.startDate) {
            this.startDate.setValue(moment(majorEvent.startDate));
        }
        if (this.endDate && majorEvent && majorEvent.endDate) {
            this.endDate.setValue(moment(majorEvent.endDate));
        }
    }

    private updateLocationDataFromMajorEvent(majorEvent: MajorEvent | null) {
        if (this.country) {
            if (majorEvent && majorEvent.country && majorEvent.country.id) {
                this.setCountry(majorEvent.country.id.toString());
            }
            if (this.region && majorEvent && majorEvent.region) {
                this.region.setValue(majorEvent.region);
            }
        }
    }

    private updateOrganizationsDataFromMajorEvent(majorEvent: MajorEvent | null) {
        if (this.testingAuthority && majorEvent && majorEvent.testAuthority) {
            this.testingAuthority.setValue(majorEvent.testAuthority);
            this.testingAuthority.markAsDirty();
        }
        if (this.sampleCollectionAuthority && majorEvent && majorEvent.sampleCollectionAuthority) {
            this.sampleCollectionAuthority.setValue(majorEvent.sampleCollectionAuthority);
            this.sampleCollectionAuthority.markAsDirty();
        }
        if (this.resultManagementAuthority && majorEvent && majorEvent.resultManagementAuthority) {
            this.resultManagementAuthority.setValue(majorEvent.resultManagementAuthority);
            this.resultManagementAuthority.markAsDirty();
        }
    }

    get adoReferenceNumber(): AbstractControl | null {
        return this.form.get('adoReferenceNumber');
    }

    get city(): AbstractControl | null {
        return this.form.get('city');
    }

    get competitionCategory(): AbstractControl | null {
        return this.form.get('competitionCategory');
    }

    get competitionName(): AbstractControl | null {
        return this.form.get('competitionName');
    }

    get country(): AbstractControl | null {
        return this.form.get('country');
    }

    get descriptionOfTesting(): AbstractControl | null {
        return this.form.get('descriptionOfTesting');
    }

    get descriptionOfTestingHasErrors(): boolean {
        return this.controlHasErrors(this.descriptionOfTesting);
    }

    get endDate(): AbstractControl | null {
        return this.form.get('endDate');
    }

    get endDateHasErrors(): boolean {
        return this.controlHasErrors(this.endDate);
    }

    get feeForService(): AbstractControl | null {
        return this.form.get('feeForService');
    }

    get formHasErrors(): boolean {
        return (
            this.showErrors &&
            this.form.invalid &&
            (this.descriptionOfTestingHasErrors ||
                this.endDateHasErrors ||
                this.grantSCAWriteAccessHasErrors ||
                this.notificationToHasErrors ||
                this.resultManagementAuthorityHasErrors ||
                this.sampleCollectionAuthorityHasErrors ||
                this.startDateHasErrors ||
                this.testCoordinatorHasErrors ||
                this.testingAuthorityHasErrors ||
                this.testTimingHasErrors)
        );
    }

    get grantSCAWriteAccess(): AbstractControl | null {
        return this.form.get('grantSCAWriteAccess');
    }

    get grantSCAWriteAccessHasErrors(): boolean {
        return this.controlHasErrors(this.grantSCAWriteAccess);
    }

    get majorEvent(): AbstractControl | null {
        return this.form.get('majorEvent');
    }

    get notificationTo(): AbstractControl | null {
        return this.form.get('notificationTo');
    }

    get notificationToHasErrors(): boolean {
        return this.controlHasErrors(this.notificationTo);
    }

    get region(): AbstractControl | null {
        return this.form.get('region');
    }

    get resultManagementAuthority(): AbstractControl | null {
        return this.form.get('resultManagementAuthority');
    }

    get resultManagementAuthorityHasErrors(): boolean {
        return this.controlHasErrors(this.resultManagementAuthority);
    }

    get sampleCollectionAuthority(): AbstractControl | null {
        return this.form.get('sampleCollectionAuthority');
    }

    get sampleCollectionAuthorityHasErrors(): boolean {
        return this.controlHasErrors(this.sampleCollectionAuthority);
    }

    get startDate(): AbstractControl | null {
        return this.form.get('startDate');
    }

    get startDateHasErrors(): boolean {
        return this.controlHasErrors(this.startDate) && !this.showCalendar;
    }

    get testCoordinator(): AbstractControl | null {
        return this.form.get('testCoordinator');
    }

    get testCoordinatorHasErrors(): boolean {
        return this.controlHasErrors(this.testCoordinator);
    }

    get testTiming(): AbstractControl | null {
        return this.form.get('testTiming');
    }

    get testTimingHasErrors(): boolean {
        return this.controlHasErrors(this.testTiming);
    }

    get testType(): AbstractControl | null {
        return this.form.get('testType');
    }

    get testingAuthority(): AbstractControl | null {
        return this.form.get('testingAuthority');
    }

    get testingAuthorityHasErrors(): boolean {
        return this.controlHasErrors(this.testingAuthority);
    }

    get testingAuthorityHasWarnings(): boolean {
        return controlWasTouchedAndHasWarnings(this.testingAuthority);
    }
}
