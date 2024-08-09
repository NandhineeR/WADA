import {
    AnalysisDisplay,
    AnalysisResult,
    AthleteAndAnalysesInformation,
    AuthorizationInformation,
    Disability,
    DopingControlPersonnelInformation,
    Test,
    TestRow,
    TestingOrder,
    UASummary,
} from '@to/models';
import { adjustTimezoneToLocal, extractAnalysesName, isNullOrBlank, sortAnalysesBySampleType } from '@shared/utils';

import { ParticipantTypeCode, SpecificCode, TestParticipant } from '@shared/models';
import { calculateAge } from '@to/utils/step.utils';

function mapAthleteDataToTestRow(test: Test, testRow: TestRow) {
    testRow.athleteAccessible = Boolean(test.athlete?.accessible);
    testRow.name =
        test.athlete && !isNullOrBlank(test.athlete.firstName)
            ? `${test.athlete.lastName}, ${test.athlete.firstName}`
            : '';
    if (testRow.name === ', ') {
        testRow.name = '';
    }
    testRow.athleteLevel = test.athleteLevel;
    testRow.dateOfBirth = test.athlete?.dateOfBirth || null;
    testRow.disabilities = (test.athlete?.disabilities || []).map((disability: Disability) => disability.description);
    testRow.gender = test.gender || '';
    testRow.sportNationality = test.athlete?.sportNationality?.name || '';
    testRow.sportDiscipline = test.sportDiscipline || null;
    testRow.age = calculateAge(test.athlete?.dateOfBirth || null);
    testRow.team = test.team;
    testRow.teams = test.athlete?.teams || [];
    testRow.athleteId = test.athlete?.id?.toString() || '';
    testRow.athlete = test.athlete;
}

/**
 * Map informations from a TestingOrder to a presentation object({@link AthleteAndAnalyses})
 * @param to: {@link TO}
 * @return The presentation object: {@link AthleteAndAnalyses}
 */
export function mapTOtoAthleteAndAnalyses(to: TestingOrder | null): AthleteAndAnalysesInformation {
    const athleteAndAnalyses = new AthleteAndAnalysesInformation();
    if (to !== null) {
        athleteAndAnalyses.tests = mapTOtoTestRows(to.tests);
        athleteAndAnalyses.laboratoryNotes = to.laboratoryNotes;
    }
    return athleteAndAnalyses;
}

export function mapTOtoAuthorization(to: TestingOrder | null): AuthorizationInformation {
    const authorization = new AuthorizationInformation();
    if (to !== null) {
        authorization.adoReferenceNumber = to.adoReferenceNumber;
        authorization.city = to.city;
        authorization.competitionCategory = to.competitionCategory;
        authorization.competitionName = to.competitionName;
        authorization.country = to.country;
        authorization.descriptionOfTesting = to.description;
        authorization.endDate = adjustTimezoneToLocal(to.endDate);
        authorization.feeForService = to.feeForService;
        authorization.grantSCAWriteAccess = to.grantSCAWriteAccess;
        authorization.majorEvent = to.majorGameEvent;
        authorization.notificationTo = to.notificationTo;
        authorization.owner = to.owner;
        authorization.region = to.region;
        authorization.resultManagementAuthority = to.resultManagementAuthority;
        authorization.sampleCollectionAuthority = to.sampleCollectionAuthority;
        authorization.startDate = adjustTimezoneToLocal(to.startDate);
        authorization.testCoordinator = to.testCoordinator;
        authorization.testingAuthority = to.testingAuthority;
        authorization.testTiming = to.testTiming;
        authorization.testType = to.testType;
    }
    return authorization;
}

/**
 * Map informations from a TestingOrder to a presentation object({@link DopingControlPeronnel})
 * @param to: {@link TO}
 * @return Presentation object: {@link DopingControlPeronnel}
 */
export function mapTOtoDopingControlPersonnel(to: TestingOrder | null): DopingControlPersonnelInformation {
    const dopingControlPersonnel = new DopingControlPersonnelInformation();
    if (to !== null) {
        dopingControlPersonnel.instructions = to.instructions;
        dopingControlPersonnel.dcpParticipants = reorderDcpParticipantsList(
            (to.dcpParticipants || []).map((dcpParticipant) => new TestParticipant(dcpParticipant))
        );
    }
    return dopingControlPersonnel;
}

/**
 * Map tests from a Testing Order to a presentation object({@link TestRow})
 * @param tests: an array of {@link Test}
 * @return A list of TestRow
 */
export function mapTOtoTestRows(tests: Array<Test> | null): Array<TestRow> {
    if (tests === null) return [];
    return tests.map((test: Test) => {
        const testRow = new TestRow();
        mapAthleteDataToTestRow(test, testRow);
        mapTestDataToTestRow(test, testRow);
        return testRow;
    });
}

function mapTestDataToTestRow(test: Test, testRow: TestRow) {
    testRow.analyses = test.analyses;
    testRow.analysisDisplay = sortAnalysesBySampleType(
        extractAnalysesName(test.id?.toString(), testRow.name, test.analyses)
    );
    testRow.id = test.id;
    testRow.dcfId = test.dcfId;
    // mapping of labs
    testRow.analysisDisplay.forEach((display: AnalysisDisplay) => {
        testRow.laboratories.add(display.lab);
    });

    testRow.status = test.status;
    testRow.placeholder = test.placeHolderDescription;
    testRow.tempId = test.tempId;
    testRow.dcfReadable = test.dcfReadable;
    testRow.dcfStatus = test.dcfStatus;
    testRow.subStatus = test.subStatus;
    testRow.uas = (test.unsuccessfulAttemptSummaries || []).map((uaSummary: UASummary) => new UASummary(uaSummary));
    testRow.analysisResults = (test.analysisResults || []).map(
        (analysisResult: AnalysisResult) => new AnalysisResult(analysisResult)
    );
    testRow.unlinkedTest = test.unlinkedTest;
    testRow.isPlaceholder = test.isPlaceholder;
    testRow.canBeDeleted = test.removable;
    testRow.canBeCancelled = test.cancellable;
    testRow.dcfCreatable = test.dcfCreatable;
    testRow.reasonDetail = test.reasonDetail;
    testRow.plannedStartDate = test.plannedStartDate;
    testRow.plannedEndDate = test.plannedEndDate;
    testRow.athlete = test.athlete;
}

/**
 * Place the Lead dco as the first item in the list
 * @param testParticipants: an array of {@link TestParticipant}
 * @return An ordered array of {@link TestParticipant}
 */
export function reorderDcpParticipantsList(testParticipants: Array<TestParticipant>): Array<TestParticipant> {
    const orderedTestParticipants = new Array<TestParticipant>();
    testParticipants.forEach((testParticipant: TestParticipant) => {
        if (
            testParticipant.type?.code === ParticipantTypeCode.LEAD_DCO &&
            testParticipant.status?.specificCode !== SpecificCode.Rejected
        ) {
            orderedTestParticipants.splice(0, 0, testParticipant);
        } else {
            orderedTestParticipants.push(testParticipant);
        }
    });
    return orderedTestParticipants;
}
