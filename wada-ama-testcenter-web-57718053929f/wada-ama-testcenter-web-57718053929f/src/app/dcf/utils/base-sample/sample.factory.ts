import { SampleType, Analysis, SampleTypeEnum } from '@shared/models';
import { cloneDeep } from 'lodash-es';
import { Injectable } from '@angular/core';
import {
    Blood,
    Urine,
    BloodPassport,
    DriedBloodSpot,
    Sample,
} from '@dcf/models/steps/sections/section-sample/sample-type';

type AnalysisSample = Blood | Urine | BloodPassport | DriedBloodSpot;

@Injectable()
export class SampleFactory {
    static createSampleFromTestAnalysis(analysis: Analysis): AnalysisSample {
        if (analysis.sampleType.specificCode === 'Blood') {
            return new Blood();
        }
        if (analysis.sampleType.specificCode === 'Blood_passport') {
            return new BloodPassport({
                seated: true,
                collectedAfter3Days: false,
                hasHadTrainingSession: false,
                extremeEnvironment: false,
                hasBloodLoss: false,
                hasBloodTransfusion: false,
                hasHighAltitudeSimulation: false,
                hasHighAltitudeTraining: false,
            });
        }
        if (analysis.sampleType.specificCode === 'Urine') {
            return new Urine();
        }

        if (analysis.sampleType.specificCode === 'Dried_blood_spot') {
            return new DriedBloodSpot();
        }
        throw new Error();
    }

    static createSample(sample: Sample): AnalysisSample {
        if (this.isBlood(sample)) {
            return new Blood(sample);
        }
        if (this.isBloodPassport(sample)) {
            return new BloodPassport(sample);
        }
        if (this.isUrine(sample)) {
            return new Urine(sample);
        }
        if (this.isDriedBloodSpot(sample)) {
            return new DriedBloodSpot(sample);
        }
        throw new Error();
    }

    static createSampleFromForm(value: Sample): AnalysisSample {
        return this.createSample(value);
    }

    static createSampleForForm(value: Sample): AnalysisSample {
        return this.createSample(value);
    }

    static isSampleReadOnly(sample: Sample): boolean {
        if (sample && sample.results) {
            return sample.results.length > 0;
        }
        throw new Error();
    }

    static isBlood(sample: Sample): sample is Blood {
        return sample.sampleTypeSpecificCode === SampleTypeEnum.Blood;
    }

    static isBloodPassport(sample: Sample): sample is BloodPassport {
        return sample.sampleTypeSpecificCode === SampleTypeEnum.BloodPassport;
    }

    static isUrine(sample: Sample): sample is Urine {
        return sample.sampleTypeSpecificCode === SampleTypeEnum.Urine;
    }

    static isDriedBloodSpot(sample: Sample): sample is DriedBloodSpot {
        return sample.sampleTypeSpecificCode === SampleTypeEnum.DriedBloodSpot;
    }

    static getUrineSamples(samples: Array<Sample>): Array<Urine> {
        return samples.filter((s) => this.isUrine(s)) as Array<Urine>;
    }

    static getBloodSamples(samples: Array<Sample>): Array<Blood> {
        return samples.filter((s) => this.isBlood(s)) as Array<Blood>;
    }

    static getBloodPassportSamples(samples: Array<Sample>): Array<BloodPassport> {
        return samples.filter((s) => this.isBloodPassport(s)) as Array<BloodPassport>;
    }

    static getDriedBloodSpotSamples(samples: Array<Sample>): Array<DriedBloodSpot> {
        return samples.filter((s) => this.isDriedBloodSpot(s)) as Array<DriedBloodSpot>;
    }

    static setSampleTypes(samples: Array<Sample>, samplesTypes: Array<SampleType> | null): Array<Sample> {
        return samples.map((sample) => this.setSampleType(sample, samplesTypes));
    }

    static setSampleType(sample: Sample, samplesTypes: Array<SampleType> | null): Sample {
        const sampleUpdated = cloneDeep(sample);
        if (samplesTypes) {
            sampleUpdated.sampleType = samplesTypes.find(
                (sampleType) => sampleType.specificCode === sample.sampleTypeSpecificCode
            );
        }
        return sampleUpdated;
    }
}
