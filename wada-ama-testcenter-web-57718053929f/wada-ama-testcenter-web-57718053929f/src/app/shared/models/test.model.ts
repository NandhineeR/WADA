import { Analysis } from './analysis.model';
import { Athlete } from './athlete.model';
import { Country } from './country.model';
import { ListItem } from './list-item.model';
import { MajorEvent } from './major-event.model';
import { Participant } from './participant.model';
import { Region } from './region.model';
import { SportDiscipline } from './sport-discipline.model';

export class Test {
    placeholder: string | null;

    id: string;

    sportDiscipline: SportDiscipline | null;

    athleteLevel: string;

    athlete: Athlete | null;

    toId: string;

    testingOrderNumber: string;

    testingAuthority: ListItem | null;

    sampleCollectionAuthority: ListItem | null;

    resultManagementAuthority: ListItem | null;

    testCoordinator: ListItem | null;

    adoReferenceNumber: string;

    country: Country | null;

    region: Region | null;

    city: string;

    testType: boolean | null;

    majorEvent: MajorEvent | null;

    competitionName: string;

    serviceFee: boolean | null;

    analyses: Array<Analysis>;

    notifyingChaperone: Participant | null;

    coach: Participant | null;

    doctor: Participant | null;

    witnessChaperone: Participant | null;

    bloodCollectionOfficer: Participant | null;

    athleteRepresentative: Participant | null;

    dopingControlOfficer: Participant | null;

    gender: string | null;

    // NOSONAR
    constructor(test?: Partial<Test> | null) {
        const {
            id = '',
            placeholder = null,
            sportDiscipline = null,
            athleteLevel = '',
            athlete = null,
            toId = '',
            testingOrderNumber = '',
            testingAuthority = null,
            sampleCollectionAuthority = null,
            resultManagementAuthority = null,
            testCoordinator = null,
            adoReferenceNumber = '',
            country = null,
            region = null,
            city = '',
            testType = null,
            majorEvent = null,
            competitionName = '',
            serviceFee = null,
            analyses = [],
            notifyingChaperone = null,
            coach = null,
            doctor = null,
            witnessChaperone = null,
            bloodCollectionOfficer = null,
            athleteRepresentative = null,
            dopingControlOfficer = null,
            gender = null,
        } = test || {};
        this.id = id;
        this.placeholder = placeholder;
        this.sportDiscipline = sportDiscipline ? new SportDiscipline(sportDiscipline) : null;
        this.athleteLevel = athleteLevel;
        this.athlete = athlete ? new Athlete(athlete) : null;
        this.toId = toId;
        this.testingAuthority = testingAuthority ? new ListItem(testingAuthority) : null;
        this.sampleCollectionAuthority = sampleCollectionAuthority ? new ListItem(sampleCollectionAuthority) : null;
        this.resultManagementAuthority = resultManagementAuthority ? new ListItem(resultManagementAuthority) : null;
        this.testCoordinator = testCoordinator ? new ListItem(testCoordinator) : null;
        this.adoReferenceNumber = adoReferenceNumber;
        this.city = city;
        this.serviceFee = serviceFee;
        this.testType = testType;
        this.majorEvent = majorEvent;
        this.competitionName = competitionName;
        this.country = country ? new Country(country) : null;
        this.region = region ? new Region(region) : null;
        this.testingOrderNumber = testingOrderNumber;
        this.analyses = analyses?.map((analysis: Analysis) => new Analysis(analysis)) || [];
        this.notifyingChaperone = notifyingChaperone ? new Participant(notifyingChaperone) : null;
        this.coach = coach ? new Participant(coach) : null;
        this.doctor = doctor ? new Participant(doctor) : null;
        this.witnessChaperone = witnessChaperone ? new Participant(witnessChaperone) : null;
        this.bloodCollectionOfficer = bloodCollectionOfficer ? new Participant(bloodCollectionOfficer) : null;
        this.athleteRepresentative = athleteRepresentative ? new Participant(athleteRepresentative) : null;
        this.dopingControlOfficer = dopingControlOfficer ? new Participant(dopingControlOfficer) : null;
        this.gender = gender;
    }
}
