import { Laboratory, LocalizedEntity, SampleType, SampleTypeEnum } from '@shared/models';
import * as moment from 'moment';
import { Moment } from 'moment';
import { propsUndefinedOrEmpty } from '@shared/utils/object-util';
import { Sample as SampleManagementSample } from '@sampleManagement/models';
import { Result } from '../result.model';
import { Timezone } from '../../../../dcf/timezone.model';

export abstract class Sample {
    id: number | null;

    guid: number;

    abstract sampleTypeSpecificCode: SampleTypeEnum;

    sampleType?: SampleType;

    sampleCode: string;

    sampleManagementInfo: SampleManagementSample | null;

    collectionDate: Moment | null;

    timezone: Timezone | null;

    laboratory: Laboratory | null;

    manufacturer: LocalizedEntity | null;

    warningDuplicate: string;

    partial: boolean;

    chainOfCustody: string | null;

    results: Array<Result>;

    systemLabel: string | null;

    systemLabelId: string | null;

    constructor(sample?: Partial<Sample> | null) {
        const {
            guid = null,
            id = null,
            sampleCode = '',
            sampleManagementInfo = null,
            collectionDate = null,
            timezone = null,
            laboratory = null,
            manufacturer = null,
            results = [],
            partial = false,
            warningDuplicate = '',
            chainOfCustody = null,
            systemLabel = null,
            systemLabelId = null,
        } = sample || {};

        this.guid = guid || new Date().getTime() + Math.ceil(Math.random() * 1000);
        this.id = id;
        this.sampleCode = sampleCode;
        this.sampleManagementInfo = sampleManagementInfo ? new SampleManagementSample(sampleManagementInfo) : null;
        this.collectionDate = collectionDate ? moment(collectionDate) : null;
        this.timezone = timezone && !propsUndefinedOrEmpty(timezone) ? new Timezone(timezone) : null;
        this.laboratory = laboratory ? new Laboratory(laboratory) : null;
        this.manufacturer = manufacturer ? new LocalizedEntity(manufacturer) : null;
        this.results = results.map((result) => new Result(result));
        this.partial = partial;
        this.warningDuplicate = warningDuplicate || '';
        this.chainOfCustody = chainOfCustody;
        this.systemLabel = systemLabel;
        this.systemLabelId = systemLabelId;
    }
}
