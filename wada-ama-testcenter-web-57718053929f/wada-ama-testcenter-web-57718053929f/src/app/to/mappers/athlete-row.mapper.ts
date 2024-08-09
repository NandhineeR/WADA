import { EntityDescription, GenericStatus, LocalizedEntity, SpecificCode, SportDiscipline } from '@shared/models';
import { Disability, Athlete, SearchAthleteResult, SearchAthleteRow, Team, Test, Gender } from '@to/models';
import { TranslationMap, TranslationService } from '@core/services';
import * as moment from 'moment';

function buildDisplayedValue(acc: string, value: string): string {
    return `${acc}${acc === '' ? '' : '\n'}${value}`;
}

export function convertSearchAthleteToTest(
    list: Array<SearchAthleteResult | Test>,
    availableSports: Array<SportDiscipline>
): Array<Test> {
    const tests = new Array<Test>();
    list.forEach((item: SearchAthleteResult | Test) => {
        if (isSearchAthleteRow(item)) {
            tests.push(mapAthleteSearchRowToTest(item, availableSports));
        } else {
            const newTest = new Test();
            newTest.athlete = item.athlete ? new Athlete(item.athlete) : null;
            newTest.gender = item.athlete?.sex || Gender.UnknownGender;
            newTest.sportDiscipline =
                item.sportDiscipline && isSportAvailable(item.sportDiscipline, availableSports)
                    ? new SportDiscipline(item.sportDiscipline)
                    : null;
            newTest.status = createDefaultTestStatus();
            newTest.team = item.team;
            tests.push(newTest);
        }
    });
    return tests;
}

export function createDefaultTestStatus(): GenericStatus {
    const status = new GenericStatus();
    status.description = SpecificCode.NotProcessed;
    status.specificCode = SpecificCode.NotProcessed;
    return status;
}

function isSearchAthleteRow(item: SearchAthleteResult | Test): item is SearchAthleteResult {
    return (item as SearchAthleteResult).ifIdNumber !== undefined;
}

function isSportAvailable(sport: SportDiscipline, sports: Array<SportDiscipline>): boolean {
    const available = sports.find(
        (s: SportDiscipline) => s.sportId === sport.sportId && s.disciplineId === sport.disciplineId
    );
    return Boolean(available);
}

function mapAthleteSearchRowToTest(athlete: SearchAthleteResult, sportDisciplines: Array<SportDiscipline>): Test {
    const test = new Test();
    if (athlete !== null) {
        test.athlete = athlete.originalAthlete ? new Athlete(athlete.originalAthlete) : null;
        let i = 0;
        let sportAvailable = false;
        while (!sportAvailable && i < athlete.sportDisciplines.length) {
            sportAvailable = isSportAvailable(athlete.sportDisciplines[i], sportDisciplines);
            i += 1;
        }

        test.sportDiscipline = sportAvailable ? new SportDiscipline(athlete.sportDisciplines[i - 1]) : null;
        test.tempId = athlete.tempId;
        test.status = createDefaultTestStatus();
        test.gender = test.athlete?.sex || Gender.UnknownGender;
    }
    return test;
}

export function mapSearchAthleteToAthleteRows(
    searchAthleteResult: Array<SearchAthleteResult>,
    translation: TranslationMap,
    translationService: TranslationService
): Array<SearchAthleteRow> {
    return searchAthleteResult.map((athlete: SearchAthleteResult) => {
        const athleteRow: SearchAthleteRow = new SearchAthleteRow();
        athleteRow.sportDisciplines = athlete.sportDisciplines.reduce((acc: string, current: SportDiscipline) => {
            return buildDisplayedValue(acc, current.displayDescriptionName);
        }, '');
        athleteRow.analyses = '';
        athleteRow.teams = athlete.teams.reduce((acc: string, current: Team) => {
            return buildDisplayedValue(acc, current.name);
        }, '');
        athleteRow.id = athlete.id;
        athleteRow.name = `${athlete.lastName}, ${athlete.firstName}`;
        athleteRow.accessible = athlete.accessible;
        athleteRow.nationalFederations = athlete.nationalFederations.reduce(
            (acc: string, current: EntityDescription) => {
                return buildDisplayedValue(acc, current.shortDescription);
            },
            ''
        );
        athleteRow.passportCustodian = athlete.passportCustodian?.shortDescription || '';
        athleteRow.whereaboutsCustodianOrganization = athlete.whereaboutsCustodianOrganization?.shortDescription || '';
        athleteRow.testingPoolTypes = athlete.testingPoolTypes.reduce((acc: string, current: LocalizedEntity) => {
            return buildDisplayedValue(acc, current.description);
        }, '');
        athleteRow.sportNationality = athlete.sportNationality?.name || '';
        athleteRow.latestTest = new Date(athlete.latestTest?.setHours(0, 0, 0, 0) || new Date());

        athleteRow.retiredAthlete = athlete.retiredAthlete
            ? translation[translationService.getRetiredKey('yes')]
            : translation[translationService.getRetiredKey('no')];

        athleteRow.naDOIdNumber = athlete.naDOIdNumber;
        athleteRow.ifIdNumber = athlete.ifIdNumber;
        athleteRow.bloodPassportIdNumber = athlete.bloodPassportIdNumber;
        athleteRow.adamsId = athlete.adamsId;
        athleteRow.nfIdNumber = athlete.nfIdNumber;
        athleteRow.preferredName = athlete.preferredName;
        athleteRow.formerLastName = athlete.formerLastName;
        athleteRow.dateOfBirth = moment.utc(athlete.dateOfBirth) || moment();
        athleteRow.age = athlete.age;
        athleteRow.athleteIdHeaderAdamsValue = athlete.adamsId;
        athleteRow.duplicateTest = athlete.duplicateTest;
        athleteRow.disabilities = athlete.disabilities.reduce((acc: string, current: Disability) => {
            return buildDisplayedValue(acc, current.description);
        }, '');
        if (athlete.gender === 'M') {
            athleteRow.sex = translation[translationService.getGenderKey('M')];
        } else if (athlete.gender === 'F') {
            athleteRow.sex = translation[translationService.getGenderKey('F')];
        } else {
            athleteRow.sex = translation[translationService.getGenderKey('X')];
        }
        athleteRow.originalAthlete = new Athlete({
            firstName: athlete.firstName,
            lastName: athlete.lastName,
            id: parseInt(athlete.id, 10) || null,
            accessible: athlete.accessible,
            sportNationality: athlete.sportNationality,
            teams: athlete.teams,
            sportDisciplines: athlete.sportDisciplines,
            sex: athlete.gender,
            disabilities: athlete.disabilities,
            dateOfBirth: athlete.dateOfBirth,
            adamsId: athlete.adamsId,
        });
        return athleteRow;
    });
}
