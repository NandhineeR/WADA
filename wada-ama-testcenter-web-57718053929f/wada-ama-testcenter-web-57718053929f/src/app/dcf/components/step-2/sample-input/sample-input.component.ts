import { TranslationService } from '@core/services/translation.service';
import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    Input,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import {
    DCFFormControls,
    FieldsSecurity,
    Laboratory,
    LocalizedEntity,
    Participant,
    SampleType,
    SampleTypeEnum,
    StatusEnum,
} from '@shared/models';
import { deepEqual } from '@shared/utils/object-util';
import { ValidationCategory, withCategory } from '@shared/utils/form-util';
import { trigger } from '@angular/animations';
import { ANIMATE_CHILD_OUT, DELAYED_FADE_IN, FADE_OUT } from '@core/components/animation/animation.component';
import { cloneDeep } from 'lodash-es';
import * as fromRootStore from '@core/store';
import { Store } from '@ngrx/store';
import {
    Blood,
    BloodPassport,
    Sample,
    SectionSampleAutoCompletes,
    Urine,
    DriedBloodSpot,
    MatchingStatus,
    Timezone,
    UrineSampleBoundaries,
} from '@dcf/models';
import { validateDatetimeFormat, fieldRequired } from '@shared/utils';
import { SampleFactory } from '@dcf/utils/base-sample/sample.factory';
import { removeUndefinedProperties } from '@dcf/utils/sample-validation.utils';

export const SAMPLE_INPUT_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SampleInputComponent),
    multi: true,
};

@Component({
    selector: 'app-sample-input',
    templateUrl: './sample-input.component.html',
    styleUrls: ['./sample-input.component.scss'],
    providers: [SAMPLE_INPUT_VALUE_ACCESSOR],
    animations: [trigger('fadeInOut', [DELAYED_FADE_IN, FADE_OUT]), trigger('fadeOutChild', [ANIMATE_CHILD_OUT])],
})
export class SampleInputComponent implements OnInit, AfterViewInit, ControlValueAccessor {
    readonly controls = DCFFormControls;

    readonly sampleType = SampleTypeEnum;

    @ViewChild('deleteButton') deleteButton?: ElementRef;

    @ViewChild('focusOnSampleType') sampleTypeSpecificCode?: ElementRef;

    @Output() readonly delete: EventEmitter<void> = new EventEmitter<void>();

    @Output()
    readonly sampleValuesOnChange = new EventEmitter<void>();

    @Output() readonly updateSample: EventEmitter<FormGroup> = new EventEmitter<FormGroup>();

    @Output()
    readonly validateABPFields = new EventEmitter<boolean>();

    @Output()
    readonly validateSampleCodeDuplicate = new EventEmitter<Sample | null>();

    @Input() autoCompletesAndGlobalData = new SectionSampleAutoCompletes();

    @Input() bloodCollectionOfficer: Participant | null = null;

    @Input() bloodCollectionOfficials: Array<Participant> = [];

    @Input() dcfStatus?: StatusEnum;

    @Input() collectionDateDisabled = false;

    @Input() fieldsSecurity: FieldsSecurity | null = null;

    /**
     * sample form coming from step 2 component. its validators will be updated during sample code validation
     */
    @Input() formGroup = new FormGroup({});

    @Input() inCreation = false;

    @Input() isEditMode = false;

    @Input() isMatchingResultType2or1 = false;

    @Input() isMatchingResultType3or2or1 = false;

    @Input() isMultipleDCF = false;

    @Input() laboratories: Array<Laboratory> = [];

    @Input() locale = 'en';

    @Input() manufacturers: Array<LocalizedEntity> = [];

    @Input() readonly = false;

    @Input() sampleIndex = -1;

    @Input() sampleTypes: Array<SampleType> = [];

    @Input() set samples(samples: Sample[] | undefined) {
        if (!samples || !samples.length) {
            this.buildFormForNewSampleType(SampleTypeEnum.Urine);
        }
    }

    @Input() showDelete = false;

    @Input() showErrors = false;

    @Input() tempLoggerStatus: MatchingStatus | undefined;

    @Input() timezones: Array<Timezone> = [];

    @Input() urineSampleBoundaries: UrineSampleBoundaries | null = null;

    @Input() witnessChaperone: Participant | null = null;

    @Input() witnessChaperones: Array<Participant> = [];

    translations$ = this.translationService.translations$;

    actualForm = new FormGroup({});

    private _sample: Sample | null = null;

    private hasChanged = false;

    private onChange: any;

    private onTouched: any;

    constructor(private translationService: TranslationService, public store: Store<fromRootStore.IState>) {}

    ngAfterViewInit(): void {
        this.setFocusOnDelete();
    }

    ngOnInit(): void {
        this.actualForm = cloneDeep(this.formGroup);
        this.actualForm.valueChanges.subscribe(() => this.onValueChanged());
        this._sample = this.actualForm.value;

        /* listen to changes from step 2 form and re-bind validators whenever the form status changes */
        this.formGroup.statusChanges.subscribe(() => {
            this.actualForm = this.formGroup;
        });
    }

    registerOnChange(onChange: () => void): void {
        this.onChange = onChange;
    }

    registerOnTouched(onTouched: () => void): void {
        this.onTouched = onTouched;
    }

    /**
     * Update controls on the step 4 form (this.formGroup) and on the form used for the new sample type (this.actualForm)
     * @param sampleType - the new sample type selected by the user
     */
    buildFormForNewSampleType(sampleType: string): void {
        this.actualForm = buildSampleControls();
        this.formGroup.get('systemLabel')?.setValue(undefined);
        this.formGroup.get('systemLabelId')?.setValue(undefined);

        switch (sampleType) {
            case SampleTypeEnum.Blood:
                buildBloodControls(this.actualForm);
                buildBloodControls(this.formGroup);
                this.sample = new Blood(this.formGroup.value);
                if (SampleFactory.isBlood(this.sample)) {
                    this.sample.bloodCollectionOfficial = this.bloodCollectionOfficer;
                }
                break;
            case SampleTypeEnum.BloodPassport:
                buildBloodPassportControls(this.actualForm);
                buildBloodPassportControls(this.formGroup);
                this.sample = new BloodPassport(this.formGroup.value);
                if (SampleFactory.isBloodPassport(this.sample)) {
                    this.sample.bloodCollectionOfficial = this.bloodCollectionOfficer;
                }
                break;
            case SampleTypeEnum.Urine:
                buildUrineControls(this.actualForm);
                buildUrineControls(this.formGroup);
                this.sample = new Urine(this.formGroup.value);
                if (SampleFactory.isUrine(this.sample)) {
                    this.sample.witnessChaperone = this.witnessChaperone;
                }
                break;
            case SampleTypeEnum.DriedBloodSpot:
                buildDriedBloodSpotControls(this.actualForm);
                buildDriedBloodSpotControls(this.formGroup);
                this.sample = new DriedBloodSpot(this.formGroup.value);
                break;
            default:
                throw new Error('Sample Type not supported');
        }

        this.actualForm.valueChanges.subscribe(() => this.onValueChanged());
        this.actualForm.patchValue(removeUndefinedProperties(this.sample));
    }

    changePartialSample(form: FormGroup): void {
        this.updateSample.emit(form);
    }

    deleteSample(): void {
        this.delete.emit();
    }

    emitValidateABPFields(areABPFieldsInvalid: boolean): void {
        this.validateABPFields.emit(areABPFieldsInvalid);
    }

    getDataQAName(sampleType: string): string {
        const formatedSampleType = sampleType.split('_');
        for (let i = 0; i < formatedSampleType.length; i += 1) {
            formatedSampleType[i] = formatedSampleType[i].charAt(0).toUpperCase() + formatedSampleType[i].substring(1);
        }
        return `sampleType${formatedSampleType.join('')}Radio`;
    }

    onSampleTypeValueChange(sampleType: string): void {
        this.emitValidateABPFields(false);
        this.resetFormGroupControls();
        this.buildFormForNewSampleType(sampleType);

        this.hasChanged = true;
        this.notify();
        this.validateSampleCodeDuplication();
    }

    onValueChanged(): void {
        this.notify();
    }

    notify(): void {
        if (this.hasChanged) {
            if (this.onChange) this.onChange(this.sample);
            if (this.onTouched) this.onTouched();
        }
        this.hasChanged = false;
    }

    /**
     * Reset form group controls before updating the controls
     */
    resetFormGroupControls(): void {
        switch (this.sample?.sampleTypeSpecificCode) {
            case SampleTypeEnum.Blood:
                removeBloodControls(this.formGroup);
                break;
            case SampleTypeEnum.BloodPassport:
                removeBloodPassportControls(this.formGroup);
                break;
            case SampleTypeEnum.Urine:
                removeUrineControls(this.formGroup);
                break;
            case SampleTypeEnum.DriedBloodSpot:
                removeDriedBloodSpotControls(this.formGroup);
                break;
            default:
                throw new Error('Sample Type not supported');
        }
    }

    /**
     * Set focus on Sample delete button if there is any, otherwise focus on sample type
     */
    setFocusOnDelete(): void {
        setTimeout(() => {
            if (!this.readonly && this.showDelete) {
                this.deleteButton?.nativeElement.focus();
            } else {
                this.sampleTypeSpecificCode?.nativeElement.firstChild.focus();
            }
        });
    }

    updateSampleValues(): void {
        this.formGroup.patchValue(this.actualForm.value);
    }

    validateSampleCodeDuplication(): void {
        this.formGroup.patchValue(this.actualForm.value);
        this.validateSampleCodeDuplicate.emit();
    }

    writeValue(sample: Sample): void {
        this.sample = sample;
        this.actualForm.patchValue(sample);
    }

    /**
     * Build formGroup controls accordingly with sample type
     */
    static buildFormGroup(sample: Sample): FormGroup {
        const formGroup = buildSampleControls();
        switch (sample.sampleTypeSpecificCode) {
            case SampleTypeEnum.Blood:
                buildBloodControls(formGroup);
                break;
            case SampleTypeEnum.BloodPassport:
                buildBloodPassportControls(formGroup, sample as BloodPassport);
                break;
            case SampleTypeEnum.Urine:
                buildUrineControls(formGroup);
                break;
            case SampleTypeEnum.DriedBloodSpot:
                buildDriedBloodSpotControls(formGroup);
                break;
            default:
                throw new Error('Sample Type not supported');
        }
        return formGroup;
    }

    set sample(value: Sample | null) {
        const sample = value ? SampleFactory.createSample(value) : null;
        if (!deepEqual(this._sample, sample)) {
            this.hasChanged = true;
            this._sample = sample;
        }
    }

    get sample(): Sample | null {
        return this._sample;
    }
}

function buildBloodControls(formGroup: FormGroup): void {
    formGroup.addControl(
        'laboratory',
        new FormControl('', [withCategory(fieldRequired('description'), ValidationCategory.Mandatory)])
    );
    formGroup.addControl(
        'bloodCollectionOfficial',
        new FormControl('', [
            withCategory(fieldRequired('lastName'), ValidationCategory.Mandatory),
            withCategory(fieldRequired('firstName'), ValidationCategory.Mandatory),
        ])
    );
}

function buildBloodPassportControls(formGroup: FormGroup, bloodPassport?: BloodPassport): void {
    const {
        seated = true,
        collectedAfter3Days = false,
        hasHadTrainingSession = false,
        extremeEnvironment = false,
        hasBloodLoss = false,
        hasBloodTransfusion = false,
        hasHighAltitudeSimulation = false,
        hasHighAltitudeTraining = false,
    } = bloodPassport || {};
    formGroup.addControl(
        'laboratory',
        new FormControl('', [withCategory(fieldRequired('description'), ValidationCategory.Mandatory)])
    );
    formGroup.addControl('tempLoggerId', new FormControl(''));
    formGroup.addControl(
        'seated',
        new FormControl(seated, [withCategory(Validators.required, ValidationCategory.Mandatory)])
    );
    formGroup.addControl(
        'collectedAfter3Days',
        new FormControl(collectedAfter3Days, [withCategory(Validators.required, ValidationCategory.Mandatory)])
    );
    formGroup.addControl(
        'hasHadTrainingSession',
        new FormControl(hasHadTrainingSession, [withCategory(Validators.required, ValidationCategory.Mandatory)])
    );
    formGroup.addControl('trainingType', new FormControl('', []));
    formGroup.addControl(
        'hasHighAltitudeTraining',
        new FormControl(hasHighAltitudeTraining, [withCategory(Validators.required, ValidationCategory.Mandatory)])
    );
    formGroup.addControl(
        'altitudeTraining',
        new FormGroup({
            location: new FormControl(null, []),
            altitude: new FormControl(null, []),
            start: new FormControl(null, []),
            end: new FormControl(null, []),
        })
    );
    formGroup.addControl(
        'hasHighAltitudeSimulation',
        new FormControl(hasHighAltitudeSimulation, [withCategory(Validators.required, ValidationCategory.Mandatory)])
    );
    formGroup.addControl(
        'altitudeSimulation',
        new FormGroup({
            deviceType: new FormControl('', []),
            useManner: new FormControl('', []),
        })
    );
    formGroup.addControl(
        'bloodDonationOrLoss',
        new FormGroup({
            timeBloodLoss: new FormControl('', []),
            cause: new FormControl('', []),
            volumeBloodLoss: new FormControl(null, []),
        })
    );
    formGroup.addControl(
        'hasBloodLoss',
        new FormControl(hasBloodLoss, [withCategory(Validators.required, ValidationCategory.Mandatory)])
    );
    formGroup.addControl(
        'bloodTransfusion',
        new FormGroup({
            timeBloodTransfusion: new FormControl('', []),
            volumeBloodTransfusion: new FormControl(null, []),
        })
    );
    formGroup.addControl(
        'hasBloodTransfusion',
        new FormControl(hasBloodTransfusion, [withCategory(Validators.required, ValidationCategory.Mandatory)])
    );
    formGroup.addControl(
        'extremeEnvironment',
        new FormControl(extremeEnvironment, [withCategory(Validators.required, ValidationCategory.Mandatory)])
    );
    formGroup.addControl(
        'bloodCollectionOfficial',
        new FormControl('', [
            withCategory(fieldRequired('lastName'), ValidationCategory.Mandatory),
            withCategory(fieldRequired('firstName'), ValidationCategory.Mandatory),
        ])
    );
    formGroup.addControl('valid', new FormControl('', []));
}

function buildDriedBloodSpotControls(formGroup: FormGroup): void {
    formGroup.addControl(
        'laboratory',
        new FormControl('', [withCategory(fieldRequired('description'), ValidationCategory.Mandatory)])
    );
    formGroup.addControl(
        'manufacturerKit',
        new FormControl('', [withCategory(Validators.required, ValidationCategory.Mandatory)])
    );
}

/**
 * Builds sample controls with all common properties in urine, blood and blood passport
 */
function buildSampleControls(): FormGroup {
    return new FormGroup(
        {
            guid: new FormControl(new Date().getTime() + Math.ceil(Math.random() * 1000)),
            id: new FormControl(undefined),
            sampleCode: new FormControl('', [withCategory(Validators.required, ValidationCategory.Mandatory)]),
            collectionDate: new FormControl(undefined, [
                withCategory(Validators.required, ValidationCategory.Mandatory),
                withCategory(validateDatetimeFormat, ValidationCategory.Format),
            ]),
            timezone: new FormControl(null),
            manufacturer: new FormControl('', [
                withCategory(fieldRequired('description'), ValidationCategory.Mandatory),
            ]),
            sampleTypeSpecificCode: new FormControl('', [
                withCategory(Validators.required, ValidationCategory.MandatoryDraft),
            ]),
            systemLabel: new FormControl(undefined),
            systemLabelId: new FormControl(undefined),
        },
        { updateOn: 'blur' }
    );
}

function buildUrineControls(formGroup: FormGroup): void {
    formGroup.addControl('laboratory', new FormControl('', []));
    formGroup.addControl('partial', new FormControl(false));
    formGroup.addControl('volume', new FormControl('', []));
    formGroup.addControl('volumeBelowMinimumReason', new FormControl('', []));
    formGroup.addControl('partialVolume', new FormControl('', []));
    formGroup.addControl('specificGravity', new FormControl('', []));
    formGroup.addControl(
        'witnessChaperone',
        new FormControl('', [
            withCategory(fieldRequired('lastName'), ValidationCategory.Mandatory),
            withCategory(fieldRequired('firstName'), ValidationCategory.Mandatory),
        ])
    );
    formGroup.addControl('valid', new FormControl('', []));
}

const removeBloodControls = (formGroup: FormGroup): void => {
    formGroup.removeControl('bloodCollectionOfficial');
};

const removeBloodPassportControls = (formGroup: FormGroup): void => {
    formGroup.removeControl('tempLoggerId');
    formGroup.removeControl('seated');
    formGroup.removeControl('collectedAfter3Days');
    formGroup.removeControl('hasHadTrainingSession');
    formGroup.removeControl('trainingType');
    formGroup.removeControl('hasHighAltitudeTraining');
    formGroup.removeControl('altitudeTraining');
    formGroup.removeControl('hasHighAltitudeSimulation');
    formGroup.removeControl('altitudeSimulation');
    formGroup.removeControl('bloodDonationOrLoss');
    formGroup.removeControl('hasBloodLoss');
    formGroup.removeControl('bloodTransfusion');
    formGroup.removeControl('hasBloodTransfusion');
    formGroup.removeControl('extremeEnvironment');
    formGroup.removeControl('bloodCollectionOfficial');
    formGroup.removeControl('valid');
};

const removeDriedBloodSpotControls = (formGroup: FormGroup): void => {
    formGroup.removeControl('manufacturerKit');
};

const removeUrineControls = (formGroup: FormGroup): void => {
    formGroup.removeControl('partial');
    formGroup.removeControl('partialVolume');
    formGroup.removeControl('specificGravity');
    formGroup.removeControl('witnessChaperone');
    formGroup.removeControl('volume');
    formGroup.removeControl('volumeBelowMinimumReason');
    formGroup.removeControl('valid');
};
