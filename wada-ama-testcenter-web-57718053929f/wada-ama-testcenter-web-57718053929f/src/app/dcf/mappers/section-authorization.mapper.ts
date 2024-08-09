import { IDCFState } from '@dcf/store/states/dcf.state';
import { AuthorizationInformation, DCF } from '@dcf/models';
import { propsUndefined } from '@shared/utils/object-util';
import { TOItem } from '@shared/models';

export function dcfToSectionAuthorization(dcf: DCF): AuthorizationInformation | undefined {
    if (!dcf || !dcf.authorization) {
        return undefined;
    }
    const { authorization } = dcf;

    const toItem = new TOItem();
    toItem.id = authorization.testingOrderId || '';
    toItem.testingOrderNumber = authorization.testingOrderNumber || '';

    return new AuthorizationInformation({
        testingOrder: toItem,
        adoReferenceNumber: authorization.adoReferenceNumber,
        testingAuthority: authorization.testingAuthority,
        sampleCollectionAuthority: authorization.sampleCollectionAuthority,
        resultManagementAuthority: authorization.resultManagementAuthority,
        testCoordinator: authorization.testCoordinator,
    });
}

export function sectionAuthorizationToDCF(state: IDCFState, form: AuthorizationInformation): IDCFState {
    const auth = new AuthorizationInformation({
        testingOrderNumber: form.testingOrder?.testingOrderNumber || null,
        testingOrderId: form.testingOrder?.id || null,
        adoReferenceNumber: form.adoReferenceNumber,
        testingAuthority: form.testingAuthority,
        sampleCollectionAuthority: form.sampleCollectionAuthority,
        resultManagementAuthority: form.resultManagementAuthority,
        testCoordinator: form.testCoordinator,
    });

    const updatedDCF = {
        ...state.currentDcf,
        authorization: propsUndefined(auth) ? null : auth,
    };

    return { ...state, currentDcf: updatedDCF };
}
