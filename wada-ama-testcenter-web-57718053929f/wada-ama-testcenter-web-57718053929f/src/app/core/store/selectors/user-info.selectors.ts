import { createSelector } from '@ngrx/store';
import { ListItem, UserRolesEnum } from '@shared/models';
import { userHasRole } from '@core/utils';
import { IOrganization, IPreferences } from '@core/models';
import * as fromRoot from '@core/store/reducers';
import { IUserInfoState } from '@core/store/states/user-info.state';

export const getUserInfoState = (state: fromRoot.IState) => state.userInfo;

export const getPreferences = createSelector(getUserInfoState, (userInfo: IUserInfoState) => userInfo.preferences);

export const getPreferencesLoading = createSelector(getUserInfoState, (userInfo: IUserInfoState) => userInfo.loading);

export const getOrganization = createSelector(
    getPreferences,
    (preferences: IPreferences) => preferences.realOrganization
);

export const getSourceOrganization = createSelector(
    getPreferences,
    (preferences: IPreferences) => preferences.sourceOrganization
);

export const getOrganizationAsListItem = createSelector(getPreferences, (preferences: IPreferences) => {
    return new ListItem({
        id: preferences.realOrganization.id,
        description: preferences.realOrganization.description,
        name: preferences.realOrganization.shortDescription,
    });
});

export const getIsOnlyNadoOrRado = createSelector(
    getOrganization,
    (organization: IOrganization) =>
        organization.antiDopingOrganization && !(organization.sportFederation || organization.wada)
);

export const getOrganizationShortName = createSelector(
    getOrganization,
    (organization: IOrganization) => organization.shortDescription
);

export const getOrganizationName = createSelector(
    getOrganization,
    (organization: IOrganization) => organization.description
);

export const getOrganizationId = createSelector(getOrganization, (organization: IOrganization) => organization.id);

export const getOrganizationisWada = createSelector(
    getOrganization,
    (organization: IOrganization) => organization.wada
);

export const getOrganizationView = createSelector(
    getPreferences,
    (preferences: IPreferences) => preferences.organizationView
);

export const getOrganizationViewShortName = createSelector(
    getOrganizationView,
    (organization: IOrganization) => organization.shortDescription
);

export const getOrganizationViewName = createSelector(
    getOrganizationView,
    (organization: IOrganization) => organization.description
);

export const getOrganizationViewId = createSelector(
    getOrganizationView,
    (organization: IOrganization) => organization.id
);

export const getWadaReadOnly = createSelector(
    getOrganizationId,
    getOrganizationViewId,
    (orgId: number, orgViewId: number) => {
        return orgId !== orgViewId;
    }
);

export const getLocale = createSelector(getPreferences, (preferences: IPreferences) => preferences.locale);

export const getRoles = createSelector(getUserInfoState, (userInfo: IUserInfoState) => userInfo.roles);

export const getHasRole = (
    role: UserRolesEnum | undefined = undefined,
    fallbackRoles: Array<UserRolesEnum> | undefined = undefined
) => createSelector(getRoles, (roles: Array<string>) => userHasRole(roles, role, fallbackRoles));

export const getAreRoleLoaded = createSelector(getUserInfoState, (userInfo: IUserInfoState) => userInfo.rolesAreLoaded);

export const getUserProfile = createSelector(getUserInfoState, (userInfo: IUserInfoState) => userInfo.userProfile);

export const getUserType = createSelector(
    getUserInfoState,
    (userInfo: IUserInfoState) => userInfo.userProfile.userType
);
