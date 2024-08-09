import { EventEmitter, Input, Output, Directive } from '@angular/core';
import { DCFActionRight, SampleType, SampleTypeEnum, SpecificCode } from '@shared/models';
import {
    Blood,
    BloodPassport,
    BloodPassportUtils,
    BloodUtils,
    FindingType,
    Result,
    SampleCorrection,
    SampleTargetFieldEnum,
    Urine,
    UrineUtils,
    DriedBloodSpot,
    DriedBloodSpotUtils,
    SampleUtils,
} from '@dcf/models';
import { Observable } from 'rxjs/internal/Observable';
import * as fromRootStore from '@core/store';
import { Store } from '@ngrx/store';
import { Sample as SampleManagementSample } from '@sampleManagement/models';
import { SampleFactory } from './sample.factory';

type AnalysisSample = Urine | Blood | BloodPassport | DriedBloodSpot | null;

@Directive()
export class BaseSample {
    readonly actionRight = DCFActionRight;

    readonly finding = FindingType;

    readonly sampleTargetFieldEnum = SampleTargetFieldEnum;

    readonly status = SpecificCode;

    @Output()
    readonly changeSampleEmitter: EventEmitter<SampleCorrection> = new EventEmitter<SampleCorrection>();

    @Input() abpAccess = '';

    @Input() actions: Array<string> = [];

    @Input() athleteId = '';

    @Input() dcfId = '';

    @Input() dcfRetentionPeriod: string | null = null;

    @Input() dcfToBeDeleted = false;

    @Input() hasSampleManagementReader = false;

    @Input() isBplrReaderOrWriter = false;

    @Input() isLastMatchedSample = false;

    @Input() isLrReaderOrWriter = false;

    @Input() isMultipleDCF = false;

    @Input() isUserCorrector = false;

    @Input() required = false;

    @Input() set sample(sample: AnalysisSample) {
        this._sample = sample;
        if (sample !== null) {
            this.hasAdverseResult = this.sampleHasAafOrAtf();
            if (SampleFactory.isUrine(sample)) {
                this.missingFields = UrineUtils.missingFields(sample, this.isMultipleDCF);
            } else if (SampleFactory.isBloodPassport(sample)) {
                this.missingFields = BloodPassportUtils.missingFields(sample, this.isMultipleDCF);
            } else if (SampleFactory.isBlood(sample)) {
                this.missingFields = BloodUtils.missingFields(sample, this.isMultipleDCF);
            } else if (SampleFactory.isDriedBloodSpot(sample)) {
                this.missingFields = DriedBloodSpotUtils.missingFields(sample, this.isMultipleDCF);
            }

            this.isSampleTimezoneRequired$.subscribe((sampleTimezoneRequired: boolean) => {
                if (!sampleTimezoneRequired) {
                    this.missingFields.delete(SampleUtils.requiredFields.Timezone);
                }
            });
        }
    }

    get sample(): AnalysisSample {
        return this._sample;
    }

    @Input() sampleManagementSamplesInfo: SampleManagementSample | null = null;

    @Input() sampleTypes: Array<SampleType> = [];

    @Input() whiteList: Map<string, string> = new Map<string, string>();

    isSampleTimezoneRequired$: Observable<boolean> = this.store.select(fromRootStore.isSampleTimezoneRequired);

    hasAdverseResult = false;

    missingFields = new Set<string>();

    private _sample: AnalysisSample = null;

    constructor(public store: Store<fromRootStore.IState>) {}

    aafOrAtfIsConfirmedByUser(): boolean {
        let resultConfirmed = false;
        if (this.sample) {
            this.sample.results.forEach((result: Result) => {
                if (
                    result.finding &&
                    (result.finding.type === FindingType.AAF || result.finding.type === FindingType.ATF) &&
                    result.matchingResultStatus &&
                    result.matchingResultStatus.specificCode === SpecificCode.ConfirmedByUser
                ) {
                    resultConfirmed = true;
                }
            });
        }
        return resultConfirmed;
    }

    canReadLabResults(): boolean {
        if (this.sample && this.sample.results?.length > 0) {
            return this.sample?.sampleTypeSpecificCode === SampleTypeEnum.BloodPassport
                ? this.isBplrReaderOrWriter && this.actions.includes(this.actionRight.ViewBPLabResult)
                : this.isLrReaderOrWriter && this.actions.includes(this.actionRight.ViewLabResult);
        }

        return false;
    }

    canUpdate(fieldName: string): boolean {
        return this.whiteList.has(fieldName) && this.whiteList.get(fieldName) === 'RW';
    }

    changeSample(sampleCorrection: SampleCorrection): void {
        if (this.sample) {
            this.changeSampleEmitter.emit(sampleCorrection);
        }
    }

    isSampleConfirmedWithoutAdrv(): boolean {
        if (this.aafOrAtfIsConfirmedByUser()) {
            return false;
        }
        if (!this.sampleHasAafOrAtf) {
            return true;
        }
        return false;
    }

    sampleHasAafOrAtf(): boolean {
        let hasAafOrAtf = false;
        if (this.sample) {
            this.sample.results.forEach((result) => {
                if (
                    result.finding &&
                    (result.finding.type === FindingType.AAF || result.finding.type === FindingType.ATF)
                ) {
                    hasAafOrAtf = true;
                }
            });
        }
        return hasAafOrAtf;
    }
}
