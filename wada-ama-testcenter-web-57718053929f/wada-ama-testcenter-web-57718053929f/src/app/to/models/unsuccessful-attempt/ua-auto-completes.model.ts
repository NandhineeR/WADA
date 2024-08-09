import { Participant } from '@shared/models/participant.model';
import { CountryWithRegions, ListItem, LocalizedEntity } from '@shared/models';

export class UAAutoCompletes {
    resultManagementAuthorities: Array<ListItem>;

    dopingControlOfficers: Array<Participant>;

    countries: Array<CountryWithRegions>;

    attemptMethods: Array<LocalizedEntity>;

    constructor(uaAutoCompletes?: UAAutoCompletes) {
        const { countries = [], resultManagementAuthorities = [], dopingControlOfficers = [], attemptMethods = [] } =
            uaAutoCompletes || {};

        this.countries = (countries || []).map((country) => new CountryWithRegions(country));
        this.resultManagementAuthorities = (resultManagementAuthorities || []).map(
            (resultManagementAuthoritiy: ListItem) => new ListItem(resultManagementAuthoritiy)
        );
        this.dopingControlOfficers = (dopingControlOfficers || []).map(
            (dopingControlOfficer: Participant) => new Participant(dopingControlOfficer)
        );
        this.attemptMethods = (attemptMethods || []).map(
            (attemptMethod: LocalizedEntity) => new LocalizedEntity(attemptMethod)
        );
    }
}
