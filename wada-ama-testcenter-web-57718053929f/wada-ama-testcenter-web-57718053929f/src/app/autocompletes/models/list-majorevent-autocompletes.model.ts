import { MajorEvent } from '@shared/models';

export class ListMajorEventAutoCompletes {
    numberPriorMonths: string | null;

    majorEvents: Array<MajorEvent>;

    constructor(listMajorEventsCompletes?: Partial<ListMajorEventAutoCompletes> | null) {
        const { numberPriorMonths = null, majorEvents = null } = listMajorEventsCompletes || {};
        this.numberPriorMonths = numberPriorMonths;
        this.majorEvents = (majorEvents || []).map((p: any) => new MajorEvent(p));
    }
}
