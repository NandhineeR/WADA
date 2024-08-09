import { isNullOrBlank, latinize } from '@shared/utils/string-utils';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, of, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, map, startWith, take } from 'rxjs/operators';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import {
    controlHasModeRelatedErrors,
    NumberOfErrorsPerCategory,
    numberOfErrorsPerCategory,
    updateTimezoneValidators,
    ValidationCategory,
    withCategory,
} from '@shared/utils/form-util';
import { ConflictException } from '@core/models';
import {
    Country,
    CountryWithRegions,
    DCFFormControls,
    FieldsSecurity,
    ListItem,
    Participant,
    Region,
    StatusEnum,
} from '@shared/models';
import { select, Store } from '@ngrx/store';
import * as fromAutoCompletesStore from '@autocompletes/store';
import * as fromRootStore from '@core/store';
import * as fromStore from '@dcf/store';
import * as moment from 'moment';
import { calculate60minTimeSlot } from '@shared/utils/calculate-60-min-timeslot';
import { numberOfErrorPerCategoryValidation } from '@shared/utils/number-of-error-validation';
import {
    CalendarUtils,
    dateIsRemoved,
    fieldRequired,
    isNotUndefined,
    validateDateFormat,
    validateDatetimeFormat,
    validateTimezone,
} from '@shared/utils';
import { trigger } from '@angular/animations';
import { FADE_IN, FADE_OUT } from '@core/components/animation/animation.component';
import { ParticipantInputComponent } from '@shared/components';
import {
    NotificationInformation,
    SectionNotificationAutoCompletes,
    StepsSection,
    Timezone,
    TimezoneField,
} from '@dcf/models';
import { SetTimezoneDefaultModalComponent } from '@dcf/components/timezone-default-modal/timezone-default-modal.component';

type Moment = moment.Moment;

@Component({
    selector: 'app-notification-input',
    templateUrl: './notification-input.component.html',
    styleUrls: ['./notification-input.component.scss'],
    animations: [trigger('fadeInOut', [FADE_IN, FADE_OUT])],
})
export class NotificationInputComponent extends CalendarUtils implements OnInit, OnDestroy {
    readonly controls = DCFFormControls;

    readonly locale = 'en';

    @ViewChild('notifyingChaperoneParticipantInput') notifyingChaperoneParticipantInput?: ParticipantInputComponent;

    @ViewChild('setTimezoneDefaultModalRef', { static: true })
    setTimezoneDefaultModalRef?: SetTimezoneDefaultModalComponent;

    accessible$: Observable<boolean | null> = this.store.pipe(select(fromStore.getAthleteAccessible));

    autoCompletes$: Observable<SectionNotificationAutoCompletes> = this.store.pipe(
        select(fromAutoCompletesStore.getDCFSectionNotificationAutoCompletesRefactor),
        distinctUntilChanged(
            (previous: SectionNotificationAutoCompletes, current: SectionNotificationAutoCompletes) =>
                previous.notifyingChaperones.length === current.notifyingChaperones.length &&
                previous.identificationDocuments.length === current.identificationDocuments.length &&
                previous.selectionCriteria.length === current.selectionCriteria.length
        )
    );

    chaperones$: Observable<Array<Participant>> = this.autoCompletes$.pipe(
        map((suggestions: SectionNotificationAutoCompletes) => suggestions.notifyingChaperones)
    );

    countriesWithRegions$: Observable<Array<CountryWithRegions>> = this.store.select(
        fromAutoCompletesStore.getAutoCompletesCountriesWithRegions
    );

    dcfId$: Observable<string> = this.store
        .select(fromRootStore.getActiveRoute)
        .pipe(map((state: fromRootStore.RouterStateUrl) => state.params.id || ''));

    fieldsSecurity$: Observable<FieldsSecurity | null> = this.store.select(fromStore.getFieldsSecurity);

    filledTimezones$: Observable<Array<TimezoneField>> = this.store.pipe(select(fromStore.getTimezoneFields));

    inTimeSlot$: Observable<boolean> = of(false);

    isEditMode$: Observable<boolean> = this.store.select(fromStore.isEditMode);

    isMatchingResultType1$: Observable<boolean> = this.store.select(fromStore.isMatchingResultType1);

    isMatchingResultType3or2or1$: Observable<boolean> = this.store.select(fromStore.isMatchingResultType3or2or1);

    locale$: Observable<string> = this.store.select(fromRootStore.getLocale);

    route$: Observable<string> = this.store
        .select(fromRootStore.getActiveRouteUrl)
        .pipe(map((url) => url.split('#')[0]));

    selectedCountryIdSubject = new BehaviorSubject<string>('');

    selectedCountryId$ = this.selectedCountryIdSubject.asObservable();

    timezones$: Observable<Array<Timezone>> = this.store.pipe(select(fromAutoCompletesStore.getAutoCompletesTimezones));

    accessible = false;

    conflictException: ConflictException | null = null;

    dcfStatus?: StatusEnum = undefined;

    form = new FormGroup(
        {
            advanceNotice: new FormControl(false, [withCategory(Validators.required, ValidationCategory.Mandatory)]),
            advanceNoticeReason: new FormControl('', []),
            notificationDate: new FormControl(undefined, [
                withCategory(Validators.required, ValidationCategory.Mandatory),
                withCategory(validateDateFormat, ValidationCategory.Format),
            ]),
            timezone: new FormControl(null),
            country: new FormControl(undefined, []),
            region: new FormControl(undefined, []),
            city: new FormControl('', []),
            notifyingChaperone: new FormControl(undefined, [
                withCategory(fieldRequired('lastName'), ValidationCategory.Mandatory),
                withCategory(fieldRequired('firstName'), ValidationCategory.Mandatory),
            ]),
            identificationDocument: new FormControl(undefined, []),
            identificationDocumentType: new FormControl(undefined, []),
            selectionCriteria: new FormControl(undefined, []),
        },
        { updateOn: 'blur' }
    );

    hasOptimisticLockException = false;

    hasSaveConflict = false;

    hasFilledTimezones = false;

    inCreation = false;

    isTimeSlotNull = false;

    saveError = false;

    showErrors = false;

    private subscriptions = new Subscription();

    constructor(private store: Store<fromRootStore.IState>) {
        super();
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    ngOnInit(): void {
        this.store.dispatch(fromStore.Step1Init({ section: StepsSection.NotificationSection }));

        this.subscriptions.add(
            this.store.pipe(select(fromStore.getSectionNotificationShowErrors)).subscribe((show) => {
                this.showErrors = show;
            })
        );

        this.subscriptions.add(
            this.store.select(fromRootStore.getActiveRoute).subscribe((state) => {
                this.inCreation = state.url.includes('new');
            })
        );

        this.subscriptions.add(
            this.store
                .pipe(select(fromStore.getSectionNotificationFormValues), filter(Boolean), take(1))
                .subscribe((data) => {
                    const content = data as NotificationInformation;
                    this.form.patchValue(content);
                    const selectedCountryId = content.country?.id || '';
                    this.selectedCountryIdSubject.next(selectedCountryId);
                    this.setAdvanceNoticeReasonValidation(content.advanceNotice);
                })
        );

        this.subscriptions.add(
            this.store.select(fromStore.getStatus).subscribe((status) => {
                this.dcfStatus = status;
            })
        );

        this.subscriptions.add(
            this.filledTimezones$.subscribe((filledTimezones) => {
                this.hasFilledTimezones = filledTimezones.length > 0;
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
                            section: StepsSection.NotificationSection,
                            errors,
                        })
                    );
                })
        );

        this.subscriptions.add(
            this.store
                .select(fromStore.getConflictException)
                .subscribe((conflictException: ConflictException | null) => {
                    this.conflictException = conflictException;
                    this.hasSaveConflict = Boolean(conflictException);
                    this.hasOptimisticLockException = conflictException
                        ? conflictException.hasOptimisticLockException()
                        : false;
                })
        );

        this.subscriptions.add(
            this.store.select(fromStore.getSaveError).subscribe((error: boolean | undefined) => {
                this.saveError = Boolean(error);
            })
        );

        if (!this.inCreation && this.notificationDate && this.notificationDate.value !== null) {
            this.notificationDate.setValidators([
                withCategory(dateIsRemoved, ValidationCategory.Business),
                withCategory(validateDatetimeFormat, ValidationCategory.Format),
            ]);
            this.notificationDate.updateValueAndValidity();
        }

        this.handleValueChangesEvents();
    }

    countrySuggestions = (token: string): Observable<Array<Country>> => {
        const latinizedToken = latinize(token.toLocaleLowerCase());
        return this.countriesWithRegions$.pipe(
            map((suggestions: Array<CountryWithRegions>) =>
                suggestions.filter(
                    (c: CountryWithRegions) => latinize(c.name.toLocaleLowerCase()).indexOf(latinizedToken) >= 0
                )
            ),
            map((list: Array<CountryWithRegions>) =>
                list.map((c: CountryWithRegions) => new Country({ id: c.id, name: c.name }))
            )
        );
    };

    handleValueChangesEvents(): void {
        if (this.notificationDate) {
            this.notificationDate.valueChanges
                .pipe(startWith(this.notificationDate.value))
                .subscribe((date: Moment | Date) => {
                    if (date) {
                        const momentDate = moment(date);
                        this.store.dispatch(fromStore.Step1GetTimeSlots({ date: momentDate.toDate() }));
                    }
                });
        }

        if (this.notificationDate) {
            this.notificationDate.valueChanges.pipe(startWith(this.notificationDate.value)).subscribe(() => {
                this.subscriptions.add(this.setTimeSlot());
            });
        }
    }

    isDCFCompleted() {
        return this.dcfStatus === StatusEnum.Completed;
    }

    openLinkTimezone(): void {
        window.open('https://www.timeanddate.com/time/map/', '_blank', 'toolbar=0,location=0,menubar=0');
    }

    regionSuggestions = (token: string): Observable<Array<Region>> => {
        const latinizedToken = latinize(token.toLocaleLowerCase());
        return combineLatest([this.selectedCountryId$, this.countriesWithRegions$]).pipe(
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

    resetIdentificationDocumentType(): void {
        if (this.identificationDocument?.value.specificCode !== 'OTHER') {
            this.identificationDocumentType?.patchValue('');
        }
    }

    selectCountry(country: Country): void {
        this.selectedCountryIdSubject.next(country?.id || '');
        this.region?.patchValue(undefined);
    }

    setAdvanceNoticeReason(advanceNotice: boolean): void {
        this.form.patchValue({ advanceNoticeReason: '' });
        this.setAdvanceNoticeReasonValidation(advanceNotice);
    }

    setDocumentType(): void {
        const selectedIdentificationDocument = this.identificationDocument?.value as ListItem;
        if (selectedIdentificationDocument?.specificCode !== 'OTHER') {
            this.identificationDocumentType?.patchValue(this.identificationDocument?.value?.description);
        }
    }

    setTimeSlot(): void {
        this.store.pipe(select(fromStore.getTimeSlots)).subscribe((timeSlots) => {
            if (this.notificationDate && timeSlots) {
                const hour = moment(this.notificationDate.value).hour();
                const minutes = moment(this.notificationDate.value).minutes();

                this.inTimeSlot$ = of(calculate60minTimeSlot(timeSlots, `${hour}:${minutes}`));
                this.isTimeSlotNull = false;
            } else {
                this.isTimeSlotNull = true;
            }
        });
    }

    setTimezoneDefault(timezone: Timezone): void {
        this.store.dispatch(fromStore.Step1SetTimezoneDefault({ timezoneDefault: timezone }));
    }

    showSetTimezoneDefaultModal(timezone: Timezone): void {
        if (this.setTimezoneDefaultModalRef) {
            if (this.hasFilledTimezones) {
                this.setTimezoneDefaultModalRef.show(timezone);
            } else {
                this.setTimezoneDefault(timezone);
            }
        }
    }

    submitForm(): void {
        this.setDocumentType();
        this.store.dispatch(fromStore.Step1SectionNotificationSubmitForm({ values: this.form.value }));
    }

    private setAdvanceNoticeReasonValidation(validate: boolean | null): void {
        const validators = validate ? [withCategory(Validators.required, ValidationCategory.Mandatory)] : [];
        if (this.advanceNoticeReason) {
            this.advanceNoticeReason.setValidators(validators);
            this.advanceNoticeReason.updateValueAndValidity();
        }
    }

    private updateTimezoneValidators(): void {
        if (!isNullOrBlank(this.notificationDate?.value?.toString())) {
            updateTimezoneValidators(
                this.timezone,
                validateTimezone(this.notificationDate?.value || ''),
                ValidationCategory.MandatoryDraft
            );
        } else if (this.timezone?.validator) {
            const validator = this.timezone.validator({} as AbstractControl);
            if (validator && !validator.required) {
                updateTimezoneValidators(this.timezone, Validators.required, ValidationCategory.Mandatory);
            }
        }
    }

    get advanceNotice(): AbstractControl | null {
        return this.form.get('advanceNotice');
    }

    get advanceNoticeHasErrors(): boolean {
        return controlHasModeRelatedErrors(this.advanceNotice, this.showErrors || this.isDCFCompleted(), false, false);
    }

    get advanceNoticeReason(): AbstractControl | null {
        return this.form.get('advanceNoticeReason');
    }

    get advanceNoticeReasonHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.advanceNoticeReason,
            this.showErrors && this.isDCFCompleted(),
            this.inCreation,
            this.advanceNoticeReason?.errors?.required
        );
    }

    get city(): AbstractControl | null {
        return this.form.get('city');
    }

    get cityHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.city,
            this.showErrors && this.isDCFCompleted(),
            this.inCreation,
            this.city?.errors?.required
        );
    }

    get country(): AbstractControl | null {
        return this.form.get('country');
    }

    get countryHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.country,
            this.showErrors && this.isDCFCompleted(),
            this.inCreation,
            this.country?.errors?.required
        );
    }

    get identificationDocument(): AbstractControl | null {
        return this.form.get('identificationDocument');
    }

    get identificationDocumentType(): AbstractControl | null {
        return this.form.get('identificationDocumentType');
    }

    get notificationDate(): AbstractControl | null {
        return this.form.get('notificationDate');
    }

    get notificationDateHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.notificationDate,
            this.showErrors && this.isDCFCompleted(),
            this.inCreation,
            this.notificationDate?.errors?.required
        );
    }

    get notifyingChaperone(): AbstractControl | null {
        return this.form.get('notifyingChaperone');
    }

    get notifyingChaperoneHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.notifyingChaperone,
            this.showErrors && this.isDCFCompleted(),
            this.inCreation,
            this.notifyingChaperone?.errors?.lastNameRequired || this.notifyingChaperone?.errors?.firstNameRequired
        );
    }

    get notifyingChaperoneHasFirstNameErrors(): boolean {
        return (
            ((this.notifyingChaperoneParticipantInput?.isFirstNameTouched ||
                (this.isDCFCompleted() && this.notifyingChaperoneHasErrors)) &&
                this.notifyingChaperone?.errors?.firstNameRequired) ||
            (!this.inCreation &&
                this.notifyingChaperone?.errors?.firstNameRequired &&
                isNullOrBlank(this.notifyingChaperone?.value?.firstName))
        );
    }

    get notifyingChaperoneHasLastNameErrors(): boolean {
        return (
            ((this.notifyingChaperoneParticipantInput?.isLastNameTouched ||
                (this.isDCFCompleted() && this.notifyingChaperoneHasErrors)) &&
                this.notifyingChaperone?.errors?.lastNameRequired) ||
            (!this.inCreation &&
                this.notifyingChaperone?.errors?.lastNameRequired &&
                isNullOrBlank(this.notifyingChaperone?.value?.lastName))
        );
    }

    get region(): AbstractControl | null {
        return this.form.get('region');
    }

    get selectionCriteria(): AbstractControl | null {
        return this.form.get('selectionCriteria');
    }

    get timezone(): AbstractControl | null {
        return this.form.get('timezone');
    }

    get timezoneHasErrors() {
        this.updateTimezoneValidators();
        return controlHasModeRelatedErrors(
            this.timezone,
            (this.showErrors && this.isDCFCompleted()) || this.timezone?.errors?.validateEmptyTimezone?.error?.invalid,
            this.inCreation,
            this.timezone?.errors?.validateEmptyTimezone?.error?.invalid || false
        );
    }
}
