import { IPreferences, IUser, Organization } from '@core/models';
import { IFeatureState } from '@core/store/feature-state';

export interface IUserInfoState extends IFeatureState {
    loading: boolean;
    error: boolean;
    preferences: IPreferences;
    roles: Array<string>;
    rolesAreLoaded: boolean;
    userProfile: IUser;
}

export const DEFAULT_ORGANIZATION_ID = -1;
export const defaultPreferences: IPreferences = {
    locale: '',
    realOrganization: new Organization({
        id: DEFAULT_ORGANIZATION_ID,
        description: '',
        shortDescription: '',
        sportFederation: false,
        antiDopingOrganization: false,
        wada: true,
    }),
    organizationView: new Organization({
        id: DEFAULT_ORGANIZATION_ID,
        description: '',
        shortDescription: '',
        sportFederation: false,
        antiDopingOrganization: false,
        wada: true,
    }),
    sourceOrganization: new Organization({
        id: DEFAULT_ORGANIZATION_ID,
        description: '',
        shortDescription: '',
        sportFederation: false,
        antiDopingOrganization: false,
        wada: true,
    }),
};

const defaultUser: IUser = {
    username: '',
    userId: '',
    userType: '',
};

export const initialUserInfoState: IUserInfoState = {
    loading: true,
    error: false,
    preferences: defaultPreferences,
    roles: [],
    rolesAreLoaded: false,
    userProfile: defaultUser,
};
