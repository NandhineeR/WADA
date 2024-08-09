import { createAction, props } from '@ngrx/store';
import { IPreferences } from '@core/models/preferences.model';
import { IUser, Organization } from '@core/models';

export const GetUserInfo = createAction('[USER INFO] GET USER INFO');

export const GetUserInfoError = createAction('[USER INFO] GET USER INFO ERROR');

export const GetPreferencesSuccess = createAction(
    '[USER INFO] GET PREFERENCES SUCCESS',

    props<{ preferences: IPreferences }>()
);

export const ChangeOrganizationView = createAction(
    '[USER INFO] CHANGE ORGANIZATION VIEW',

    props<{ organizationView: Organization }>()
);

export const ResetOrganizationView = createAction('[USER INFO] RESET ORGANIZATION VIEW');

export const GetUserRolesSuccess = createAction(
    '[USER INFO] GET USER ROLES SUCCESS',

    props<{ roles: Array<string> }>()
);

export const GetUserRolesError = createAction('[USER INFO] GET USER ROLES ERROR');

export const GetUserProfileSuccess = createAction(
    '[USER INFO] GET USER PROFILE SUCCESS',

    props<{ profile: IUser }>()
);
