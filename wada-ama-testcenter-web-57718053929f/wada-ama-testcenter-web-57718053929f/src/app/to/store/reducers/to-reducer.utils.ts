import { cloneDeep, find, remove } from 'lodash-es';
import { Analysis, Laboratory, LaboratoryNote, ListItem } from '@shared/models';
import { IViewTOState } from '@to/store/states/to.state';
import { StepsSection, StepsSubmitted, Test, TestRow, TestingOrder } from '@to/models';
import { adjustTimezoneToLocal } from '@shared/utils';
import {
    AuthorizationInformation,
    AthleteAndAnalysesInformation,
    DopingControlPersonnelInformation,
    TestParticipantsInformation,
} from '@to/models/steps/sections';

export type SectionFormValues =
    | AuthorizationInformation
    | AthleteAndAnalysesInformation
    | DopingControlPersonnelInformation
    | TestParticipantsInformation;

/**
 * This is adding or removing lab notes to the state when some editing is done to the analyses to make sure it
 * gets displayed when coming back to the step2.
 * @param tests Array of added or modified tests
 * @param notes Existing laboratory notes
 */
export function buildLaboratoryNotes(tests: Array<Test>, notes: Array<LaboratoryNote>): Array<LaboratoryNote> {
    const newLabNotes: Array<LaboratoryNote> = new Array<LaboratoryNote>();
    tests.forEach((modifiedTest: Test) => {
        modifiedTest.analyses.forEach((analyse: Analysis) => {
            let matchingLab: number = (notes || []).findIndex((note: LaboratoryNote) => {
                return note.laboratory && analyse.laboratory && note.laboratory.id === analyse.laboratory.id;
            });

            const alreadyExist: number = (newLabNotes || []).findIndex((note: LaboratoryNote) => {
                return note.laboratory && analyse.laboratory && note.laboratory.id === analyse.laboratory.id;
            });

            if (matchingLab === -1) {
                matchingLab = (newLabNotes || []).findIndex((note: LaboratoryNote) => {
                    return note.laboratory && analyse.laboratory && note.laboratory.id === analyse.laboratory.id;
                });
            }

            if (matchingLab > -1) {
                if (alreadyExist === -1) {
                    newLabNotes.push(
                        new LaboratoryNote({
                            ...notes[matchingLab],
                            numberOfOccurrences: 1,
                        })
                    );
                } else {
                    newLabNotes[alreadyExist].numberOfOccurrences += 1;
                }
            } else if (alreadyExist === -1) {
                const labNote = new LaboratoryNote();
                labNote.note = '';
                labNote.numberOfOccurrences = 1;
                labNote.laboratory = new Laboratory(analyse.laboratory);
                newLabNotes.push(labNote);
            }
        });
    });
    return newLabNotes;
}

/**
 * Retreive default authority related with the organization Id
 * @param authorities: {@link TO}
 * @param orgId: number
 * @return The default value {@link ListItem}
 */
function getDefaultAuthority(authorities: Array<ListItem>, orgId: number): ListItem {
    return new ListItem(authorities.find((a) => a.id !== null && a.id === orgId));
}

export function removeTestsFromTO(to: TestingOrder, tests: Array<Test>): TestingOrder {
    const updatedTO = cloneDeep(to);
    const testIds = tests.map((test: Test) => test?.id || '');
    remove(updatedTO.tests, (test: Test) => testIds.includes(test?.id || ''));
    return updatedTO;
}

export function removeTestsWithoutSportDisciplineFromTO(to: TestingOrder, tests: Array<Test>): TestingOrder {
    const updatedTO = cloneDeep(to);
    const testTempIds = tests.map((test: Test) => (!test.sportDiscipline ? test.tempId : ''));
    remove(updatedTO.tests, (test: Test) => testTempIds.includes(test?.tempId || ''));
    return updatedTO;
}

/**
 * Set step1 {@link Authorization} default authorities
 * @param to: {@link TO}
 * @param ados
 * @param concatOrganizations
 * @param orgId: number
 * @return The {@link TO} with the needed default authorities
 */
export function setAuthoritiesDefaultValues(
    to: TestingOrder,
    ados: Array<ListItem>,
    concatOrganizations: Array<ListItem>,
    orgId: number
): TestingOrder {
    if (ados.length === 0 || concatOrganizations.length <= ados.length) {
        return to;
    }

    return {
        ...to,
        testingAuthority: to.testingAuthority?.id ? to.testingAuthority : getDefaultAuthority(ados, orgId),
        sampleCollectionAuthority: to.sampleCollectionAuthority?.id
            ? to.sampleCollectionAuthority
            : getDefaultAuthority(concatOrganizations, orgId),
        resultManagementAuthority: to.resultManagementAuthority?.id
            ? to.resultManagementAuthority
            : getDefaultAuthority(ados, orgId),
    };
}

/**
 * Map the presentation object back to the {@link TO}
 * @param step: number, which step is being mapped back
 * @param state: {@link IViewTOState}
 * @param form: {@link StepFormValues} The presentation object
 * @return the updated state {@link IViewTOState}
 */
function sectionToTestingOrder(section: StepsSection, state: IViewTOState, form: SectionFormValues): IViewTOState {
    switch (section) {
        case StepsSection.AthleteAndAnalysesSection:
            return sectionAuthorizationToTestingOrder(form as AuthorizationInformation, state);
        case StepsSection.AuthorizationSection:
            return sectionAthleteAndTestsToTestingOrder(form as AthleteAndAnalysesInformation, state);
        case StepsSection.DopingControlPersonelSection:
            return sectionDopingControlPersonelToTestingOrder(form as DopingControlPersonnelInformation, state);
        case StepsSection.TestParticipantsSection:
            return sectionTestParticipantsToTestingOrder(form as TestParticipantsInformation, state);
        default:
            return state;
    }
}

function sectionAthleteAndTestsToTestingOrder(
    athleteAndAnalyses: AthleteAndAnalysesInformation,
    state: IViewTOState
): IViewTOState {
    const toClone: TestingOrder = new TestingOrder(state.to);
    const newTests = new Array<Test>();
    athleteAndAnalyses.tests.forEach((test: TestRow) => {
        let newTest: Test | undefined = toClone.tests.find((t: Test) => t.tempId === test.tempId);
        if (newTest) {
            newTest.sportDiscipline = test.sportDiscipline;
            if (newTest.athlete) {
                newTest.athlete.sportDisciplines = test.sportDiscipline ? [test.sportDiscipline] : [];
                [newTest.athlete.lastName, newTest.athlete.firstName] = test.name.split(',');
            }
            newTest.placeHolderDescription = test.placeholder;
            newTest.athleteLevel = test.athleteLevel;
            newTest.team = test.team;
        } else {
            newTest = new Test();
            newTest.gender = test.gender;
            newTest.sportDiscipline = test.sportDiscipline;
            newTest.placeHolderDescription = test.placeholder;
        }

        newTests.push(newTest);
    });
    if (newTests.length) {
        toClone.tests = newTests;
    }

    toClone.laboratoryNotes = athleteAndAnalyses.laboratoryNotes;
    return { ...state, to: toClone };
}

export function sectionAuthorizationToTestingOrder(form: AuthorizationInformation, state: IViewTOState): IViewTOState {
    const toClone = new TestingOrder(state.to);
    toClone.testTiming = form.testTiming;
    toClone.testType = form.testType;
    toClone.testingAuthority = form.testingAuthority;
    toClone.adoReferenceNumber = form.adoReferenceNumber;
    toClone.region = form.region;
    toClone.country = form.country;
    toClone.competitionCategory = form.competitionCategory;
    toClone.startDate = adjustTimezoneToLocal(form.startDate);
    toClone.endDate = adjustTimezoneToLocal(form.endDate);
    toClone.majorGameEvent = form.majorEvent;
    toClone.resultManagementAuthority = form.resultManagementAuthority;
    toClone.sampleCollectionAuthority = form.sampleCollectionAuthority;
    toClone.grantSCAWriteAccess = form.grantSCAWriteAccess;
    toClone.testCoordinator = form.testCoordinator;
    toClone.city = form.city;
    toClone.competitionName = form.competitionName;
    toClone.description = form.descriptionOfTesting;
    toClone.feeForService = form.feeForService;
    toClone.notificationTo = form.notificationTo || [];

    return { ...state, to: toClone };
}

function sectionDopingControlPersonelToTestingOrder(
    dopingControlPersonnel: DopingControlPersonnelInformation,
    state: IViewTOState
): IViewTOState {
    const toClone: TestingOrder = new TestingOrder(state.to);
    toClone.instructions = dopingControlPersonnel.instructions;
    toClone.dcpParticipants = dopingControlPersonnel.dcpParticipants;
    return { ...state, to: toClone };
}

function sectionTestParticipantsToTestingOrder(
    testParticipantsInformation: TestParticipantsInformation,
    state: IViewTOState
): IViewTOState {
    const toClone: TestingOrder = new TestingOrder(state.to);
    toClone.testParticipants = testParticipantsInformation.testParticipants;
    return { ...state, to: toClone };
}

export function submitForm(section: StepsSection, state: IViewTOState, action: any): IViewTOState {
    const updatedState: IViewTOState = sectionToTestingOrder(section, state, action.values);
    const hasBeenSubmitted = new StepsSubmitted(state.hasBeenSubmitted);
    switch (section) {
        case StepsSection.AthleteAndAnalysesSection:
            hasBeenSubmitted.athleteAndAnalysesSectionSubmitted = true;
            break;
        case StepsSection.AuthorizationSection:
            hasBeenSubmitted.authorizationSectionSubmitted = true;
            break;
        case StepsSection.DopingControlPersonelSection:
            hasBeenSubmitted.dopingControlPersonelSectionSubmitted = true;
            break;
        case StepsSection.TestParticipantsSection:
            hasBeenSubmitted.testParticipantsSectionSubmitted = true;
            break;
        default:
            break;
    }
    return {
        ...updatedState,
        hasBeenSubmitted,
        resetTO: section === StepsSection.AuthorizationSection,
    };
}

export function updateAnalysis(to: TestingOrder, analysis: Analysis): TestingOrder {
    const updatedTO = new TestingOrder(to);
    updatedTO.tests.forEach((test) => {
        const updatedAnalysis = find(test.analyses, { id: analysis.id });
        if (updatedAnalysis instanceof Analysis) {
            updatedAnalysis.status = analysis.status;
        }
    });
    return updatedTO;
}

/**
 * Updated tests when setting closed samples not collected
 */
export function updateTests(to: TestingOrder, tests: Array<Test>): TestingOrder {
    const updatedTO = new TestingOrder(to);
    tests.forEach((test) => {
        const updatedTest = find(updatedTO.tests, { id: test.id });
        if (updatedTest instanceof Test) {
            updatedTest.reasonDetail = test.reasonDetail;
            updatedTest.subStatus = test.subStatus;
            updatedTest.status = test.status;
            updatedTest.plannedStartDate = test.plannedStartDate;
            updatedTest.plannedEndDate = test.plannedEndDate;
            updatedTest.analyses.forEach((a, index) => {
                a.status = test.analyses[index].status;
            });
        }
    });
    return updatedTO;
}
