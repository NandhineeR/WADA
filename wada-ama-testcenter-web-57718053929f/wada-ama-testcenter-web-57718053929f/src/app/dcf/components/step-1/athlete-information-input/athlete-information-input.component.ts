import {
    controlHasModeRelatedErrors,
    NumberOfErrorsPerCategory,
    numberOfErrorsPerCategory,
    toggleNotApplicable,
    ValidationCategory,
    withCategory,
} from '@shared/utils/form-util';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { ConflictException } from '@core/models';
import * as fromRootStore from '@core/store';
import {
    Address,
    CountryWithRegions,
    DCFFormControls,
    FieldsSecurity,
    Participant,
    Phone,
    SportDiscipline,
    StatusEnum,
} from '@shared/models';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { latinize } from 'ngx-bootstrap/typeahead';
import { numberOfErrorPerCategoryValidation } from '@shared/utils/number-of-error-validation';
import { ParticipantInputComponent } from '@shared/components';
import { AthleteInformation, SectionAthleteAutoCompletes, StepsSection } from '@dcf/models';
import * as fromAutoCompletesStore from '@autocompletes/store';
import * as fromStore from '@dcf/store';
import {
    fieldNotEmpty,
    validateEmail,
    validatePhoneNumber,
    isNotUndefined,
    zipCodeRegex,
    isNullOrBlank,
} from '@shared/utils';

@Component({
    selector: 'app-athlete-information-input',
    templateUrl: './athlete-information-input.component.html',
    styleUrls: ['./athlete-information-input.component.scss'],
})
export class AthleteInformationInputComponent implements OnInit, OnDestroy {
    readonly controls = DCFFormControls;

    @ViewChild('coachParticipantInput') coachParticipantInput?: ParticipantInputComponent;

    @ViewChild('doctorParticipantInput') doctorParticipantInput?: ParticipantInputComponent;

    address$: Observable<Address | null> = this.store.select(fromStore.getAthleteAddress);

    athlete$: Observable<AthleteInformation | null> = this.store.select(fromStore.getAthlete);

    autoCompletes$: Observable<SectionAthleteAutoCompletes> = this.store.pipe(
        select(fromAutoCompletesStore.getDCFSectionAthleteAutoCompletes)
    );

    coaches$: Observable<Array<Participant>> = this.autoCompletes$.pipe(
        map((suggestions: SectionAthleteAutoCompletes) => suggestions.coaches)
    );

    countriesWithRegions$: Observable<Array<CountryWithRegions>> = this.store.select(
        fromAutoCompletesStore.getAutoCompletesCountriesWithRegions
    );

    dcfId$: Observable<string> = this.store
        .select(fromRootStore.getActiveRoute)
        .pipe(map((state: fromRootStore.RouterStateUrl) => state.params.id || ''));

    defaultPhone$: Observable<Phone | undefined> = this.store.select(fromStore.getDefaultAthletePhone);

    doctors$: Observable<Array<Participant>> = this.autoCompletes$.pipe(
        map((suggestions: SectionAthleteAutoCompletes) => suggestions.doctors)
    );

    fieldsSecurity$: Observable<FieldsSecurity | null> = this.store.select(fromStore.getFieldsSecurity);

    hasEmailAddress$: Observable<boolean> = this.store.select(fromStore.getHasEmailAddress);

    hasSampleCodeValidationError$ = this.store.select(fromStore.hasSampleValidationError);

    isNewPhone$: Observable<boolean | null> = this.store.select(fromStore.getAthleteIsNewPhone);

    isEditMode$: Observable<boolean> = this.store.select(fromStore.isEditMode);

    isMatchingResultType3or2or1$: Observable<boolean> = this.store.select(fromStore.isMatchingResultType3or2or1);

    phones$: Observable<Array<Phone>> = this.store.select(fromStore.getAthletePhoneNumbers);

    selectedCountryIdSubject = new BehaviorSubject<string>('');

    selectedCountryId$ = this.selectedCountryIdSubject.asObservable();

    selectedCountryCode$: Observable<CountryWithRegions | undefined> = this.store.select(
        fromStore.getDefaultAthletePhoneCountry
    );

    route$: Observable<string> = this.store
        .select(fromRootStore.getActiveRouteUrl)
        .pipe(map((url) => url.split('#')[0]));

    coachDisabled = false;

    coachHasBeenToggled = false;

    conflictException: ConflictException | null = null;

    dcfStatus?: StatusEnum = undefined;

    doctorDisabled = false;

    doctorHasBeenToggled = false;

    editEmailAddress = false;

    editMailingAddress = false;

    form = new FormGroup(
        {
            id: new FormControl(undefined, []),
            sportDiscipline: new FormControl(undefined, [
                withCategory(Validators.required, ValidationCategory.Mandatory),
            ]),
            address: new FormGroup({
                id: new FormControl(undefined, []),
                country: new FormControl(undefined, [withCategory(Validators.required, ValidationCategory.Mandatory)]),
                streetAddress1: new FormControl('', []),
                streetAddress2: new FormControl('', []),
                building: new FormControl('', []),
                floor: new FormControl('', []),
                room: new FormControl('', []),
                city: new FormControl('', [withCategory(fieldNotEmpty(), ValidationCategory.Mandatory)]),
                region: new FormControl(undefined, []),
                zipCode: new FormControl('', [
                    withCategory(Validators.pattern(zipCodeRegex), ValidationCategory.Format),
                ]),
            }),
            email: new FormControl('', [
                withCategory(Validators.required, ValidationCategory.Mandatory),
                withCategory(validateEmail, ValidationCategory.Format),
            ]),
            phone: new FormControl(undefined, [withCategory(validatePhoneNumber, ValidationCategory.Format)]),
            emailNotProvided: new FormControl(false, []),
            athleteLevel: new FormControl('', [withCategory(Validators.required, ValidationCategory.Mandatory)]),
            coach: new FormControl(undefined, []),
            doctor: new FormControl(undefined, []),
            coachNotApplicable: new FormControl(false, []),
            doctorNotApplicable: new FormControl(false, []),
        },
        { updateOn: 'change' }
    );

    hasOptimisticLockException = false;

    hasSaveConflict = false;

    inCreation = false;

    saveError = false;

    showErrors = false;

    tempEmail = '';

    private subscriptions = new Subscription();

    constructor(private store: Store<fromRootStore.IState>) {}

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    ngOnInit(): void {
        this.store.dispatch(fromStore.Step1Init({ section: StepsSection.AthleteSection }));

        this.subscriptions.add(
            this.store.pipe(select(fromStore.getSectionAthleteShowErrors)).subscribe((show) => {
                this.showErrors = show;
            })
        );

        this.subscriptions.add(
            this.store.select(fromRootStore.getActiveRoute).subscribe((state) => {
                this.inCreation = this.isCreation(state.url);
            })
        );

        this.subscriptions.add(
            this.store.pipe(select(fromStore.getSectionAthleteFormValues), filter(isNotUndefined)).subscribe((data) => {
                this.form.patchValue(data);
                this.initCoachNotApplicable(data.coachNotApplicable);
                this.initDoctorNotApplicable(data.doctorNotApplicable);

                const selectedId =
                    data && data.address && data.address.country && data.address.country.id
                        ? data.address.country.id
                        : '';
                this.selectedCountryIdSubject.next(selectedId);
            })
        );

        this.subscriptions.add(
            this.store.select(fromStore.getStatus).subscribe((status) => {
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
                            section: StepsSection.AthleteSection,
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

    initCoachNotApplicable(notApplicable: boolean | null): void {
        const control: AbstractControl | null = this.coachNotApplicable;
        this.coachDisabled = notApplicable !== null && notApplicable;
        if (control) {
            control.patchValue(this.coachDisabled);
        }
        toggleNotApplicable(this.coachDisabled, this.coach);
    }

    initDoctorNotApplicable(notApplicable: boolean | null): void {
        const control: AbstractControl | null = this.doctorNotApplicable;
        this.doctorDisabled = notApplicable !== null && notApplicable;
        if (control) {
            control.patchValue(this.doctorDisabled);
        }
        toggleNotApplicable(this.doctorDisabled, this.doctor);
    }

    isCreation(module: string): boolean {
        return module.includes('new');
    }

    onEditEmailAddress(): void {
        this.editEmailAddress = true;
    }

    onEditMailingAddress(): void {
        this.editMailingAddress = true;
    }

    selectCountry(countrySelectedId: string): void {
        this.selectedCountryIdSubject.next(countrySelectedId);
    }

    sportDisciplineSuggestions = (token: string): Observable<Array<SportDiscipline>> => {
        const latinizedToken = latinize(token.toLocaleLowerCase());
        return this.autoCompletes$.pipe(
            map((suggestions: SectionAthleteAutoCompletes) =>
                suggestions.sportDisciplines.filter(
                    (sport: SportDiscipline): boolean =>
                        latinize(sport.displayDescriptionName.toLocaleLowerCase()).indexOf(latinizedToken) >= 0
                )
            )
        );
    };

    submitForm(): void {
        this.store.dispatch(fromStore.Step1SectionAthleteSubmitForm({ values: this.form.value }));
    }

    toggleCoachNotApplicable(): void {
        const control: AbstractControl | null = this.coachNotApplicable;
        this.coachDisabled = !this.coachDisabled;
        if (control) {
            control.patchValue(this.coachDisabled);
        }
        toggleNotApplicable(this.coachDisabled, this.coach);
        this.coachHasBeenToggled = !this.coachDisabled;
        if (this.coachDisabled) {
            this.coach?.patchValue({});
        }

        if (this.isDCFCompleted()) {
            this.coach?.markAllAsTouched();
        } else {
            this.coach?.markAsUntouched();
            this.coachParticipantInput?.resetTouched();
        }
    }

    toggleDoctorNotApplicable(): void {
        const control: AbstractControl | null = this.doctorNotApplicable;
        this.doctorDisabled = !this.doctorDisabled;
        if (control) {
            control.patchValue(this.doctorDisabled);
        }
        toggleNotApplicable(this.doctorDisabled, this.doctor);
        this.doctorHasBeenToggled = !this.doctorDisabled;
        if (this.doctorDisabled) {
            this.doctor?.patchValue({});
        }

        if (this.isDCFCompleted()) {
            this.doctor?.markAllAsTouched();
        } else {
            this.doctor?.markAsUntouched();
            this.doctorParticipantInput?.resetTouched();
        }
    }

    private isDCFCompleted() {
        return this.dcfStatus === StatusEnum.Completed;
    }

    get address(): AbstractControl | null {
        return this.form.get('address');
    }

    get athleteLevel(): AbstractControl | null {
        return this.form.get('athleteLevel');
    }

    get athleteLevelHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.athleteLevel,
            this.showErrors && this.isDCFCompleted(),
            this.inCreation,
            this.athleteLevel?.errors?.required
        );
    }

    get building(): AbstractControl | null {
        return this.form.get('address.building');
    }

    get city(): AbstractControl | null {
        return this.form.get('address.city');
    }

    get cityHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.city,
            this.showErrors && this.isDCFCompleted(),
            this.inCreation,
            this.city?.errors?.required
        );
    }

    get coach(): AbstractControl | null {
        return this.form.get('coach');
    }

    get coachHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.coach,
            this.showErrors && this.isDCFCompleted(),
            this.inCreation,
            this.coach?.errors?.lastNameRequired || this.coach?.errors?.firstNameRequired
        );
    }

    get coachHasFirstNameErrors(): boolean {
        return (
            ((this.coachParticipantInput?.isFirstNameTouched ||
                (this.isDCFCompleted() && (this.coachHasErrors || this.coachHasBeenToggled))) &&
                this.coach?.errors?.firstNameRequired) ||
            (!this.inCreation && this.coach?.errors?.firstNameRequired && isNullOrBlank(this.coach?.value?.firstName))
        );
    }

    get coachHasLastNameErrors(): boolean {
        return (
            ((this.coachParticipantInput?.isLastNameTouched ||
                (this.isDCFCompleted() && (this.coachHasErrors || this.coachHasBeenToggled))) &&
                this.coach?.errors?.lastNameRequired) ||
            (!this.inCreation && this.coach?.errors?.lastNameRequired && isNullOrBlank(this.coach?.value?.lastName))
        );
    }

    get coachNotApplicable(): AbstractControl | null {
        return this.form.get('coachNotApplicable');
    }

    get country(): AbstractControl | null {
        return this.form.get('address.country');
    }

    get countryHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.country,
            this.showErrors && this.isDCFCompleted(),
            this.inCreation,
            this.country?.errors?.required
        );
    }

    get doctor(): AbstractControl | null {
        return this.form.get('doctor');
    }

    get doctorHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.doctor,
            this.showErrors && this.isDCFCompleted(),
            this.inCreation,
            this.doctor?.errors?.lastNameRequired || this.doctor?.errors?.firstNameRequired
        );
    }

    get doctorHasFirstNameErrors(): boolean {
        return (
            ((this.doctorParticipantInput?.isFirstNameTouched ||
                (this.isDCFCompleted() && (this.doctorHasErrors || this.doctorHasBeenToggled))) &&
                this.doctor?.errors?.firstNameRequired) ||
            (!this.inCreation && this.doctor?.errors?.firstNameRequired && isNullOrBlank(this.doctor?.value?.firstName))
        );
    }

    get doctorHasLastNameErrors(): boolean {
        return (
            ((this.doctorParticipantInput?.isLastNameTouched ||
                (this.isDCFCompleted() && (this.doctorHasErrors || this.doctorHasBeenToggled))) &&
                this.doctor?.errors?.lastNameRequired) ||
            (!this.inCreation && this.doctor?.errors?.lastNameRequired && isNullOrBlank(this.doctor?.value?.lastName))
        );
    }

    get doctorNotApplicable(): AbstractControl | null {
        return this.form.get('doctorNotApplicable');
    }

    get email(): AbstractControl | null {
        return this.form.get('email');
    }

    get emailHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.email,
            this.showErrors && this.isDCFCompleted(),
            this.inCreation,
            this.email?.errors?.required
        );
    }

    get emailNotProvided(): AbstractControl | null {
        return this.form.get('emailNotProvided');
    }

    get floor(): AbstractControl | null {
        return this.form.get('address.floor');
    }

    get phone(): AbstractControl | null {
        return this.form.get('phone');
    }

    get phoneHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.phone,
            this.showErrors && this.isDCFCompleted(),
            this.inCreation,
            this.phone?.errors?.required
        );
    }

    get region(): AbstractControl | null {
        return this.form.get('address.region');
    }

    get room(): AbstractControl | null {
        return this.form.get('address.room');
    }

    get sportDiscipline(): AbstractControl | null {
        return this.form.get('sportDiscipline');
    }

    get sportDisciplineHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.sportDiscipline,
            this.showErrors && this.isDCFCompleted(),
            this.inCreation,
            this.sportDiscipline?.errors?.required
        );
    }

    get streetAddress1(): AbstractControl | null {
        return this.form.get('address.streetAddress1');
    }

    get streetAddress2(): AbstractControl | null {
        return this.form.get('address.streetAddress2');
    }

    get zipCode(): AbstractControl | null {
        return this.form.get('address.zipCode');
    }

    get zipCodeHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.zipCode,
            this.showErrors && this.isDCFCompleted(),
            this.inCreation,
            this.zipCode?.errors?.required
        );
    }
}
