import { DCF } from '@dcf/models';
import { dcfDiff } from '@dcf/utils/dcf.utils';

/**
 * Returns partial DCF containing only modified fields, when compared the updated dcf with the original dcf
 *
 * @param updatedDcf - dcf already saved
 * @param originalDcf - dcf to be saved
 */
export function getDcfWithModifiedFields(updatedDcf: DCF, originalDcf: DCF): DCF {
    const partialDcf: DCF = dcfDiff(updatedDcf, originalDcf);
    setUpdatedNotificationFields(partialDcf, updatedDcf);
    setUpdatedAthleteFields(partialDcf, updatedDcf);
    setUpdatedSampleFields(partialDcf, updatedDcf);
    setUpdatedProceduralInformationFields(partialDcf, updatedDcf);
    return partialDcf;
}

function setUpdatedNotificationFields(partialDcf: DCF, updatedDcf: DCF) {
    if (partialDcf.notification && partialDcf.notification.notifyingChaperone) {
        partialDcf.notification.notifyingChaperone = updatedDcf.notification?.notifyingChaperone || null;
    }
    if (partialDcf.notification) {
        partialDcf.notification = updatedDcf.notification || null;
    }
}

function setUpdatedAthleteFields(partialDcf: DCF, updatedDcf: DCF) {
    setUpdatedAthleteInfoFields(partialDcf, updatedDcf);
    setUpdatedAthletePersonFields(partialDcf, updatedDcf);
}

function setUpdatedAthleteInfoFields(partialDcf: DCF, updatedDcf: DCF) {
    if (partialDcf.athlete) {
        if (partialDcf.athlete.address) {
            partialDcf.athlete.address = updatedDcf.athlete?.address || null;
        }
        if (partialDcf.athlete.phone) {
            partialDcf.athlete.phone = updatedDcf.athlete?.phone || null;
        }
        if (partialDcf.athlete.sportDiscipline) {
            if (partialDcf.athlete.sportDiscipline.disciplineId && !partialDcf.athlete.sportDiscipline.sportId) {
                partialDcf.athlete.sportDiscipline.sportId = updatedDcf.athlete?.sportDiscipline?.sportId || null;
                partialDcf.athlete.sportDiscipline.sportDescription =
                    updatedDcf.athlete?.sportDiscipline?.sportDescription || '';
            }
        }
    }
}

function setUpdatedAthletePersonFields(partialDcf: DCF, updatedDcf: DCF) {
    if (partialDcf.athlete) {
        if (partialDcf.athlete.doctor) {
            partialDcf.athlete.doctor = updatedDcf.athlete?.doctor || null;
        }
        if (partialDcf.athlete.coach) {
            partialDcf.athlete.coach = updatedDcf.athlete?.coach || null;
        }
    }
}

function setUpdatedSampleFields(partialDcf: DCF, updatedDcf: DCF) {
    if (partialDcf.sampleInformation) {
        if (updatedDcf.sampleInformation && updatedDcf.sampleInformation.samples) {
            partialDcf.sampleInformation = updatedDcf.sampleInformation;
        }
    }
}

function setUpdatedProceduralInformationFields(partialDcf: DCF, updatedDcf: DCF) {
    setUpdatedTestPersonFields(partialDcf, updatedDcf);
    setUpdatedTestOtherProceduralFields(partialDcf, updatedDcf);
}

function setUpdatedTestPersonFields(partialDcf: DCF, updatedDcf: DCF) {
    if (partialDcf.proceduralInformation) {
        if (partialDcf.proceduralInformation.athleteRepresentative) {
            partialDcf.proceduralInformation.athleteRepresentative =
                updatedDcf.proceduralInformation?.athleteRepresentative || null;
        }
        if (partialDcf.proceduralInformation.dco) {
            partialDcf.proceduralInformation.dco = updatedDcf.proceduralInformation?.dco || null;
        }
    }
}

function setUpdatedTestOtherProceduralFields(partialDcf: DCF, updatedDcf: DCF) {
    if (partialDcf.proceduralInformation) {
        if (partialDcf.proceduralInformation.endOfProcedureDate) {
            partialDcf.proceduralInformation.endOfProcedureDate =
                updatedDcf.proceduralInformation?.endOfProcedureDate || null;
        }

        if (partialDcf.proceduralInformation.nonConformities)
            partialDcf.proceduralInformation.nonConformities = updatedDcf.proceduralInformation?.nonConformities || [];
    }
}
