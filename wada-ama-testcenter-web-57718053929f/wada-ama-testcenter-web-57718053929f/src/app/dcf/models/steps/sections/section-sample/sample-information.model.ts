import { MajorEvent } from '@shared/models/major-event.model';
import * as moment from 'moment';
import { Moment } from 'moment';
import { propsUndefinedOrEmpty } from '@shared/utils/object-util';
import { Timezone } from '@dcf/models/dcf/timezone.model';
import { SampleFactory } from '@dcf/utils/base-sample/sample.factory';
import { Sample } from './sample-type/sample.model';

export class SampleInformation {
    arrivalDate: Moment | null;

    timezone: Timezone | null;

    /**
     * IC = true
     * OOC = false
     */
    testType: boolean;

    majorEvent: MajorEvent | null;

    competitionName: string;

    feeForService: boolean;

    samples: Array<Sample>;

    constructor(sampleInformation?: Partial<SampleInformation> | null) {
        const {
            arrivalDate = null,
            timezone = null,
            testType = false,
            majorEvent = null,
            competitionName = '',
            feeForService = false,
            samples = [],
        } = sampleInformation || {};
        this.arrivalDate = arrivalDate ? moment(arrivalDate) : null;
        this.timezone = timezone && !propsUndefinedOrEmpty(timezone) ? new Timezone(timezone) : null;
        this.testType = testType;
        this.majorEvent = majorEvent;
        this.competitionName = competitionName;
        this.feeForService = feeForService;
        this.samples = samples.filter((sample) => sample !== null).map((sample) => SampleFactory.createSample(sample));
    }
}
