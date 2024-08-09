import { LocalizedEntity, Participant, SampleType, SportDiscipline } from '@shared/models';
import { Timezone } from '../dcf/timezone.model';

export class SectionDownAutoCompletes {
    manufacturers: Array<LocalizedEntity>;

    notifyingChaperones: Array<Participant>;

    sampleTypes: Array<SampleType>;

    sportDisciplines: Array<SportDiscipline>;

    timezones: Array<Timezone>;

    witnessChaperones: Array<Participant>;

    constructor(data?: Partial<SectionDownAutoCompletes> | null) {
        const {
            manufacturers = [],
            notifyingChaperones = [],
            sampleTypes = [],
            sportDisciplines = [],
            timezones = [],
            witnessChaperones = [],
        } = data || {};

        this.manufacturers = manufacturers.map((m) => new LocalizedEntity(m));
        this.notifyingChaperones = notifyingChaperones.map((n) => new Participant(n));
        this.sampleTypes = sampleTypes.map((s) => new SampleType(s));
        this.sportDisciplines = sportDisciplines.map((s) => new SportDiscipline(s));
        this.timezones = timezones.map((t) => new Timezone(t));
        this.witnessChaperones = witnessChaperones.map((w) => new Participant(w));
    }
}
