import { UAForm } from './ua-form.model';

export class UAFormUtils {
    static requiredFields = {
        SportDiscipline: 'sportDiscipline',
        ResultManagementAuthority: 'resultManagementAuthority',
        Country: 'country',
        City: 'city',
        Location: 'location',
        SpecifyLocation: 'specifyLocation',
        AttemptDate: 'attemptDate',
        AttemptTimeTo: 'attemptTimeTo',
        AttemptTimeFrom: 'attemptTimeFrom',
        AttemptedContactMethods: 'attemptedContactMethods',
        DopingControlOfficer: 'dopingControlOfficer',
        DateOfReport: 'dateOfReport',
    };

    static missingFields(form: UAForm | null = null): Set<string> {
        const missing = new Set<string>(Object.values(this.requiredFields));

        if (form) {
            this.removeMissingTestFields(form, missing);
            this.removeMissingLocationFields(form, missing);
            this.removeMissingAttemptFields(form, missing);
            this.removeMissingOrganizationFields(form, missing);
            this.removeMissingPersonFields(form, missing);
        }

        return missing;
    }

    private static removeMissingTestFields(form: UAForm | null, missing: Set<string>) {
        if (form) {
            if (form.sportDiscipline !== null && form.sportDiscipline !== undefined) {
                missing.delete(this.requiredFields.SportDiscipline);
            }
            if (form.dateOfReport !== null && form.dateOfReport !== undefined) {
                missing.delete(this.requiredFields.DateOfReport);
            }
        }
    }

    private static removeMissingLocationFields(form: UAForm | null, missing: Set<string>) {
        if (form) {
            if (form.address && form.address.country !== null && form.address.country !== undefined) {
                missing.delete(this.requiredFields.Country);
            }
            if (
                form.address &&
                form.address.city !== null &&
                form.address.city !== undefined &&
                form.address.city !== ''
            ) {
                missing.delete(this.requiredFields.City);
            }
            if (form.location !== null && form.location !== undefined) {
                missing.delete(this.requiredFields.Location);
            }
            if (form.specifyLocation !== null && form.specifyLocation !== undefined) {
                missing.delete(this.requiredFields.SpecifyLocation);
            }
        }
    }

    private static removeMissingAttemptFields(form: UAForm | null, missing: Set<string>) {
        if (form) {
            if (form.attemptDate !== null && form.attemptDate !== undefined) {
                missing.delete(this.requiredFields.AttemptDate);
            }
            if (form.attemptTimeTo !== null && form.attemptTimeTo !== undefined && form.attemptTimeTo !== '') {
                missing.delete(this.requiredFields.AttemptTimeTo);
            }
            if (form.attemptTimeFrom !== null && form.attemptTimeFrom !== undefined && form.attemptTimeFrom !== '') {
                missing.delete(this.requiredFields.AttemptTimeFrom);
            }
            if (
                form.attemptedContactMethods !== null &&
                form.attemptTimeFrom !== undefined &&
                form.attemptedContactMethods.size > 0
            ) {
                missing.delete(this.requiredFields.AttemptedContactMethods);
            }
        }
    }

    private static removeMissingOrganizationFields(form: UAForm | null, missing: Set<string>) {
        if (form) {
            if (form.resultManagementAuthority) {
                missing.delete(this.requiredFields.ResultManagementAuthority);
            }
        }
    }

    private static removeMissingPersonFields(form: UAForm | null, missing: Set<string>) {
        if (form) {
            if (form.dopingControlOfficer !== null && form.dopingControlOfficer !== undefined) {
                missing.delete(this.requiredFields.DopingControlOfficer);
            }
        }
    }
}
