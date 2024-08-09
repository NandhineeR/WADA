import { AthleteLevel } from '@to/models';

export class CompetitionLevelAthlete {
    id: number | null;

    competitionLevel: AthleteLevel | null;

    endDate: Date | null;

    startDate: Date | null;

    constructor(competitionLevelAthlete?: Partial<CompetitionLevelAthlete> | null) {
        const { id = null, competitionLevel = null, endDate = null, startDate = null } = competitionLevelAthlete || {};

        this.id = id;
        this.competitionLevel = competitionLevel;
        this.endDate = endDate;
        this.startDate = startDate;
    }
}
