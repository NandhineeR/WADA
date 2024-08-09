import { IOrganization } from './organization.model';

export interface IPreferences {
    locale: string;
    realOrganization: IOrganization;
    organizationView: IOrganization;
    sourceOrganization: IOrganization;
}
