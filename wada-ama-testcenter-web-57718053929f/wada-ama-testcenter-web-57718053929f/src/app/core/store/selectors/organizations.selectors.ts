import { createSelector } from '@ngrx/store';

import * as fromRoot from '@core/store/reducers';
import { IOrganizationsState } from '@core/store/states/organizations.state';

export const getOrganizationsState = (state: fromRoot.IState) => state.organizations;

export const getOrganizations = createSelector(
    getOrganizationsState,
    (state: IOrganizationsState) => state.organizations
);

export const getOrganizationsLoading = createSelector(
    getOrganizationsState,
    (state: IOrganizationsState) => state.loading
);

export const getOrganizationsError = createSelector(getOrganizationsState, (state: IOrganizationsState) => state.error);

export const getSelectedContract = createSelector(
    getOrganizationsState,
    (state: IOrganizationsState) => state.selectedContract
);

export const getSelectedContractHasBeenSet = createSelector(
    getOrganizationsState,
    (state: IOrganizationsState) => state.selectedContractHasBeenSet
);

export const getSelectedContractMustBeReset = createSelector(
    getOrganizationsState,
    (state: IOrganizationsState) => state.selectedContractMustBeReset
);
