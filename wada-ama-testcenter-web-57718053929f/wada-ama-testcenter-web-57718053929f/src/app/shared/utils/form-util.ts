import {
    AbstractControl,
    AsyncValidatorFn,
    FormGroup,
    ValidationErrors,
    ValidatorFn,
    Validators,
} from '@angular/forms';
import { UrineSampleBoundaries } from '@dcf/models';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StatusEnum } from '@shared/models';
import { isNullOrBlank } from './string-utils';
import { fieldRequired, validateDatetimeFormat, validateLowerBound } from './validator-utils';
import { isEmpty } from './object-util';

export interface NumberOfErrorsPerCategory {
    Format?: number;
    Business?: number;
    Mandatory?: number;
    MandatoryDraft?: number;
    Warning?: number;
}

export enum ValidationCategory {
    NoCategory,
    Format,
    Business,
    Mandatory,
    MandatoryDraft,
    Warning,
}

export function anyErrors(errors: NumberOfErrorsPerCategory): boolean {
    return errorCount(errors) > 0;
}

export function controlHasModeRelatedErrors(
    control: AbstractControl | null,
    showErrors: boolean,
    inCreation: boolean,
    mandatory: boolean
): boolean {
    if (
        control &&
        control.invalid &&
        (showErrors || control.dirty || control.touched || (!inCreation && control.untouched))
    ) {
        return hasAnyErrors(control, true, true, mandatory, true);
    }
    return false;
}

export function controlPopOverHasErrors(control: AbstractControl | null, showErrors: boolean): boolean {
    return (
        (control &&
            control.invalid &&
            (control.dirty || showErrors) &&
            hasValidationCategoryErrors(control, ValidationCategory.Mandatory)) ||
        false
    );
}

export function controlWasTouchedAndHasWarnings(control: AbstractControl | null): boolean {
    return (
        (control &&
            control.invalid &&
            (control.dirty || control.touched) &&
            hasValidationCategoryErrors(control, ValidationCategory.Warning)) ||
        false
    );
}

export function errorCount(errors: NumberOfErrorsPerCategory): number {
    return Object.values(errors || [])
        .filter(Boolean)
        .reduce((sum: number, count: number) => sum + count, 0);
}

export function extractFormErrors(controls: FormGroup): ValidationErrors {
    return controls
        ? Object.entries(controls.controls).reduce(
              (accum: ValidationErrors, [name, control]: [string, AbstractControl]) => {
                  if (control.invalid) {
                      accum[name] = control.errors || extractFormErrors(control as FormGroup);
                  }
                  return accum;
              },
              {}
          )
        : {};
}

function hasAnyErrors(
    control: AbstractControl | null,
    business: boolean,
    format: boolean,
    mandatory: boolean,
    mandatoryDraft: boolean
): boolean {
    return (
        (business && hasValidationCategoryErrors(control, ValidationCategory.Business)) ||
        (format && hasValidationCategoryErrors(control, ValidationCategory.Format)) ||
        (mandatory && hasValidationCategoryErrors(control, ValidationCategory.Mandatory)) ||
        (mandatoryDraft && hasValidationCategoryErrors(control, ValidationCategory.MandatoryDraft))
    );
}

export function hasBlockingErrors(errorsPerCategory?: NumberOfErrorsPerCategory): boolean {
    if (errorsPerCategory && errorsPerCategory.Business) {
        return errorsPerCategory.Business > 0;
    }

    if (errorsPerCategory && errorsPerCategory.Format) {
        return errorsPerCategory.Format > 0;
    }

    if (errorsPerCategory && errorsPerCategory.MandatoryDraft) {
        return errorsPerCategory.MandatoryDraft > 0;
    }

    return false;
}

export function hasControlChange(prevValue: string, control: AbstractControl | null): boolean {
    if (isNullOrBlank(control?.value?.toString())) {
        if (isNullOrBlank(prevValue?.toString())) return false;
        return true;
    }
    if (control?.value?.toString() === prevValue?.toString()) return false;
    return true;
}

export function hasPipeErrors(control: AbstractControl | null, showErrors: boolean, dcfStatus: StatusEnum): boolean {
    return (
        (control &&
            control.invalid &&
            (showErrors || control.dirty || control.touched || !isEmpty(control.errors)) &&
            !hasValidationCategoryErrors(control, ValidationCategory.Warning) &&
            (hasValidationCategoryErrors(control, ValidationCategory.Mandatory)
                ? dcfStatus === StatusEnum.Completed
                : true)) ||
        false
    );
}

export function hasValidationCategoryErrors(control: AbstractControl | null, category: ValidationCategory): boolean {
    return Object.values(control?.errors || {})
        .map((error: any) => error.category)
        .includes(category);
}

/**
 * @param volume
 * @param boundaries
 * @returns
 */
export function isVolumeBelowMinimumReasonField(volume: number, boundaries: UrineSampleBoundaries | null): boolean {
    if (boundaries?.minimumVolumeThreshold0 && boundaries?.minimumVolumeThreshold1) {
        // if volume is invalid (below 10ml), do not show reason field
        if (volume < boundaries.minimumVolumeThreshold0) {
            return false;
        }
        // only show reason if volume is below threshold 1 (90ml)
        return volume < boundaries.minimumVolumeThreshold1;
    }

    return false;
}

export function numberOfErrorsForCategory(category: ValidationCategory, group: FormGroup): number {
    if (!group || group.valid || !group.controls) {
        return 0;
    }
    let numErrors = 0;
    Object.entries(group.controls).forEach((entry) => {
        const control = entry[1];
        numErrors += control.errors
            ? Object.values(control.errors)
                  .map((error) => error.category)
                  .filter((cat) => cat === category).length
            : numberOfErrorsForCategory(category, control as FormGroup);
    });
    return numErrors;
}

export function numberOfErrorsPerCategory(group: FormGroup): NumberOfErrorsPerCategory {
    return {
        Format: numberOfErrorsForCategory(ValidationCategory.Format, group),
        Business: numberOfErrorsForCategory(ValidationCategory.Business, group),
        Mandatory: numberOfErrorsForCategory(ValidationCategory.Mandatory, group),
        MandatoryDraft: numberOfErrorsForCategory(ValidationCategory.MandatoryDraft, group),
        Warning: numberOfErrorsForCategory(ValidationCategory.Warning, group),
    };
}

export function takeFirstError(...validators: Array<ValidatorFn>): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const errorValidator = validators.find((validator) => {
            const error = validator(control);
            if (error && !isEmpty(error)) {
                return true;
            }
            return false;
        });
        if (errorValidator) {
            return errorValidator(control);
        }
        return null;
    };
}

export function toggleNotApplicable(notApplicable: boolean, control: AbstractControl | null): void {
    const validators = notApplicable
        ? []
        : [
              withCategory(fieldRequired('lastName'), ValidationCategory.Mandatory),
              withCategory(fieldRequired('firstName'), ValidationCategory.Mandatory),
          ];

    if (control) {
        if (notApplicable) {
            control.disable();
        }
        control.enable();
        control.setValidators(validators);
        control.updateValueAndValidity();
    }
}

export function updateCollectionDateValidators(
    collectionDate: AbstractControl | null,
    validator: ValidatorFn,
    category: ValidationCategory
) {
    if (collectionDate) {
        updateValidators(collectionDate, [
            withCategory(validator, category),
            withCategory(validateDatetimeFormat, ValidationCategory.Format),
        ]);
        collectionDate.markAsTouched();
    }
}

export function updateTimezoneValidators(
    timezone: AbstractControl | null,
    validator: ValidatorFn,
    category: ValidationCategory
) {
    if (timezone) {
        updateValidators(timezone, [withCategory(validator, category)]);
    }
}

export function updateValidators(control: AbstractControl | undefined, validators: Array<ValidatorFn>): void {
    if (control) {
        control.setValidators(validators);
        control.updateValueAndValidity();
    }
}

export function updateVolumeReasonValidators(
    volume = '',
    boundaries: UrineSampleBoundaries | null,
    volumeBelowMinimumReason: AbstractControl | null
): void {
    if (volumeBelowMinimumReason) {
        const volumeValue = Number.parseFloat(volume);

        if (isVolumeBelowMinimumReasonField(volumeValue, boundaries)) {
            volumeBelowMinimumReason.enable();
            updateValidators(volumeBelowMinimumReason, [
                withCategory(Validators.required, ValidationCategory.MandatoryDraft),
            ]);
        } else {
            volumeBelowMinimumReason.setValue('');
            volumeBelowMinimumReason.disable();
            updateValidators(volumeBelowMinimumReason, []);
        }

        volumeBelowMinimumReason.markAsTouched();
    }
}

export function updateVolumeValidators(volume: AbstractControl | null, boundaries: UrineSampleBoundaries | null) {
    if (volume && boundaries) {
        updateValidators(volume, [
            withCategory(Validators.required, ValidationCategory.Mandatory),
            withCategory(validateLowerBound(boundaries.minimumVolumeThreshold0), ValidationCategory.Business),
        ]);
    }
}

export function withCategory(validator: ValidatorFn, category: ValidationCategory): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const error = validator(control);
        if (error && !isEmpty(error)) {
            const errorKey = Object.keys(error)[0];
            return {
                [errorKey]: {
                    error: error[errorKey],
                    category,
                },
            };
        }
        return null;
    };
}

export function withCategoryAsync(validator: AsyncValidatorFn, category: ValidationCategory): AsyncValidatorFn {
    return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
        return from(validator(control)).pipe(
            map((error) => {
                if (error && !isEmpty(error)) {
                    const errorKey = Object.keys(error)[0];
                    return {
                        [errorKey]: {
                            error: error[errorKey],
                            category,
                        },
                    };
                }
                return null;
            })
        );
    };
}
