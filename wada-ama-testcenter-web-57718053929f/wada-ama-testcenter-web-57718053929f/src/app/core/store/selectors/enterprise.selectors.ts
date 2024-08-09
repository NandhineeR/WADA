import { createSelector } from '@ngrx/store';
import * as fromRoot from '@core/store/reducers';
import { IEnterpriseState } from '../states/enterprise.state';

export const getEnterpriseState = (state: fromRoot.IState) => state.enterprise;

export const getDcfDataRetentionPeriod = createSelector(
    getEnterpriseState,
    (enterprise: IEnterpriseState) => enterprise.dcfRetentionPeriod
);

export const getMaxMOResults = createSelector(
    getEnterpriseState,
    (enterprise: IEnterpriseState) => enterprise.maxMOResults
);

export const getMaxNumberAdos = createSelector(
    getEnterpriseState,
    (enterprise: IEnterpriseState) => enterprise.maxNumberAdos
);

export const isDCFDecommissioned = createSelector(
    getEnterpriseState,
    (enterprise: IEnterpriseState) => enterprise.isDCFDecommissioned
);

export const isSampleTimezoneRequired = createSelector(
    getEnterpriseState,
    (enterprise: IEnterpriseState) => enterprise.isSampleTimezoneRequired
);

export const isTODecommissioned = createSelector(
    getEnterpriseState,
    (enterprise: IEnterpriseState) => enterprise.isTODecommissioned
);
