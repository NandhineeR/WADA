import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn } from '@angular/forms';
import { CalendarUtils, ValidationCategory } from '@shared/utils';
import { Observable, of } from 'rxjs';
import { AttemptMethod, LocationEnum, UA } from '@to/models';
import {
    Country,
    CountryWithRegions,
    FieldsSecurity,
    ListItem,
    LocalizedEntity,
    Participant,
    Region,
    UAFormControls,
} from '@shared/models';
import { latinize } from 'ngx-bootstrap/typeahead';
import * as moment from 'moment';

@Component({
    selector: 'app-ua-form',
    templateUrl: './ua-form.component.html',
    styleUrls: ['./ua-form.component.scss'],
})
export class UaFormComponent extends CalendarUtils implements OnChanges {
    controls = UAFormControls;

    get dateOfReport(): AbstractControl | null {
        return this.form.get('dateOfReport');
    }

    get attemptedContactMethods(): FormGroup | null {
        return this.form.get('attemptedContactMethods') as FormGroup;
    }

    get attemptTimeFrom(): AbstractControl | null {
        return this.form.get('attemptTimeFrom');
    }

    get attemptTimeTo(): AbstractControl | null {
        return this.form.get('attemptTimeTo');
    }

    get location(): AbstractControl | null {
        return this.form.get('location');
    }

    get specifyLocation(): AbstractControl | null {
        return this.form.get('specifyLocation');
    }

    get descriptionOfAttempt(): AbstractControl | null {
        return this.form.get('descriptionOfAttempt');
    }

    get attemptDate(): AbstractControl | null {
        return this.form.get('attemptDate');
    }

    get whereaboutsLastCheckedDate(): AbstractControl | null {
        return this.form.get('whereaboutsLastCheckedDate');
    }

    get whereaboutsLastCheckedTime(): AbstractControl | null {
        return this.form.get('whereaboutsLastCheckedTime');
    }

    get timeSlot(): AbstractControl | null {
        return this.form.get('timeSlot');
    }

    get address(): AbstractControl | null {
        return this.form.get('address');
    }

    get country(): AbstractControl | null {
        return this.form.get('address.country');
    }

    get streetAddress1(): AbstractControl | null {
        return this.form.get('address.streetAddress1');
    }

    get streetAddress2(): AbstractControl | null {
        return this.form.get('address.streetAddress2');
    }

    get building(): AbstractControl | null {
        return this.form.get('address.building');
    }

    get floor(): AbstractControl | null {
        return this.form.get('address.floor');
    }

    get room(): AbstractControl | null {
        return this.form.get('address.room');
    }

    get city(): AbstractControl | null {
        return this.form.get('address.city');
    }

    get region(): AbstractControl | null {
        return this.form.get('address.region');
    }

    get zipCode(): AbstractControl | null {
        return this.form.get('address.zipCode');
    }

    get dopingControlOfficer(): AbstractControl | null {
        return this.form.get('dopingControlOfficer');
    }

    get resultManagementAuthority(): AbstractControl | null {
        return this.form.get('resultManagementAuthority');
    }

    get resultManagementAuthorityHasErrors(): boolean {
        return this.controlHasErrors(this.resultManagementAuthority);
    }

    get dateOfReportHasErrors(): boolean {
        return (
            (this.controlHasErrors(this.dateOfReport) && this.showErrors && !this.showCalendar) ||
            this.controlHasBusinessOrFormatErrors(this.dateOfReport)
        );
    }

    get dopingControlOfficerHasErrors(): boolean {
        return (
            (this.controlHasErrors(this.dopingControlOfficer) && this.showErrors) ||
            this.controlHasBusinessOrFormatErrors(this.dopingControlOfficer)
        );
    }

    get attemptedContactMethodHasErrors(): boolean {
        const controlValues: boolean[] = [];
        this._attemptMethods.forEach((attemptMethod) => {
            if (attemptMethod.method?.specificCode) {
                controlValues.push(this.attemptedContactMethods?.get(attemptMethod.method?.specificCode)?.value);
            }
        });

        // there is an error if none of the controls have the value 'true' (no checkbox have been checked)
        return !controlValues.includes(true);
    }

    get attemptTimeFromHasErrors(): boolean {
        return (
            (this.controlHasErrors(this.attemptTimeFrom) && this.showErrors) ||
            this.controlHasBusinessOrFormatErrors(this.attemptTimeFrom)
        );
    }

    get attemptTimeToHasErrors(): boolean {
        return (
            (this.controlHasErrors(this.attemptTimeTo) && this.showErrors) ||
            this.controlHasBusinessOrFormatErrors(this.attemptTimeTo)
        );
    }

    get countryHasErrors(): boolean {
        return (
            (this.controlHasErrors(this.country) && this.showErrors) ||
            this.controlHasBusinessOrFormatErrors(this.country)
        );
    }

    get cityHasErrors(): boolean {
        return (
            (this.controlHasErrors(this.city) && this.showErrors) || this.controlHasBusinessOrFormatErrors(this.city)
        );
    }

    get zipCodeHasErrors(): boolean {
        return this.controlHasErrors(this.zipCode);
    }

    get whereaboutsLastCheckedTimeHasErrors(): boolean {
        return this.controlHasErrors(this.whereaboutsLastCheckedTime);
    }

    get timeSlotHasErrors(): boolean {
        return this.controlHasErrors(this.timeSlot);
    }

    get whereaboutsLastCheckedDateHasErrors(): boolean {
        return this.controlHasErrors(this.whereaboutsLastCheckedDate) && !this.showCalendar;
    }

    get attemptDescriptionHasErrors(): boolean {
        return this.controlHasErrors(this.descriptionOfAttempt);
    }

    get attemptDateHasErrors(): boolean {
        return (
            (this.controlHasErrors(this.attemptDate) && this.showErrors && !this.showCalendar) ||
            this.controlHasBusinessOrFormatErrors(this.attemptDate)
        );
    }

    get locationHasErrors(): boolean {
        return this.controlHasErrors(this.location);
    }

    get specifyLocationHasErrors(): boolean {
        return (
            (this.controlHasErrors(this.specifyLocation) && this.showErrors) ||
            this.controlHasBusinessOrFormatErrors(this.specifyLocation)
        );
    }

    get formHasErrors(): boolean {
        return this.form.invalid && (this.attemptDescriptionHasErrors || this.attemptDateHasErrors);
    }

    @Input() dopingControlOfficers = [];

    @Input() form: FormGroup = new FormGroup({});

    @Input() resultManagementAuthorities: Array<ListItem> = [];

    @Input() countries: Array<CountryWithRegions> = [];

    @Input() attemptMethods: Array<LocalizedEntity> = [];

    @Input() ua: UA | null = null;

    @Input() locale = '';

    @Input() showErrors = false;

    @Input() fieldsSecurity = new Map<string, FieldsSecurity>();

    @Input() isEditMode = false;

    _attemptMethods: Array<AttemptMethod> = new Array<AttemptMethod>();

    _dopingControlOfficerAsPerson = new Array<Participant>();

    date = new Date();

    selectedCountryId = '';

    canDisplayFormGroup = false;

    contactAttemptIsDirty = false;

    locationEnum = LocationEnum;

    maxDate = moment();

    constructor() {
        super();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (
            changes.form !== null &&
            changes.form !== undefined &&
            changes.form.currentValue !== null &&
            changes.attemptMethods &&
            changes.attemptMethods.currentValue !== null &&
            this._attemptMethods.length === 0
        ) {
            const formAttempts: Array<LocalizedEntity> =
                changes.form.currentValue && changes.form.currentValue.value.attemptedContactMethods;
            const attemptMethods: Array<LocalizedEntity> = changes.attemptMethods.currentValue;
            this._attemptMethods = attemptMethods.map((attempt: LocalizedEntity) =>
                this.mapLocalizedEntityToAttemptMethod(attempt, formAttempts)
            );
            const formGroup: FormGroup | null = this.attemptedContactMethods;
            if (formGroup) {
                this._attemptMethods.forEach((attempt: AttemptMethod) => {
                    if (
                        !Object.keys(formGroup.controls).find(
                            (control: string) => attempt.method && control === attempt.method.specificCode
                        )
                    ) {
                        formGroup.addControl(attempt.method?.specificCode || '', new FormControl(attempt.selected));
                    }
                });
                this.canDisplayFormGroup = true;
            }
        }
    }

    private mapLocalizedEntityToAttemptMethod(attempt: LocalizedEntity, formAttempts: Array<LocalizedEntity>) {
        const attemptMethod = new AttemptMethod({
            selected: false,
            method: null,
        });
        attemptMethod.method = new LocalizedEntity(attempt);
        let item: LocalizedEntity | undefined;
        if (Object.keys(formAttempts).length > 0) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            item = formAttempts[attempt.specificCode];
        }
        if (item) {
            attemptMethod.selected = true;
        }
        return attemptMethod;
    }

    enableIsDirty(): void {
        this.contactAttemptIsDirty = true;
    }

    updateValidators(control: AbstractControl | undefined, validators: Array<ValidatorFn>): void {
        if (control) {
            control.setValidators(validators);
            control.updateValueAndValidity();
        }
    }

    resultManagementSuggestions = (token: string): Observable<Array<ListItem>> => {
        const latinizedToken = latinize(token.toLocaleLowerCase());
        return of(
            this.resultManagementAuthorities.filter(
                (resultManagementAuthority: ListItem): boolean =>
                    latinize(resultManagementAuthority.displayDescriptionName.toLocaleLowerCase()).indexOf(
                        latinizedToken
                    ) >= 0
            )
        );
    };

    countrySuggestions = (token: string): Observable<Array<Country>> => {
        const latinizedToken = latinize(token.toLocaleLowerCase());
        return of(
            this.countries.filter(
                (country: Country): boolean => latinize(country.name.toLocaleLowerCase()).indexOf(latinizedToken) >= 0
            )
        );
    };

    regionSuggestions = (token: string): Observable<Array<ListItem>> => {
        const latinizedToken = latinize(token.toLocaleLowerCase());

        const country = this.countries.find(
            (countryWithRegions: CountryWithRegions) => countryWithRegions.id === this.selectedCountryId
        );

        let regions: Array<ListItem> = [];
        if (country) {
            regions = country.regions
                .filter((r: Region): boolean => latinize(r.name.toLocaleLowerCase()).indexOf(latinizedToken) >= 0)
                .map((r: Region) => {
                    const item = new ListItem();
                    item.id = parseInt(r.id, 10);
                    item.name = r.name;
                    return item;
                });
        }
        return of(regions);
    };

    selectCountry(country: Country): void {
        this.selectedCountryId = country?.id || '';
        this.region?.patchValue(undefined);
    }

    toggleAttemptSelection(isSelected: boolean, selectedAttempt: AttemptMethod): void {
        this.enableIsDirty();

        const attempt = this._attemptMethods.find((attemptMethod) => attemptMethod === selectedAttempt);
        if (attempt && attempt.method) {
            attempt.selected = !isSelected;

            // update form control
            this.attemptedContactMethods?.get(attempt.method.specificCode)?.setValue(attempt.selected);
        }
    }

    updateDCO(event: any): void {
        this.dopingControlOfficer?.setValue(event.participant);
    }

    private controlHasErrors = (control: AbstractControl | null): boolean => {
        // We don't ignore mandatory errors when the status is Completed
        // We also assume that for each control, we only have one error, the most critical one
        if (control && control.invalid && (control.dirty || this.showErrors || control.touched)) {
            const required = Object.values(control.errors || {})
                .map((error) => error.category)
                .includes(ValidationCategory.Mandatory);
            const format = Object.values(control.errors || {})
                .map((error) => error.category)
                .includes(ValidationCategory.Format);
            const business = Object.values(control.errors || {})
                .map((error) => error.category)
                .includes(ValidationCategory.Business);
            const mandatoryDraft = Object.values(control.errors || {})
                .map((error) => error.category)
                .includes(ValidationCategory.MandatoryDraft);
            return required || format || business || mandatoryDraft;
        }

        return false;
    };

    private controlHasBusinessOrFormatErrors = (control: AbstractControl | null): boolean => {
        // We don't ignore mandatory errors when the status is Completed
        // We also assume that for each control, we only have one error, the most critical one
        if (control && control.invalid && (control.dirty || this.showErrors || control.touched)) {
            const format = Object.values(control.errors || {})
                .map((error) => error.category)
                .includes(ValidationCategory.Format);
            const business = Object.values(control.errors || {})
                .map((error) => error.category)
                .includes(ValidationCategory.Business);
            return format || business;
        }

        return false;
    };
}
