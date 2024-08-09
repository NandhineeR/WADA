import { CountryWithRegions, ListItem } from '@shared/models';
import { OrganizationRelationship } from '../../../organization-relationship.model';

export class SectionAuthorizationAutoCompletes {
    ados: Array<ListItem>;

    competitionCategories: Array<ListItem>;

    countriesWithRegions: Array<CountryWithRegions>;

    dtps: Array<ListItem>;

    organizationRelationships: Array<OrganizationRelationship>;

    constructor(data?: Partial<SectionAuthorizationAutoCompletes> | null) {
        const {
            ados = [],
            competitionCategories = [],
            countriesWithRegions = [],
            dtps = [],
            organizationRelationships = [],
        } = data || {};

        this.ados = ados.map((ado) => new ListItem(ado));
        this.competitionCategories = competitionCategories.map(
            (competitionCategory) => new ListItem(competitionCategory)
        );
        this.countriesWithRegions = countriesWithRegions.map((country) => new CountryWithRegions(country));
        this.dtps = dtps.map((dtp) => new ListItem(dtp));
        this.organizationRelationships = organizationRelationships.map(
            (organizationRelationship) => new OrganizationRelationship(organizationRelationship)
        );
    }
}
