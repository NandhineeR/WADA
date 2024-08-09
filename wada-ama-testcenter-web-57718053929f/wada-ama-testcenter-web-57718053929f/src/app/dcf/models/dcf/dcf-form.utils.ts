import { isNullOrBlank } from '@shared/utils';
import { DCFForm } from './dcf-form.model';

export class DCFFormUtils {
    static requiredFields = {
        City: 'city',
        SportDiscipline: 'sportDiscipline',
        NotificationDate: 'notificationDate',
        notificationTimezone: 'notificationTimezone',
        AdvanceNotice: 'advanceNotice',
        FeeForService: 'feeForService',
        NotifyingChaperone: 'notifyingChaperone',
        Coach: 'coach',
        Doctor: 'doctor',
        ArrivalDate: 'arrivalDate',
        arrivalTimezone: 'arrivalTimezone',
        DCO: 'dco',
        ConsentForResearch: 'consentForResearch',
    };

    static missingFields(form: DCFForm | null = null): Set<string> {
        const missing = new Set<string>(Object.values(this.requiredFields));

        if (form) {
            this.removeMissingAthleteFields(form, missing);
            this.removeMissingNotificationFields(form, missing);
            this.removeMissingParticipantFields(form, missing);
            this.removeMissingDCFFields(form, missing);
        }

        return missing;
    }

    private static removeMissingAthleteFields(form: DCFForm | null, missing: Set<string>) {
        if (form) {
            if (form.sportDiscipline) {
                missing.delete(this.requiredFields.SportDiscipline);
            }

            if (form.address && !isNullOrBlank(form.address.city)) {
                missing.delete(this.requiredFields.City);
            }
        }
    }

    private static removeMissingNotificationFields(form: DCFForm | null, missing: Set<string>) {
        if (form) {
            if (form.notificationDate) {
                missing.delete(this.requiredFields.NotificationDate);
            } else {
                missing.delete(this.requiredFields.notificationTimezone);
            }

            if (form.notificationTimezone) {
                missing.delete(this.requiredFields.notificationTimezone);
            }

            if (form.advanceNotice !== undefined && form.advanceNotice !== null) {
                missing.delete(this.requiredFields.AdvanceNotice);
            }
        }
    }

    private static removeMissingParticipantFields(form: DCFForm | null, missing: Set<string>) {
        if (form) {
            if (form.notifyingChaperone) {
                missing.delete(this.requiredFields.NotifyingChaperone);
            }

            if (form.coach || form.coachNotApplicable) {
                missing.delete(this.requiredFields.Coach);
            }

            if (form.doctor || form.doctorNotApplicable) {
                missing.delete(this.requiredFields.Doctor);
            }

            if (form.dco) {
                missing.delete(this.requiredFields.DCO);
            }
        }
    }

    private static removeMissingDCFFields(form: DCFForm | null, missing: Set<string>) {
        if (form) {
            if (form.feeForService !== undefined && form.feeForService !== null) {
                missing.delete(this.requiredFields.FeeForService);
            }

            if (form.arrivalDate) {
                missing.delete(this.requiredFields.ArrivalDate);
            } else {
                missing.delete(this.requiredFields.arrivalTimezone);
            }

            if (form.arrivalTimezone) {
                missing.delete(this.requiredFields.arrivalTimezone);
            }

            if (form.consentForResearch !== null && form.consentForResearch !== undefined) {
                missing.delete(this.requiredFields.ConsentForResearch);
            }
        }
    }
}
