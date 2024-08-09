import { ListItem, Participant } from '@shared/models';

export class SectionNotificationAutoCompletes {
    identificationDocuments: Array<ListItem>;

    notifyingChaperones: Array<Participant>;

    selectionCriteria: Array<ListItem>;

    constructor(data?: Partial<SectionNotificationAutoCompletes> | null) {
        const { identificationDocuments = [], notifyingChaperones = [], selectionCriteria = [] } = data || {};

        this.identificationDocuments = identificationDocuments.map(
            (identificationDocument: any) => new ListItem(identificationDocument)
        );
        this.notifyingChaperones = notifyingChaperones.map((notifyingChaperone) => new Participant(notifyingChaperone));
        this.selectionCriteria = selectionCriteria.map((selectionCriterion) => new ListItem(selectionCriterion));
    }
}
