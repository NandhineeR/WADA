import { Action, createReducer, on } from '@ngrx/store';
import * as fromOrganizations from '@core/store/actions/organizations.actions';
import { initialOrganizationState, IOrganizationsState } from '@core/store/states/organizations.state';

export const organizationsReducer = createReducer(
    initialOrganizationState,
    on(fromOrganizations.GetOrganizations, (state) => ({
        ...state,
        loading: true,
        error: false,
    })),
    on(fromOrganizations.GetOrganizationsSuccess, (state, action) => ({
        ...state,
        loading: false,
        error: false,
        organizations: action.organizations,
    })),
    on(fromOrganizations.GetOrganizationsError, (state) => ({
        ...state,
        loading: false,
        error: true,
        organizations: [],
    })),
    on(fromOrganizations.GetSelectedContract, (state) => ({
        ...state,
        selectedContractHasBeenSet: false,
    })),
    on(fromOrganizations.GetSelectedContractSuccess, (state, action) => ({
        ...state,
        selectedContractHasBeenSet: true,
        selectedContract: action.selectedContract,
        selectedContractMustBeReset: false,
    })),
    on(fromOrganizations.GetSelectedContractError, (state) => ({
        ...state,
        selectedContractHasBeenSet: true,
        selectedContractMustBeReset: true,
    }))
);

export function reducer(state: IOrganizationsState | undefined, action: Action): IOrganizationsState {
    return organizationsReducer(state, action);
}
