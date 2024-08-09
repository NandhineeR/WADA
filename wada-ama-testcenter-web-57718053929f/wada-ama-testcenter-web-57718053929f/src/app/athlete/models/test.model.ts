import { Athlete, SportDiscipline } from '@shared/models';

export class Test {
    placeholder: string | null;

    testId: string;

    sportDiscipline: SportDiscipline | null;

    athleteLevel: string;

    athlete: Athlete | null;

    constructor(test?: Partial<Test> | null) {
        const { placeholder = null, testId = '', sportDiscipline = null, athleteLevel = '', athlete = null } =
            test || {};

        this.testId = testId;
        this.placeholder = placeholder;
        this.sportDiscipline = sportDiscipline ? new SportDiscipline(sportDiscipline) : null;
        this.athleteLevel = athleteLevel;
        this.athlete = athlete ? new Athlete(athlete) : null;
    }
}
