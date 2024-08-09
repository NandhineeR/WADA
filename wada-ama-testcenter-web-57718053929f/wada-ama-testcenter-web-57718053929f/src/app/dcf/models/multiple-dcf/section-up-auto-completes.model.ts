import { CountryWithRegions, Laboratory, Participant } from '@shared/models';
import { buildParticipantMap } from '@autocompletes/utils';

export class SectionUpAutoCompletes {
    bloodOfficials: Array<Participant>;

    coachMap: Map<string, Array<Participant>>;

    countriesWithRegions: Array<CountryWithRegions>;

    dcos: Array<Participant>;

    doctorMap: Map<string, Array<Participant>>;

    laboratories: Array<Laboratory>;

    constructor(data?: Partial<SectionUpAutoCompletes> | null) {
        const {
            bloodOfficials = [],
            coachMap = new Map<string, Array<Participant>>(),
            countriesWithRegions = [],
            dcos = [],
            doctorMap = new Map<string, Array<Participant>>(),
            laboratories = [],
        } = data || {};

        this.bloodOfficials = bloodOfficials.map((b) => new Participant(b));
        this.coachMap = buildParticipantMap(coachMap);
        this.countriesWithRegions = countriesWithRegions.map((c) => new CountryWithRegions(c));
        this.dcos = dcos.map((d) => new Participant(d));
        this.doctorMap = buildParticipantMap(doctorMap);
        this.laboratories = laboratories.map((l) => new Laboratory(l));
    }
}
