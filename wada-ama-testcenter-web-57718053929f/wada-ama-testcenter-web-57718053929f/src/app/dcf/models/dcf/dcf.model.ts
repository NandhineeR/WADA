import { ModificationInfo, Test } from '@shared/models';
import {
    AthleteInformation,
    AuthorizationInformation,
    NotificationInformation,
    ProceduralInformation,
    SampleInformation,
} from '../steps';
import { DCFStatus, DCF_STATUS_DRAFT } from './dcf-status.model';

export class DCF {
    testId: number | null;

    id: number | null;

    hasStatusChangedSinceLastSave = false;

    status: DCFStatus | null;

    authorization: AuthorizationInformation | null;

    notification: NotificationInformation | null;

    athlete: AthleteInformation | null;

    sampleInformation: SampleInformation | null;

    proceduralInformation: ProceduralInformation | null;

    modStampLong: number | null;

    creationInfo: ModificationInfo | null;

    updateInfo: ModificationInfo | null;

    test: Test | null;

    comment: string | null;

    medicationDeclarationFormNumber: string | null;

    confirmationOfProcedureFormNumber: string | null;

    constructor(dcf?: Partial<DCF> | null) {
        const {
            testId = null,
            id = null,
            hasStatusChangedSinceLastSave = false,
            status = new DCFStatus({ specificCode: DCF_STATUS_DRAFT }),
            authorization = null,
            notification = null,
            athlete = null,
            sampleInformation = null,
            proceduralInformation = null,
            modStampLong = null,
            creationInfo = null,
            updateInfo = null,
            test = null,
            comment = null,
            medicationDeclarationFormNumber = null,
            confirmationOfProcedureFormNumber = null,
        } = dcf || {};

        this.testId = testId;
        this.id = id;
        this.hasStatusChangedSinceLastSave = hasStatusChangedSinceLastSave;
        this.status = status ? new DCFStatus(status) : null;
        this.authorization = authorization ? new AuthorizationInformation(authorization) : null;
        this.notification = notification ? new NotificationInformation(notification) : null;
        this.athlete = athlete ? new AthleteInformation(athlete) : null;
        this.sampleInformation = sampleInformation ? new SampleInformation(sampleInformation) : null;
        this.proceduralInformation = proceduralInformation ? new ProceduralInformation(proceduralInformation) : null;
        this.modStampLong = modStampLong;
        this.test = test ? new Test(test) : null;
        this.creationInfo = creationInfo ? new ModificationInfo(creationInfo) : null;
        this.updateInfo = updateInfo ? new ModificationInfo(updateInfo) : null;
        this.comment = comment;
        this.medicationDeclarationFormNumber = medicationDeclarationFormNumber;
        this.confirmationOfProcedureFormNumber = confirmationOfProcedureFormNumber;
    }
}
