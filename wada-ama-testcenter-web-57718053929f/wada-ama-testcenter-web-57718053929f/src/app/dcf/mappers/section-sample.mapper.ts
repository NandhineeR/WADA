import { IDCFState } from '@dcf/store/states/dcf.state';
import { DCF, Sample, SampleInformation, Timezone } from '@dcf/models';
import { propsUndefined } from '@shared/utils/object-util';
import { Analysis, SampleTypeEnum, SpecificCode, Test } from '@shared/models';
import { isNullOrBlank } from '@shared/utils';
import { adjustTimezoneToLocal } from '@shared/utils/timezone-utils';
import * as moment from 'moment';
import { SampleFactory } from '@dcf/utils/base-sample/sample.factory';

export function dcfToSectionSample(dcf: DCF): SampleInformation | undefined {
    if (!dcf || !dcf.sampleInformation) {
        return undefined;
    }
    const { sampleInformation } = dcf;
    const formValue = new SampleInformation({
        arrivalDate:
            adjustTimezoneToLocal(sampleInformation.arrivalDate) ||
            adjustTimezoneToLocal(dcf.notification?.notificationDate) ||
            undefined,
        timezone: new Timezone(sampleInformation.timezone),
        testType: sampleInformation.testType !== null ? sampleInformation.testType : true,
        feeForService: sampleInformation.feeForService || !dcf.athlete,
        samples: sampleInformation.samples || mapTestAnalysesToSample(dcf.test),
    });

    formValue.samples = setSpecificGravity(formValue.samples, false);

    return formValue;
}

export function sectionSampleToDCF(state: IDCFState, form: SampleInformation): IDCFState {
    const sampleInformation = new SampleInformation({
        arrivalDate: adjustTimezoneToLocal(form.arrivalDate),
        timezone: form.timezone,
        testType: form.testType,
        majorEvent: form.testType ? form.majorEvent : null,
        competitionName: form.testType ? form.competitionName : '',
        feeForService: form.feeForService,
    });

    if (form.samples) {
        const samplesFromState = state?.currentDcf?.sampleInformation?.samples || [];
        sampleInformation.samples = form.samples.map((sample: Sample, index: number) =>
            SampleFactory.createSample({
                ...sample,
                results: samplesFromState && samplesFromState[index] ? samplesFromState[index].results : [],
            })
        );
    }

    sampleInformation.samples = setSpecificGravity(sampleInformation.samples, true);

    const updatedDCF = {
        ...state.currentDcf,
        sampleInformation: propsUndefined(sampleInformation) ? null : sampleInformation,
    };

    return { ...state, currentDcf: updatedDCF };
}

export function converDatetimeLocaltime(samples: Array<Sample>) {
    samples.forEach((sample: Sample) => {
        const year = sample.collectionDate?.year();
        const month = sample.collectionDate?.month();
        const day = sample.collectionDate?.date();
        const hour = sample.collectionDate?.hour();
        const minute = sample.collectionDate?.minutes();

        if (year && month && day) sample.collectionDate = moment(new Date(year, month, day, hour, minute));
    });
    return samples;
}

export function setSpecificGravity(samples: Array<Sample>, isForDCF: boolean): Array<Sample> {
    samples.forEach((sample: Sample) => {
        if (SampleFactory.isUrine(sample)) {
            sample.specificGravity = isForDCF
                ? stepToDCFSpecificGravity(sample.specificGravity)
                : dcfToStepSpecificGravity(sample.specificGravity);
        }
    });
    return samples;
}

export function stepToDCFSpecificGravity(specificGravity: string | null): string {
    if (specificGravity === '') return '';
    const specificGravityAsNumber = parseInt((specificGravity || '').padEnd(2, '0'), 10);
    return (specificGravityAsNumber / 1000 + 1.0).toString();
}

export function dcfToStepSpecificGravity(specificGravity: string | null): string {
    return isNullOrBlank(specificGravity) ? '' : (specificGravity || '').toString().substring(3).padEnd(2, '0');
}

export function mapTestAnalysesToSample(test: Test | null): Array<Sample> {
    return ((test != null && test.analyses) || [])
        .filter((analysis: Analysis) => analysis?.status?.specificCode !== SpecificCode.Closed)
        .map((analysis: Analysis) => {
            const sample = SampleFactory.createSampleFromTestAnalysis(analysis);
            sample.sampleTypeSpecificCode = analysis.sampleType.specificCode as SampleTypeEnum;
            sample.laboratory = analysis.laboratory;
            sample.systemLabel = analysis.systemLabel || null;
            sample.systemLabelId = analysis.systemLabelId || null;

            if (test) {
                if (SampleFactory.isUrine(sample)) {
                    sample.witnessChaperone = test.witnessChaperone;
                }
                if (SampleFactory.isBloodPassport(sample)) {
                    sample.bloodCollectionOfficial = test.bloodCollectionOfficer;
                }
                if (SampleFactory.isBlood(sample)) {
                    sample.bloodCollectionOfficial = test.bloodCollectionOfficer;
                }
            }

            return sample;
        });
}
