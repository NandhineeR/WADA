import { createAction, props } from '@ngrx/store';
import { Organization } from '@core/models';

export const GetOrganizations = createAction('[ORGANIZATIONS] GET ORGANIZATIONS');

export const GetOrganizationsSuccess = createAction(
    '[ORGANIZATIONS] GET ORGANIZATIONS SUCCESS',

    props<{ organizations: Array<Organization> }>()
);

export const GetOrganizationsError = createAction('[ORGANIZATIONS] GET ORGANIZATIONS ERROR');

export const GetSelectedContract = createAction('[ORGANIZATIONS] GET SELECTED CONTRACT');

export const GetSelectedContractSuccess = createAction(
    '[ORGANIZATIONS] GET SELECTED CONTRACT SUCCESS',

    props<{ selectedContract: string | undefined }>()
);

export const GetSelectedContractError = createAction('[ORGANIZATIONS] GET SELECTED CONTRACT ERROR');
