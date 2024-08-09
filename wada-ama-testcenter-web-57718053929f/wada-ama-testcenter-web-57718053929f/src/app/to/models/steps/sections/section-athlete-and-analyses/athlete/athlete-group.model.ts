import { SearchAthleteResult } from '../search/search-athlete-result.model';

export class AthleteGroup {
    id: string;

    name: string;

    description: string;

    numberOfAthletes: number;

    athletes: Array<SearchAthleteResult>;

    constructor(athleteGroup?: Partial<AthleteGroup> | null) {
        const { id = '', name = '', description = '', numberOfAthletes = 0, athletes = [] } = athleteGroup || {};

        this.id = id;
        this.name = name;
        this.description = description;
        this.numberOfAthletes = numberOfAthletes;
        this.athletes = athletes.map((athlete) => new SearchAthleteResult(athlete));
    }
}
