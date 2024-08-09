import {
    AnalysisValues,
    SampleValues,
    TDPCell,
    TDPRow,
    TDPSheet,
    TDPSheetInfo,
    TDPSubRow,
    TDPTotals,
} from '@tdp/models';
import { TestPlanning } from '@tdp/models/test-planning.model';
import { TestPlanningWrapper } from '@tdp/models/test-planning-wrapper.model';

export function mapTDPSheetInfoToTestPlanning(tdpSheet: TDPSheet): Array<TestPlanning> {
    const testPlanningList = new Array<TestPlanning>();
    tdpSheet.yearly.forEach((tdpSheetInfo) => {
        mapTDPSheetInfoToTestPlanningList(tdpSheetInfo, testPlanningList);
    });
    tdpSheet.monthly.forEach((tdpSheetInfo) => {
        mapTDPSheetInfoToTestPlanningList(tdpSheetInfo, testPlanningList);
    });
    tdpSheet.quarterly.forEach((tdpSheetInfo) => {
        mapTDPSheetInfoToTestPlanningList(tdpSheetInfo, testPlanningList);
    });
    return testPlanningList;
}

function mapTDPSheetInfoToTestPlanningList(tdpSheetInfo: TDPSheetInfo, testPlanningList: Array<TestPlanning>): void {
    tdpSheetInfo.rows.forEach((sport) => {
        sport.subRows.forEach((discipline) => {
            if (discipline.isDirty) {
                discipline.tdpTotals.samples.forEach((sample) => {
                    mapSampleValuesToTestPlanningInfo(sample, testPlanningList, tdpSheetInfo, sport, discipline);
                });

                discipline.tdpTotals.analyses.forEach((analysis) => {
                    mapAnalysisValuesToTestPlanningInfo(analysis, testPlanningList, tdpSheetInfo, sport, discipline);
                });
            }
        });
    });
}

function mapSampleValuesToTestPlanningInfo(
    sample: SampleValues,
    testPlanningList: Array<TestPlanning>,
    tdpSheetInfo: TDPSheetInfo,
    sport: TDPRow,
    discipline: TDPSubRow
) {
    // for each sample, there are two values: one for IC (true), the other for OOC (false)
    if (sample.inCompetitionCell.isDirty) {
        testPlanningList.push(createTestPlanningInfoFromSample(tdpSheetInfo, sport, discipline, sample, true));
    }
    if (sample.outOfCompetitionCell.isDirty) {
        testPlanningList.push(createTestPlanningInfoFromSample(tdpSheetInfo, sport, discipline, sample, false));
    }
}

function mapAnalysisValuesToTestPlanningInfo(
    analysis: AnalysisValues,
    testPlanningList: Array<TestPlanning>,
    tdpSheetInfo: TDPSheetInfo,
    sport: TDPRow,
    discipline: TDPSubRow
) {
    if (analysis.inCompetitionCell.isDirty) {
        testPlanningList.push(createTestPlanningInfoFromAnalysis(tdpSheetInfo, sport, discipline, analysis, true));
    }
    if (analysis.outOfCompetitionCell.isDirty) {
        testPlanningList.push(createTestPlanningInfoFromAnalysis(tdpSheetInfo, sport, discipline, analysis, false));
    }
}

function createTestPlanningInfoFromSample(
    tdpSheetInfo: TDPSheetInfo,
    sport: TDPRow,
    discipline: TDPSubRow,
    sample: SampleValues,
    inCompetition: boolean
): TestPlanning {
    const testPlanning = new TestPlanning();
    testPlanning.year = tdpSheetInfo.year;
    testPlanning.startMonth = tdpSheetInfo.startMonth;
    testPlanning.endMonth = tdpSheetInfo.endMonth;
    testPlanning.inCompetition = inCompetition;
    testPlanning.sportId = sport.sportId.toString();
    testPlanning.sportDescription = sport.sportName;
    testPlanning.sportDisciplineId = discipline.disciplineId.toString();
    testPlanning.sportDisciplineDescription = discipline.disciplineName;
    testPlanning.id = inCompetition ? sample.inCompetitionCell.id || null : sample.outOfCompetitionCell.id || null;
    testPlanning.numberOfTests = inCompetition ? sample.inCompetitionCell.value : sample.outOfCompetitionCell.value;
    testPlanning.sampleTypeId = sample.sampleTypeId;
    testPlanning.sampleTypeDescription = sample.sampleType;
    testPlanning.testingSubstanceCategoryId = '';
    testPlanning.testingSubstanceCategorySpecificCode = '';
    return testPlanning;
}

function createTestPlanningInfoFromAnalysis(
    tdpSheetInfo: TDPSheetInfo,
    sport: TDPRow,
    discipline: TDPSubRow,
    analysis: AnalysisValues,
    inCompetition: boolean
): TestPlanning {
    const testPlanning = new TestPlanning();
    testPlanning.year = tdpSheetInfo.year;
    testPlanning.startMonth = tdpSheetInfo.startMonth;
    testPlanning.endMonth = tdpSheetInfo.endMonth;
    testPlanning.inCompetition = inCompetition;
    testPlanning.sportId = sport.sportId.toString();
    testPlanning.sportDescription = sport.sportName;
    testPlanning.sportDisciplineId = discipline.disciplineId.toString();
    testPlanning.sportDisciplineDescription = discipline.disciplineName;
    testPlanning.id = inCompetition ? analysis.inCompetitionCell.id || null : analysis.outOfCompetitionCell.id || null;
    testPlanning.numberOfTests = inCompetition ? analysis.inCompetitionCell.value : analysis.outOfCompetitionCell.value;
    testPlanning.testingSubstanceCategoryId = analysis.analysisCategoryCode || '';
    testPlanning.testingSubstanceCategorySpecificCode = analysis.analysisCategory;
    testPlanning.sampleTypeId = null;
    testPlanning.sampleTypeDescription = '';
    return testPlanning;
}

export function testPlanningToTDPSheet(sheet: TDPSheet, testPlanningWrapper: TestPlanningWrapper): TDPSheet {
    const tdpSheet = sheet.clone();
    if (testPlanningWrapper.testPlannings && testPlanningWrapper.testPlannings.length > 0) {
        testPlanningWrapper.testPlannings.forEach((testPlanning: TestPlanning) => {
            findAndUpdateTDPSheetInfo(sheet, testPlanning);
        });
    }

    tdpSheet.monthly.sort(sortByStartMonth);
    tdpSheet.quarterly.sort(sortByStartMonth);
    tdpSheet.concurrentUsers = testPlanningWrapper.concurrentUsers || null;
    return tdpSheet;
}

function findAndUpdateTDPSheetInfo(tdpSheet: TDPSheet, testPlanning: TestPlanning) {
    let tdpSheetInfoList: Array<TDPSheetInfo> = [];
    let month = 0;
    if (testPlanning && testPlanning.endMonth && testPlanning.startMonth) {
        month = testPlanning.endMonth - testPlanning.startMonth;
    }
    switch (month) {
        case 0: // Monthly
            tdpSheetInfoList = tdpSheet.monthly;
            break;
        case 2: // Quarterly
            tdpSheetInfoList = tdpSheet.quarterly;
            break;
        case 11: // Yearly
            tdpSheetInfoList = tdpSheet.yearly;
            break;
        default:
            tdpSheetInfoList = tdpSheet.monthly;
            break;
    }

    // Check to see if the sheetInfo already exists
    const tdpSheetInfo = tdpSheetInfoList
        .find(
            (currentTdpSheetInfo) =>
                currentTdpSheetInfo.year === testPlanning.year &&
                currentTdpSheetInfo.startMonth === testPlanning.startMonth &&
                currentTdpSheetInfo.endMonth === testPlanning.endMonth
        )
        ?.clone();

    if (tdpSheetInfo) {
        updateTDPSheetInfo(testPlanning, tdpSheetInfo);
    }
}

function updateTDPSheetInfo(testPlanning: TestPlanning, tdpSheetInfo: TDPSheetInfo) {
    // Check to see if the row (Sport) already exists
    let tdpRow = tdpSheetInfo.rows.find((sport) => sport.sportId.toString() === testPlanning.sportId);

    //  Create it if it doesn't
    if (!tdpRow) {
        tdpRow = createTDPRow(testPlanning.sportId, testPlanning.sportDescription);
        tdpSheetInfo.rows.push(tdpRow);
    }

    // Check to see if the subRow (Discipline) already exists
    let tdpSubRow = tdpRow.subRows.find(
        (discipline) => discipline.disciplineId.toString() === testPlanning.sportDisciplineId
    );

    //  Create it if it doesn't
    if (!tdpSubRow) {
        tdpSubRow = createTDPSubRow(testPlanning.sportDisciplineId, testPlanning.sportDisciplineDescription);
        tdpRow.subRows.push(tdpSubRow);
    }

    tdpRow.subRows.sort(sortDisciplines);

    // This TestPlanningInfo represents a cell for a TestingSubstanceCategory
    if (Number(testPlanning.testingSubstanceCategoryId)) {
        updateAnalysisOnTDPSheetInfo(testPlanning, tdpSheetInfo, tdpRow, tdpSubRow);

        // This TestPlanningInfo represents a cell for a sampleType
    } else if (testPlanning.sampleTypeId !== null) {
        updateSampleTypeOnTDPSheetInfo(testPlanning, tdpSheetInfo, tdpRow, tdpSubRow);
    }
}

function updateAnalysisOnTDPSheetInfo(
    testPlanning: TestPlanning,
    tdpSheetInfo: TDPSheetInfo,
    tdpRow: TDPRow,
    tdpSubRow: TDPSubRow
) {
    // Check to see if the cell (TestingSubstanceCategory) already exists
    let analysis = tdpSubRow.tdpTotals.analyses.find(
        (currentAnalysis) => currentAnalysis.analysisCategoryCode === testPlanning.testingSubstanceCategoryId.toString()
    );

    //  Create it if it doesn't
    if (!analysis) {
        analysis = createAnalysis(
            testPlanning.testingSubstanceCategoryId.toString(),
            testPlanning.testingSubstanceCategorySpecificCode
        );
        tdpSubRow.tdpTotals.analyses.push(analysis);
    }

    // Fill the right value (IC/OOC)
    if (testPlanning.inCompetition) {
        analysis.inCompetitionCell.id = testPlanning.id || undefined;
        analysis.inCompetitionCell.value = testPlanning.numberOfTests;
    } else {
        analysis.outOfCompetitionCell.id = testPlanning.id || undefined;
        analysis.outOfCompetitionCell.value = testPlanning.numberOfTests;
    }

    // if the category does not exists in parents, create it (Sport)
    if (
        !tdpRow.tdpTotals.analyses.find(
            (currentAnalysis) =>
                analysis !== undefined && currentAnalysis.analysisCategory === analysis.analysisCategory
        )
    ) {
        tdpRow.tdpTotals.analyses.push(analysis);
    }

    // if the category does not exists in parents, create it (SheetInfo)
    if (
        !tdpSheetInfo.tdpTotals.analyses.find(
            (currentAnalysis) =>
                analysis !== undefined && currentAnalysis.analysisCategory === analysis.analysisCategory
        )
    ) {
        tdpSheetInfo.tdpTotals.analyses.push(analysis);
    }
}

function updateSampleTypeOnTDPSheetInfo(
    testPlanning: TestPlanning,
    tdpSheetInfo: TDPSheetInfo,
    tdpRow: TDPRow,
    tdpSubRow: TDPSubRow
) {
    if (!testPlanning.sampleTypeId) {
        return;
    }

    // Check to see if the cell (SampleType) already exists
    let sample = tdpSubRow.tdpTotals.samples.find(
        (currentSample) => `${currentSample.sampleTypeId}` === `${testPlanning.sampleTypeId}`
    );

    //  Create it if it doesn't
    if (!sample) {
        sample = createSample(testPlanning.sampleTypeId, testPlanning.sampleTypeDescription);
        tdpSubRow.tdpTotals.samples.splice(testPlanning.sampleTypeOrder || 0, 0, sample);
    }

    // Fill the right value (IC/OOC)
    if (testPlanning.inCompetition) {
        sample.inCompetitionCell.id = testPlanning.id || undefined;
        sample.inCompetitionCell.value = testPlanning.numberOfTests;
    } else {
        sample.outOfCompetitionCell.id = testPlanning.id || undefined;
        sample.outOfCompetitionCell.value = testPlanning.numberOfTests;
    }

    // if the sampleType does not exists in parents, create it (Sport)
    if (
        !tdpRow.tdpTotals.samples.find(
            (currentSample) => sample !== undefined && `${currentSample.sampleTypeId}` === `${sample.sampleTypeId}`
        )
    ) {
        tdpRow.tdpTotals.samples.push(sample);
    }

    // if the sampleType does not exists in parents, create it (Sport)
    if (
        !tdpSheetInfo.tdpTotals.samples.find(
            (currentSample) => sample !== undefined && `${currentSample.sampleTypeId}` === `${sample.sampleTypeId}`
        )
    ) {
        tdpSheetInfo.tdpTotals.samples.push(sample);
    }
    tdpSheetInfo.rows.sort(sortSports);
}

function sortByStartMonth(a: any, b: any): number {
    return a.startMonth - b.startMonth;
}

function createSample(sampleTypeId: number, sampleTypeDescription: string): SampleValues {
    const sampleValue = new SampleValues();
    sampleValue.outOfCompetitionCell = createTDPCell(null, 0);
    sampleValue.inCompetitionCell = createTDPCell(null, 0);
    sampleValue.sampleType = sampleTypeDescription || '';
    sampleValue.sampleTypeId = sampleTypeId;
    return sampleValue;
}

function createTDPRow(sportId: string, sportName: string): TDPRow {
    const tdpRow = new TDPRow();
    tdpRow.sportId = parseInt(sportId, 10);
    tdpRow.sportName = sportName;
    tdpRow.subRows = new Array<TDPSubRow>();
    tdpRow.tdpTotals = createTotals();
    return tdpRow;
}

function createTDPSubRow(disciplineId: string, disciplineName: string): TDPSubRow {
    const tdpSubRow = new TDPSubRow();
    tdpSubRow.disciplineId = parseInt(disciplineId, 10);
    tdpSubRow.disciplineName = disciplineName;
    tdpSubRow.isDirty = false;
    tdpSubRow.tdpTotals = createTotals();
    return tdpSubRow;
}

function createTotals(): TDPTotals {
    const tpdTotal = new TDPTotals();
    tpdTotal.sampleTotal = 0;
    tpdTotal.samples = new Array<SampleValues>();
    tpdTotal.analyses = new Array<AnalysisValues>();
    return tpdTotal;
}

function createAnalysis(analysisCategoryCode: string, analysisCategory: string): AnalysisValues {
    const analysisValues = new AnalysisValues();
    analysisValues.analysisCategoryCode = analysisCategoryCode;
    analysisValues.analysisCategory = analysisCategory;
    analysisValues.inCompetitionCell = createTDPCell(null, 0);
    analysisValues.outOfCompetitionCell = createTDPCell(null, 0);
    return analysisValues;
}

function createTDPCell(id: number | null, numberOfTests: number): TDPCell {
    const cell = new TDPCell();
    cell.id = id || undefined;
    cell.value = numberOfTests;
    cell.isDirty = false;
    return cell;
}

export function sortDisciplines(a: { disciplineName: string }, b: { disciplineName: string }): number {
    return a.disciplineName.localeCompare(b.disciplineName);
}

export function sortSports(a: { sportName: string }, b: { sportName: string }): number {
    return a.sportName.localeCompare(b.sportName);
}
