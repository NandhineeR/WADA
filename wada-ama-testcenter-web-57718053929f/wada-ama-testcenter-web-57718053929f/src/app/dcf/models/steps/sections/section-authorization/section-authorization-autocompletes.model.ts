import { ListItem } from '@shared/models';

/**
 * The authorities are displayed in the order specified by the user interface (UI).
 */
export class SectionAuthorizationAutoCompletes {
    ados: Array<ListItem>;

    dtps: Array<ListItem>;

    concatOrganizations: Array<ListItem>;

    constructor(data?: Partial<SectionAuthorizationAutoCompletes> | null) {
        const { ados = [], dtps = [] } = data || {};

        this.ados = ados.map((ado) => new ListItem(ado));
        this.dtps = dtps.map((dtp) => new ListItem(dtp));
        this.concatOrganizations = [...this.ados, ...this.dtps];
    }
}
