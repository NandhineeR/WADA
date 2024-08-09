import { Analysis, Athlete, ListItem, SportDiscipline } from '@shared/models';

export class UATest {
    toNumber: string;

    id: string;

    toId: string;

    dcfId: string;

    placeholder: string | null;

    isSportDisciplineTdssa: boolean | null;

    athleteAccessible: boolean | null;

    athleteLevel: string;

    analyses: Array<Analysis> | null;

    gender: string | null;

    athleteId: string;

    athlete: Athlete | null;

    inCompetition: boolean | null;

    sportDiscipline: SportDiscipline | null;

    status: string;

    subStatus: string;

    lastUpdateDate: number | null;

    resultManagementAuthority: ListItem | null;

    testingAuthority: ListItem | null;

    testCoordinator: ListItem | null;

    sampleCollectionAuthority: ListItem | null;

    constructor(ua?: Partial<UATest> | null) {
        const {
            id = '',
            toId = '',
            dcfId = '',
            placeholder = null,
            isSportDisciplineTdssa = null,
            athleteAccessible = null,
            athleteLevel = '',
            analyses = null,
            gender = null,
            athleteId = '',
            toNumber = '',
            athlete = null,
            inCompetition = null,
            sportDiscipline = null,
            status = '',
            subStatus = '',
            lastUpdateDate = null,
            resultManagementAuthority = null,
            testingAuthority = null,
            testCoordinator = null,
            sampleCollectionAuthority = null,
        } = ua || {};

        this.id = id;
        this.toId = toId;
        this.dcfId = dcfId;
        this.placeholder = placeholder;
        this.isSportDisciplineTdssa = isSportDisciplineTdssa;
        this.athleteAccessible = athleteAccessible;
        this.athleteLevel = athleteLevel;
        this.analyses = (analyses || []).map((analysis: Analysis) => new Analysis(analysis));
        this.gender = gender;
        this.athleteId = athleteId;
        this.toNumber = toNumber;
        this.athlete = athlete ? new Athlete(athlete) : null;
        this.inCompetition = inCompetition;
        this.sportDiscipline = sportDiscipline ? new SportDiscipline(sportDiscipline) : null;
        this.status = status;
        this.subStatus = subStatus;
        this.lastUpdateDate = lastUpdateDate ? new Date(lastUpdateDate).valueOf() : null;
        this.resultManagementAuthority = resultManagementAuthority ? new ListItem(resultManagementAuthority) : null;
        this.testingAuthority = testingAuthority ? new ListItem(testingAuthority) : null;
        this.testCoordinator = testCoordinator ? new ListItem(testCoordinator) : null;
        this.sampleCollectionAuthority = sampleCollectionAuthority ? new ListItem(sampleCollectionAuthority) : null;
    }
}
