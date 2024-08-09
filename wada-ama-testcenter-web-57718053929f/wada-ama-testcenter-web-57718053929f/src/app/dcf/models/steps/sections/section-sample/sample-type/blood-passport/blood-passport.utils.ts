import { isValidBoolean } from '@shared/utils/boolean-utils';
import { isNullOrBlank } from '@shared/utils/string-utils';
import {
    AltitudeTrainingUtils,
    AltitudeSimulationUtils,
    BloodDonationUtils,
    BloodTransfusionUtils,
} from './specific-models';
import { BloodPassport } from './blood-passport.model';
import { SampleUtils } from '../sample.utils';

export class BloodPassportUtils {
    static requiredBloodPassportFields = {
        Seated: 'seated',
        CollectedAfter3Days: 'collectedAfter3Days',
        HasHadTrainingSession: 'hasHadTrainingSession',
        HasBloodLoss: 'hasBloodLoss',
        HasBloodTransfusion: 'hasBloodTransfusion',
        HasHighAltitudeSimulation: 'hasHighAltitudeSimulation',
        HasHighAltitudeTraining: 'hasHighAltitudeTraining',
        TrainingType: 'trainingType',
        ExtremeEnvironment: 'extremeEnvironment',
        BloodCollectionOfficial: 'bloodCollectionOfficial',
    };

    static requiredBloodPassportInnerFields = {
        AltitudeTraining: 'altitudeTraining',
        AltitudeSimulation: 'altitudeSimulation',
        BloodDonationOrLoss: 'bloodDonationOrLoss',
        BloodTransfusion: 'bloodTransfusion',
    };

    static requiredFields = {
        ...SampleUtils.requiredFields,
        ...BloodPassportUtils.requiredBloodPassportFields,
    };

    static missingFields(bloodPassport: BloodPassport | null = null, multipleDcf = false): Set<string> {
        const missing = new Set<string>(Object.values(this.requiredBloodPassportFields));
        // Removed because it's not required by default
        missing.delete(this.requiredBloodPassportFields.TrainingType);

        SampleUtils.missingFields(bloodPassport).forEach((field: string) => missing.add(field));

        this.removeMissingOrganizationFields(bloodPassport, missing, multipleDcf);
        this.removeMissingCollectionAttributeFields(bloodPassport, missing);
        this.removeMissingTrainingFields(bloodPassport, missing);
        this.removeMissingCollectionBloodFields(bloodPassport, missing);

        return missing;
    }

    private static removeMissingOrganizationFields(
        bloodPassport: BloodPassport | null,
        missing: Set<string>,
        multipleDcf: boolean
    ) {
        if (bloodPassport) {
            if (multipleDcf) {
                missing.delete(this.requiredFields.Laboratory);
            }
        }
    }

    private static removeMissingCollectionAttributeFields(bloodPassport: BloodPassport | null, missing: Set<string>) {
        if (bloodPassport) {
            if (isValidBoolean(bloodPassport.seated)) {
                missing.delete(this.requiredFields.Seated);
            }
            if (isValidBoolean(bloodPassport.collectedAfter3Days)) {
                missing.delete(this.requiredFields.CollectedAfter3Days);
            }
        }
    }

    private static removeMissingTrainingFields(bloodPassport: BloodPassport | null, missing: Set<string>) {
        if (bloodPassport) {
            if (isValidBoolean(bloodPassport.hasHadTrainingSession)) {
                missing.delete(this.requiredFields.HasHadTrainingSession);
                if (bloodPassport.hasHadTrainingSession && isNullOrBlank(bloodPassport.trainingType)) {
                    missing.add(this.requiredBloodPassportFields.TrainingType);
                }
            }
            if (isValidBoolean(bloodPassport.hasHighAltitudeTraining)) {
                missing.delete(this.requiredFields.HasHighAltitudeTraining);
            }
            if (isValidBoolean(bloodPassport.hasHighAltitudeSimulation)) {
                missing.delete(this.requiredFields.HasHighAltitudeSimulation);
            }
            if (bloodPassport.altitudeTraining) {
                AltitudeTrainingUtils.missingFields(bloodPassport.altitudeTraining).forEach((field) =>
                    missing.add(`${this.requiredBloodPassportInnerFields.AltitudeTraining}.${field}`)
                );
            }
            if (bloodPassport.altitudeSimulation) {
                AltitudeSimulationUtils.missingFields(bloodPassport.altitudeSimulation).forEach((field) =>
                    missing.add(`${this.requiredBloodPassportInnerFields.AltitudeSimulation}.${field}`)
                );
            }
        }
    }

    private static removeMissingCollectionBloodFields(bloodPassport: BloodPassport | null, missing: Set<string>) {
        if (bloodPassport) {
            if (isValidBoolean(bloodPassport.hasBloodTransfusion)) {
                missing.delete(this.requiredFields.HasBloodTransfusion);
            }
            if (isValidBoolean(bloodPassport.hasBloodLoss)) {
                missing.delete(this.requiredFields.HasBloodLoss);
            }

            if (bloodPassport.bloodDonationOrLoss) {
                BloodDonationUtils.missingFields(bloodPassport.bloodDonationOrLoss).forEach((field: any) =>
                    missing.add(`${this.requiredBloodPassportInnerFields.BloodDonationOrLoss}.${field}`)
                );
            }
            if (bloodPassport.bloodTransfusion) {
                BloodTransfusionUtils.missingFields(bloodPassport.bloodTransfusion).forEach((field: any) =>
                    missing.add(`${this.requiredBloodPassportInnerFields.BloodTransfusion}.${field}`)
                );
            }
            if (isValidBoolean(bloodPassport.extremeEnvironment)) {
                missing.delete(this.requiredFields.ExtremeEnvironment);
            }
            if (
                bloodPassport.bloodCollectionOfficial &&
                bloodPassport.bloodCollectionOfficial.firstName &&
                bloodPassport.bloodCollectionOfficial.lastName
            ) {
                missing.delete(this.requiredFields.BloodCollectionOfficial);
            }
        }
    }
}
