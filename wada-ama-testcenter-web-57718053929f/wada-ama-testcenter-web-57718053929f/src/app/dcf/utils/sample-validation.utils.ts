/* eslint-disable */
import {
    AbstractControl,
    FormArray,
    Validators,
} from '@angular/forms';
import { ConflictException } from '@core/models';
import { Sample } from '@dcf/models';
import { updateValidators, withCategory, ValidationCategory, validateSampleCodeDuplicate } from '@shared/utils';
import { SampleFactory } from './base-sample/sample.factory';

function checkSampleForDuplicates(sampleControl: AbstractControl, sampleControls: AbstractControl[], hasCodeValidationWarning: boolean) {
    const checkedSampleCode = sampleControl.get('sampleCode');
    const duplicateSamples =
        sampleControls.length > 1 &&
        sampleControls.every((control: AbstractControl) => {
            const sampleCode = control.get('sampleCode');
            return sampleCode && checkedSampleCode ?
                sampleCode.value === checkedSampleCode.value :
                false;
        });
    // Only the first sample code match should have its validators updated when two samples are the same in the page
    const validatorsToUpdate =
        (duplicateSamples && sampleControls?.[0].get('sampleCode')) || checkedSampleCode;
    updateDuplicateSamplesValidators(
        validatorsToUpdate,
        hasCodeValidationWarning
    );
}

function filterDuplicateSamples(
    samples: FormArray,
    conflictParameters: Map <string, string>
): Array<AbstractControl> {
    return samples.controls.filter((control: AbstractControl, index) => {
        const sampleCode = control.get('sampleCode');
        const sampleType = control.get('sampleTypeSpecificCode');

        const sampleCodeInConflictParameters = conflictParameters.get(`sampleCode${index}`);
        const sampleTypeInConflictParameters = conflictParameters.get(`sampleType${index}`);

        return sampleCode?.value === sampleCodeInConflictParameters && sampleType?.value === sampleTypeInConflictParameters;
    });
}

export function isSampleReadOnly(sample: any): boolean {
    return SampleFactory.isSampleReadOnly(sample);
}

export function removeUndefinedProperties(sample: Sample): Sample {
    const tempSample: any = {
        ...sample
    };
    Object.keys(sample).forEach((prop) => {
        if (!tempSample[prop] && prop !== 'sampleCode' && prop!== 'valid') {
            delete tempSample[prop];
        }
    });
    return tempSample;
}

function resetDefaultSampleCodeValidation(samples: FormArray | null): void {
    if (samples && samples.controls) {
        samples.controls.forEach((control: AbstractControl) => {
            const sampleCode = control.get('sampleCode');
            if (sampleCode) {
                updateValidators(sampleCode, [
                    withCategory(
                        Validators.required,
                        ValidationCategory.Mandatory
                    ),
                ]);
            }
        });
    }
}

function updateDuplicateSamplesValidators(
    validatorsToUpdate: AbstractControl | null,
    hasCodeValidationWarning: boolean
): void {
    if (validatorsToUpdate) {
        validatorsToUpdate.markAsDirty();
        updateValidators(validatorsToUpdate, [
            withCategory(Validators.required, ValidationCategory.Mandatory),
            withCategory(
                validateSampleCodeDuplicate(hasCodeValidationWarning),
                ValidationCategory.Warning
            ),
        ]);
    }
}

/**
 * Function is triggered when the call to the backend validating whether the sample returns a ConflictException
 */
export function validateSampleCodeDuplication(samples: any,
                                              conflictException: ConflictException | undefined | null,
                                              hasCodeValidationWarning: boolean,
                                              hasSampleCodeValidationError: boolean | undefined,
                                              sampleDuplicate: Map<string, string> | null): void {
    if (samples && conflictException && hasCodeValidationWarning && !hasSampleCodeValidationError) {

        if (sampleDuplicate) {
            resetDefaultSampleCodeValidation(samples);
            // filters among the samples the matching duplicate SampleCode && SampleType
            const sampleControls = filterDuplicateSamples(
                samples,
                sampleDuplicate,
            );
            if (sampleControls.length >= 1) {
                sampleControls.forEach((sampleControl: AbstractControl) => {
                    checkSampleForDuplicates(sampleControl, sampleControls, hasCodeValidationWarning);
                });
            } else {
                resetDefaultSampleCodeValidation(samples);
            }
        }
    } else {
        resetDefaultSampleCodeValidation(samples);
    }
}
