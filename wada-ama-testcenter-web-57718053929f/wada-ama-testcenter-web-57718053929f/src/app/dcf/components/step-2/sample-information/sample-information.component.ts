import { NavigationExtras, Router } from '@angular/router';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DCFActionRight, SampleType } from '@shared/models';
import {
    Blood,
    BloodPassport,
    BloodPassportUtils,
    BloodUtils,
    SampleCorrection,
    SampleInformation,
    SampleInformationUtils,
    Urine,
    UrineUtils,
    DriedBloodSpot,
    DriedBloodSpotUtils,
    Sample,
    UrineSampleBoundaries,
    SampleUtils,
} from '@dcf/models';
import { Sample as SampleManagementSample } from '@sampleManagement/models';
import { Store } from '@ngrx/store';
import * as fromRootStore from '@core/store';
import { Observable } from 'rxjs';
import { SampleFactory } from '@dcf/utils/base-sample/sample.factory';
import { cloneDeep } from 'lodash-es';
import { SampleInformationErrors } from './sample-information-errors';

@Component({
    selector: 'app-sample-information',
    templateUrl: './sample-information.component.html',
})
export class SampleInformationComponent {
    readonly actionRight = DCFActionRight;

    readonly fields = SampleInformationUtils.requiredFields;

    @Output()
    readonly changeSampleEmitter: EventEmitter<SampleCorrection> = new EventEmitter<SampleCorrection>();

    @Output() readonly errors = new EventEmitter<SampleInformationErrors>();

    @Input() abpAccess = '';

    @Input() actions: Array<string> = new Array<string>();

    @Input() athleteId = '';

    @Input() currentUrl = '';

    @Input() dcfId = '';

    @Input() dcfRetentionPeriod: string | null = null;

    @Input() dcfToBeDeleted = false;

    @Input() hasSampleManagementReader = false;

    @Input() isCancelled = false;

    @Input() isBplrReaderOrWriter = false;

    @Input() isLastMatchedSample = false;

    @Input() isLrReaderOrWriter = false;

    @Input() isUserCorrector = false;

    @Input() set minimumSpecificGravity(value: number) {
        this._minimumSpecificGravity = value;
        if (value) this.checkErrors();
    }

    get minimumSpecificGravity(): number {
        return this._minimumSpecificGravity;
    }

    @Input() set sampleInformation(info: SampleInformation | null) {
        this._sampleInformation = info;
        this.extractSamplesByType();
        if (info) this.checkErrors();
    }

    get sampleInformation(): SampleInformation | null {
        return this._sampleInformation;
    }

    @Input() set sampleManagementTestInformation(testInfo: Array<SampleManagementSample>) {
        this._sampleManagementTestInformation = testInfo;
        if (testInfo && testInfo.length > 0) {
            this.urineSamples = this.assignSampleManagementMInfoToCorrespondingSample(this.urineSamples) as Urine[];
            this.bloodSamples = this.assignSampleManagementMInfoToCorrespondingSample(this.bloodSamples) as Blood[];
            this.driedBloodSpotSamples = this.assignSampleManagementMInfoToCorrespondingSample(
                this.driedBloodSpotSamples
            ) as DriedBloodSpot[];
            this.bloodPassportSamples = this.assignSampleManagementMInfoToCorrespondingSample(
                this.bloodPassportSamples
            ) as BloodPassport[];
        }
    }

    get sampleManagementTestInformation(): Array<SampleManagementSample> {
        return this._sampleManagementTestInformation;
    }

    @Input() sampleTypes: Array<SampleType> = [];

    @Input() urineSampleBoundaries: UrineSampleBoundaries | null = null;

    @Input() whiteList: Map<string, string> = new Map<string, string>();

    isSampleTimezoneRequired$: Observable<boolean> = this.store.select(fromRootStore.isSampleTimezoneRequired);

    bloodPassportSamples: Array<BloodPassport> = [];

    bloodPassportSampleManagementSamplesInfo: Array<SampleManagementSample> = [];

    bloodSamples: Array<Blood> = [];

    bloodSampleManagementSamplesInfo: Array<SampleManagementSample> = [];

    driedBloodSpotSamples: Array<DriedBloodSpot> = [];

    driedBloodSpotSampleManagementSamplesInfo: Array<SampleManagementSample> = [];

    missingFields = new Set<string>();

    missingSampleFields = new Map<string, Set<string>>();

    urineSamples: Array<Urine> = [];

    urineSampleManagementSamplesInfo: Array<SampleManagementSample> = [];

    private _minimumSpecificGravity = 1.005;

    private _sampleInformation: SampleInformation | null = null;

    private _sampleManagementTestInformation: Array<SampleManagementSample> = [];

    constructor(private router: Router, public store: Store<fromRootStore.IState>) {}

    changeSample(sampleCorrection: SampleCorrection): void {
        const sampleCorrectionUpdated = sampleCorrection;
        sampleCorrection.dcfId = this.dcfId;
        this.changeSampleEmitter.emit(sampleCorrectionUpdated);
    }

    getSampleIndex(sample: Sample, i: number): number {
        const urineSamplesLength: number = this.urineSamples?.length || 0;
        const bloodSamplesLength: number = this.bloodSamples?.length || 0;
        const bloodPassportSamplesLength: number = this.bloodPassportSamples?.length || 0;

        let index = 0;
        if (SampleFactory.isUrine(sample)) {
            index = i + 1;
        } else if (SampleFactory.isBlood(sample)) {
            index = i + 1 + urineSamplesLength;
        } else if (SampleFactory.isBloodPassport(sample)) {
            index = i + 1 + urineSamplesLength + bloodSamplesLength;
        } else if (SampleFactory.isDriedBloodSpot(sample)) {
            index = i + 1 + urineSamplesLength + bloodSamplesLength + bloodPassportSamplesLength;
        }
        return index;
    }

    /**
     * Redirects to Vew Laboratory Result Page
     * @param params contains information about sample type and lab result to be open
     */
    openViewLabResult(params: { isBloodPassport: boolean; labResultId: string }): void {
        const navigationExtras: NavigationExtras = {
            state: params,
            queryParams: params,
            skipLocationChange: true,
        };
        this.router.navigate(['/', 'dcf', 'result', params.labResultId], navigationExtras);
    }

    private assignSampleManagementMInfoToCorrespondingSample(samples: Array<Sample>): Array<Sample> {
        // eslint-disable-next-line prefer-const
        let modifiableSamples = cloneDeep(samples);
        samples.forEach((sample, index) => {
            modifiableSamples[index].sampleManagementInfo =
                this.sampleManagementTestInformation.find(
                    (sampleManagementSample) => sample.id === sampleManagementSample.id
                ) || null;
        });

        return modifiableSamples;
    }

    private checkErrors(): void {
        this.missingFields.clear();
        this.missingSampleFields.clear();

        this.missingFields = SampleInformationUtils.missingFields(this.sampleInformation);
        this.urineSamples.forEach((s) => this.missingSampleFields.set(`${s.id}`, UrineUtils.missingFields(s)));
        this.bloodSamples.forEach((s) => this.missingSampleFields.set(`${s.id}`, BloodUtils.missingFields(s)));
        this.bloodPassportSamples.forEach((s) =>
            this.missingSampleFields.set(`${s.id}`, BloodPassportUtils.missingFields(s))
        );
        this.driedBloodSpotSamples.forEach((s) =>
            this.missingSampleFields.set(`${s.id}`, DriedBloodSpotUtils.missingFields(s))
        );

        this.isSampleTimezoneRequired$.subscribe((sampleTimezoneRequired: boolean) => {
            if (!sampleTimezoneRequired) {
                this.missingSampleFields.forEach((sample) => sample.delete(SampleUtils.requiredFields.Timezone));
            }
        });

        const hasMissingFields = this.missingFieldsCount > 0;

        const hasDiluteSamples = this.urineSamples
            .map((urine) => Number(urine.specificGravity))
            .some((specificGravity) => specificGravity < this.minimumSpecificGravity);

        const duplicateUrineSampleCodes = this.urineSamples
            .filter((urine) => urine.warningDuplicate)
            .map((urine) => urine.sampleCode);

        setTimeout(() =>
            this.errors.emit({
                hasMissingFields,
                hasDiluteSamples,
                duplicateUrineSampleCodes,
            })
        );
    }

    private extractSamplesByType(): void {
        const samples = (this.sampleInformation && this.sampleInformation.samples) || [];
        this.urineSamples = SampleFactory.getUrineSamples(samples);
        this.bloodSamples = SampleFactory.getBloodSamples(samples);
        this.bloodPassportSamples = SampleFactory.getBloodPassportSamples(samples);
        this.driedBloodSpotSamples = SampleFactory.getDriedBloodSpotSamples(samples);
    }

    get missingFieldsCount(): number {
        return (
            Array.from(this.missingSampleFields.values()).reduce((sum, fields) => sum + fields.size, 0) +
            this.missingFields.size
        );
    }
}
