import { IFeatureState } from '@core/store/feature-state';

export interface IEnterpriseState extends IFeatureState {
    dcfRetentionPeriod: string | null;
    error: boolean;
    isDCFDecommissioned: boolean;
    isSampleTimezoneRequired: boolean;
    isTODecommissioned: boolean;
    loading: boolean;
    maxMOResults: number | null;
    maxNumberAdos: number | null;
}

export const initialEnterpriseState: IEnterpriseState = {
    dcfRetentionPeriod: null,
    error: false,
    isDCFDecommissioned: false,
    isSampleTimezoneRequired: false,
    isTODecommissioned: false,
    loading: true,
    maxMOResults: null,
    maxNumberAdos: null,
};
