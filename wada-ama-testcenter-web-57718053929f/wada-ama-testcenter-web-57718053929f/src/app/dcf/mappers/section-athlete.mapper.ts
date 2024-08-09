import { propsUndefined, propsUndefinedOrEmpty } from '@shared/utils/object-util';
import { Address, Participant } from '@shared/models';
import { IDCFState } from '@dcf/store/states/dcf.state';
import { AthleteInformation, DCF } from '@dcf/models';

export function dcfToSectionAthlete(dcf: DCF): AthleteInformation | undefined {
    if (!dcf || !dcf.athlete) {
        return undefined;
    }
    const { athlete } = dcf;

    const email = athlete.email?.trim() || '';

    return new AthleteInformation({
        id: athlete.id,
        address: new Address(athlete.address),
        email: email || '',
        emailNotProvided: athlete.emailNotProvided,
        phone: athlete.phone,
        sportDiscipline: athlete.sportDiscipline,
        athleteLevel: athlete.athleteLevel,
        coach: new Participant(athlete.coach),
        coachNotApplicable: athlete.coachNotApplicable,
        doctor: new Participant(athlete.doctor),
        doctorNotApplicable: athlete.doctorNotApplicable,
        firstName: athlete.firstName,
        lastName: athlete.lastName,
        sex: athlete.sex,
    });
}

export function sectionAthleteToDCF(state: IDCFState, form: AthleteInformation): IDCFState {
    const { athlete } = state.currentDcf;

    const updatedAthlete = new AthleteInformation({
        id: form.id,
        adamsId: athlete?.adamsId || '',
        address: propsUndefined(form.address) ? null : form.address,
        email: form.email || '',
        phone: form.phone,
        sportDiscipline: form.sportDiscipline,
        athleteLevel: form.athleteLevel,
        coach: propsUndefinedOrEmpty(form.coach) || form.coachNotApplicable ? null : form.coach,
        doctor: propsUndefinedOrEmpty(form.doctor) || form.doctorNotApplicable ? null : form.doctor,
        firstName: athlete?.firstName || '',
        lastName: athlete?.lastName || '',
        sex: athlete?.sex || 'X',
        dateOfBirth: athlete?.dateOfBirth || null,
        sportNationality: athlete?.sportNationality || null,
        emailNotProvided: form.emailNotProvided,
        coachNotApplicable: form.coachNotApplicable,
        doctorNotApplicable: form.doctorNotApplicable,
    });

    const updatedDCF = {
        ...state.currentDcf,
        athlete: propsUndefined(updatedAthlete) ? null : updatedAthlete,
    };

    return { ...state, currentDcf: updatedDCF };
}
