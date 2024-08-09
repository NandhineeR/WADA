import { ListItem, Participant } from '@shared/models';

export class SectionProceduralAutoCompletes {
    athleteRepresentatives: Array<Participant>;

    dcos: Array<Participant>;

    nonConformityCategories: Array<ListItem>;

    constructor(data?: Partial<SectionProceduralAutoCompletes> | null) {
        const { athleteRepresentatives = [], dcos = [], nonConformityCategories = [] } = data || {};

        this.athleteRepresentatives = athleteRepresentatives.map(
            (athleteRepresentative) => new Participant(athleteRepresentative)
        );
        this.dcos = dcos.map((dco) => new Participant(dco));
        this.nonConformityCategories = nonConformityCategories.map((category) => new ListItem(category));
    }
}
