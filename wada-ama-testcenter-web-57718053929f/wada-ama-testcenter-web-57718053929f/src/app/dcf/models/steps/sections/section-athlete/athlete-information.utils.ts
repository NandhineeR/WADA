import { AthleteInformation } from './athlete-information.model';

export class AthleteUtils {
    static requiredFields = {
        Address: 'address',
        Email: 'email',
        SportDiscipline: 'sportDiscipline',
        Coach: 'coach',
        Doctor: 'doctor',
        AthleteLevel: 'athleteLevel',
    };

    static missingFields(info: AthleteInformation | null = null): Set<string> {
        const missing = new Set<string>(Object.values(this.requiredFields));
        this.removeMissingAthleteFields(info, missing);
        this.removeMissingPersonFields(info, missing);
        return missing;
    }

    private static removeMissingAthleteFields(info: AthleteInformation | null, missing: Set<string>) {
        if (info) {
            if (info.address && info.address.country && info.address.city && info.address.city !== '') {
                missing.delete(this.requiredFields.Address);
            }
            if (info.email || info.emailNotProvided) {
                missing.delete(this.requiredFields.Email);
            }
            if (info.sportDiscipline) {
                missing.delete(this.requiredFields.SportDiscipline);
            }
            if (info.athleteLevel) {
                missing.delete(this.requiredFields.AthleteLevel);
            }
        }
    }

    private static removeMissingPersonFields(info: AthleteInformation | null, missing: Set<string>) {
        if (info) {
            if ((info.coach && info.coach.firstName && info.coach.lastName) || info.coachNotApplicable) {
                missing.delete(this.requiredFields.Coach);
            }
            if ((info.doctor && info.doctor.firstName && info.doctor.lastName) || info.doctorNotApplicable) {
                missing.delete(this.requiredFields.Doctor);
            }
        }
    }
}
