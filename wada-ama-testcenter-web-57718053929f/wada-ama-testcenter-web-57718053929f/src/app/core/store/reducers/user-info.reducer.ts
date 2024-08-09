import { Action, createReducer, on } from '@ngrx/store';
import * as fromUserInfoActions from '@core/store/actions/user-info.actions';
import { defaultPreferences, initialUserInfoState, IUserInfoState } from '@core/store/states/user-info.state';

export const userInfoReducer = createReducer(
    initialUserInfoState,
    on(fromUserInfoActions.GetUserInfo, (state) => ({
        ...state,
        loading: true,
        error: false,
    })),
    on(fromUserInfoActions.GetUserInfoError, (state) => ({
        ...state,
        loading: false,
        error: true,
        preferences: defaultPreferences,
    })),
    on(fromUserInfoActions.GetUserRolesSuccess, (state, action) => ({
        ...state,
        roles: action.roles,
        error: false,
        loading: false,
        rolesAreLoaded: true,
    })),
    on(fromUserInfoActions.GetUserProfileSuccess, (state, action) => ({
        ...state,
        userProfile: action.profile,
        loading: false,
    })),
    on(fromUserInfoActions.GetPreferencesSuccess, (state, action) => ({
        ...state,
        loading: false,
        error: false,
        preferences: {
            ...action.preferences,
            organizationView: action.preferences.realOrganization,
        },
    })),
    on(fromUserInfoActions.ChangeOrganizationView, (state, action) => ({
        ...state,
        loading: false,
        error: false,
        preferences: {
            ...state.preferences,
            organizationView: action.organizationView,
        },
    })),
    on(fromUserInfoActions.ResetOrganizationView, (state) => ({
        ...state,
        preferences: {
            ...state.preferences,
            organizationView: state.preferences.realOrganization,
        },
    }))
);

export function reducer(state: IUserInfoState | undefined, action: Action): IUserInfoState {
    return userInfoReducer(state, action);
}
