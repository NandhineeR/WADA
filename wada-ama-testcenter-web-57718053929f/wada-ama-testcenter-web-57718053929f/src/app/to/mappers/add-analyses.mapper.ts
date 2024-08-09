import { Athlete, Test, TestRow } from '@to/models';
import { isNullOrBlank } from '@shared/utils/string-utils';
import { CountryWithRegions } from '@shared/models';

export function mapTestRowToTest(testRow: TestRow, countryWithRegions: CountryWithRegions): Test {
    const test = new Test();
    test.tempId = testRow.tempId;
    test.analyses = testRow.analyses;
    test.id = testRow.id;
    test.status = testRow.status;
    test.sportDiscipline = testRow.sportDiscipline;
    test.dcfId = testRow.dcfId;
    test.athleteAccessible = testRow.athleteAccessible;
    test.athleteLevel = testRow.athleteLevel;
    test.team = testRow.team;
    test.placeHolderDescription = testRow.placeholder;
    test.gender = testRow.gender;
    const athlete = new Athlete();
    athlete.id = Number(testRow.athleteId) || null;
    if (!isNullOrBlank(testRow.name)) {
        athlete.firstName = testRow.getAthleteFirstName();
        athlete.lastName = testRow.getAthleteLastName();
    }
    athlete.accessible = testRow.athleteAccessible;
    athlete.dateOfBirth = testRow.dateOfBirth;
    if (athlete.id !== null) athlete.sex = testRow.gender;
    athlete.sportNationality = countryWithRegions;
    if (testRow.sportDiscipline) athlete.sportDisciplines.push(testRow.sportDiscipline);
    athlete.teams = testRow.teams;
    athlete.adamsId = testRow.athlete?.adamsId;
    test.athlete = athlete;
    return test;
}
