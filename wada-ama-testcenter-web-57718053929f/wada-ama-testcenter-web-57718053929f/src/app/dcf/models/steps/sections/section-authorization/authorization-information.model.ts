import { ListItem, TOItem } from '@shared/models';

export class AuthorizationInformation {
    adoReferenceNumber: string | null;

    resultManagementAuthority: ListItem | null;

    sampleCollectionAuthority: ListItem | null;

    testCoordinator: ListItem | null;

    testingAuthority: ListItem | null;

    testingOrder: TOItem | null;

    testingOrderId: string | null;

    testingOrderNumber: string | null;

    constructor(form?: Partial<AuthorizationInformation> | null) {
        const {
            adoReferenceNumber = null,
            resultManagementAuthority = null,
            sampleCollectionAuthority = null,
            testCoordinator = null,
            testingAuthority = null,
            testingOrder = null,
            testingOrderId = null,
            testingOrderNumber = null,
        } = form || {};

        this.adoReferenceNumber = adoReferenceNumber;
        this.resultManagementAuthority = resultManagementAuthority ? new ListItem(resultManagementAuthority) : null;
        this.sampleCollectionAuthority = sampleCollectionAuthority ? new ListItem(sampleCollectionAuthority) : null;
        this.testCoordinator = testCoordinator ? new ListItem(testCoordinator) : null;
        this.testingAuthority = testingAuthority ? new ListItem(testingAuthority) : null;
        this.testingOrder = testingOrder;
        this.testingOrderId = testingOrderId;
        this.testingOrderNumber = testingOrderNumber;
    }
}
