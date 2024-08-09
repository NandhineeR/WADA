import { Participant, SportDiscipline } from '@shared/models';

export class SectionAthleteAutoCompletes {
    coaches: Array<Participant>;

    doctors: Array<Participant>;

    sportDisciplines: Array<SportDiscipline>;

    constructor(data?: Partial<SectionAthleteAutoCompletes> | null) {
        const { coaches = [], doctors = [], sportDisciplines = [] } = data || {};

        this.coaches = coaches.map((coach) => new Participant(coach));
        this.doctors = doctors.map((doctor) => new Participant(doctor));
        this.sportDisciplines = sportDisciplines.map((sportDiscipline) => new SportDiscipline(sportDiscipline));
    }
}
