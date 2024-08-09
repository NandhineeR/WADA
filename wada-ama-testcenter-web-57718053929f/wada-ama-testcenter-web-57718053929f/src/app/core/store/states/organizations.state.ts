import { Organization } from '@core/models';
import { IFeatureState } from '..';

export interface IOrganizationsState extends IFeatureState {
    loading: boolean;
    error: boolean;
    organizations: Array<Organization>;
    selectedContract: string | undefined; // the selected contract is actually the third party source organization id
    selectedContractHasBeenSet: boolean; // indicates that the initial retrieval of the selected contract has been done
    selectedContractMustBeReset: boolean; // if the initial retrieval failed, the value must be reset on the first successful call
}

export const initialOrganizationState: IOrganizationsState = {
    loading: false,
    error: false,
    organizations: [],
    selectedContract: undefined,
    selectedContractHasBeenSet: false,
    selectedContractMustBeReset: false,
};
