import { isNullOrBlank } from '@shared/utils/string-utils';
import { Participant, SampleTypeEnum } from '@shared/models';
import { Sample } from '../sample.model';
import { MatchingStatus } from '../../matching-status.model';
import { AltitudeTraining, AltitudeSimulation, BloodDonation, BloodTransfusion } from './specific-models';

export class BloodPassport extends Sample {
    sampleTypeSpecificCode: SampleTypeEnum;

    tempLoggerId: string;

    tempLoggerStatus: MatchingStatus | null;

    bloodCollectionOfficial: Participant | null;

    seated: boolean | null;

    collectedAfter3Days: boolean | null;

    hasHadTrainingSession: boolean | null;

    trainingType: string;

    altitudeTraining: AltitudeTraining | null;

    altitudeSimulation: AltitudeSimulation | null;

    bloodDonationOrLoss: BloodDonation | null;

    bloodTransfusion: BloodTransfusion | null;

    extremeEnvironment: boolean | null;

    valid: boolean;

    reasonValid: string | null;

    hasBloodLoss: boolean | null;

    hasBloodTransfusion: boolean | null;

    hasHighAltitudeSimulation: boolean | null;

    hasHighAltitudeTraining: boolean | null;

    constructor(bloodPassport?: Partial<BloodPassport> | null) {
        super(bloodPassport);

        const {
            tempLoggerId = '',
            tempLoggerStatus = null,
            bloodCollectionOfficial = null,
            seated = null,
            collectedAfter3Days = null,
            hasHadTrainingSession = null,
            trainingType = '',
            altitudeTraining = null,
            altitudeSimulation = null,
            bloodDonationOrLoss = null,
            bloodTransfusion = null,
            extremeEnvironment = null,
            valid = true,
            reasonValid = null,
            hasBloodLoss = null,
            hasBloodTransfusion = null,
            hasHighAltitudeSimulation = null,
            hasHighAltitudeTraining = null,
        } = bloodPassport || {};

        this.sampleTypeSpecificCode = SampleTypeEnum.BloodPassport;
        this.tempLoggerId = tempLoggerId;
        this.tempLoggerStatus = tempLoggerStatus ? new MatchingStatus(tempLoggerStatus) : null;
        this.bloodCollectionOfficial = bloodCollectionOfficial ? new Participant(bloodCollectionOfficial) : null;
        this.seated = seated;
        this.collectedAfter3Days = collectedAfter3Days;
        this.hasHadTrainingSession = hasHadTrainingSession;
        this.trainingType = trainingType;
        this.altitudeTraining = altitudeTraining ? new AltitudeTraining(altitudeTraining) : null;
        this.altitudeSimulation = altitudeSimulation ? new AltitudeSimulation(altitudeSimulation) : null;
        this.bloodDonationOrLoss = bloodDonationOrLoss ? new BloodDonation(bloodDonationOrLoss) : null;
        this.bloodTransfusion = bloodTransfusion ? new BloodTransfusion(bloodTransfusion) : null;
        this.extremeEnvironment = extremeEnvironment;
        this.valid = valid;
        this.reasonValid = reasonValid;
        this.hasBloodLoss = hasBloodLoss;
        this.hasBloodTransfusion = hasBloodTransfusion;
        this.hasHighAltitudeSimulation = hasHighAltitudeSimulation;
        this.hasHighAltitudeTraining = hasHighAltitudeTraining;
    }

    get displayBloodCollectionOfficialDescriptionName(): string {
        const firstName = this.bloodCollectionOfficial?.firstName || '';
        const lastName = this.bloodCollectionOfficial?.lastName || '';
        return `${lastName}${!isNullOrBlank(lastName) ? ', ' : ''}${firstName}`;
    }
}
