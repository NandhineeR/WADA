import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { controlHasModeRelatedErrors, latinize } from '@shared/utils';
import { Observable, of } from 'rxjs';
import {
    FieldsSecurity,
    Region,
    StatusEnum,
    DCFFormControls,
    CountryWithRegions,
    Country,
    ListItem,
    Athlete,
} from '@shared/models';

/**
 * Component responsible for displaying formGroup with athlete mailing address information
 */
@Component({
    selector: 'app-athlete-mailing-address',
    templateUrl: './athlete-mailing-address.component.html',
    styleUrls: ['./athlete-mailing-address.component.scss'],
})
export class AthleteMailingAddressComponent implements OnInit {
    readonly controls = DCFFormControls;

    @Output() readonly selectedCountryIdEmitter = new EventEmitter<string>();

    @Input() address?: FormGroup;

    @Input() countries: Array<CountryWithRegions> = [];

    @Input() dcfStatus: StatusEnum | undefined = undefined;

    @Input() fieldsSecurity: FieldsSecurity | null = null;

    @Input() inCreation = false;

    @Input() isEditMode = false;

    @Input() isMultipleDCF = false;

    @Input() showErrors = false;

    athlete?: Athlete;

    editMailingAddress = false;

    inEditMode = false;

    selectedCountryId = '';

    ngOnInit(): void {
        this.setCountryId();
    }

    /**
     * Suggests countries based on token search
     */
    countrySuggestions = (token: string): Observable<Array<Country>> => {
        const latinizedToken = latinize(token.toLocaleLowerCase());
        return of(
            this.countries.filter(
                (country: Country): boolean => latinize(country.name.toLocaleLowerCase()).indexOf(latinizedToken) >= 0
            )
        );
    };

    isMailingAddressFilled(): boolean {
        let hasFormErrorInEditMode = this.inEditMode;
        if (this.countryHasErrors || this.cityHasErrors) {
            this.inEditMode = true;
            hasFormErrorInEditMode = true || hasFormErrorInEditMode;
        }
        return hasFormErrorInEditMode;
    }

    onEditMailingAddress(): void {
        this.setCountryId();
        this.editMailingAddress = true;
    }

    /**
     * Suggests regions based on token search
     */
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
        this.selectedCountryIdEmitter.emit(this.selectedCountryId);
    }

    setCountryId(): void {
        if (this.address) {
            this.selectedCountryId = this.country?.value?.id || '';
        }
    }

    private isDCFCompleted() {
        return this.dcfStatus === StatusEnum.Completed;
    }

    get addressId(): AbstractControl | null {
        return this.address?.get('id') || null;
    }

    get building(): AbstractControl | null {
        return this.address?.get('building') || null;
    }

    get city(): AbstractControl | null {
        return this.address?.get('city') || null;
    }

    get cityHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.city,
            this.showErrors && (this.isMultipleDCF || this.isDCFCompleted()),
            this.inCreation,
            this.city?.errors?.invalid?.error
        );
    }

    get country(): AbstractControl | null {
        return this.address?.get('country') || null;
    }

    get countryHasErrors(): boolean {
        return controlHasModeRelatedErrors(
            this.country,
            this.showErrors && (this.isMultipleDCF || this.isDCFCompleted()),
            this.inCreation,
            this.country?.errors?.required
        );
    }

    get floor(): AbstractControl | null {
        return this.address?.get('floor') || null;
    }

    get region(): AbstractControl | null {
        return this.address?.get('region') || null;
    }

    get room(): AbstractControl | null {
        return this.address?.get('room') || null;
    }

    get streetAddress1(): AbstractControl | null {
        return this.address?.get('streetAddress1') || null;
    }

    get streetAddress2(): AbstractControl | null {
        return this.address?.get('streetAddress2') || null;
    }

    get zipCode(): AbstractControl | null {
        return this.address?.get('zipCode') || null;
    }

    get zipCodeHasErrors(): boolean {
        return controlHasModeRelatedErrors(this.zipCode, this.showErrors, this.inCreation, false);
    }
}
