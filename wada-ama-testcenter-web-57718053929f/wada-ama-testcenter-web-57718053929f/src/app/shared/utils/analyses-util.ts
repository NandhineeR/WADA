import { Analysis, AnalysisAttribute, SampleTypeEnumValues } from '@shared/models';
import { AnalysisDisplay } from '@to/models/steps/sections/section-athlete-and-analyses/analysis';
import { isNullOrBlank } from './string-utils';

export function createAnalysisDisplay(
    testId: string | undefined,
    testName: string | undefined,
    analysis: Analysis
): AnalysisDisplay {
    return new AnalysisDisplay({
        id: analysis.id,
        name: analysis.sampleType.specificCode,
        attribute: getFormattedAttributes(analysis),
        lab: analysis.laboratory?.name || '',
        label: analysis.systemLabel || '',
        status: `(${analysis.status?.description || ''})`,
        testId: testId || '',
        testName: testName || '',
    });
}

export function extractAnalysesName(
    testId: string | undefined,
    testName: string | undefined,
    analyses: Array<Analysis>
): Array<AnalysisDisplay> {
    return analyses.map((analysis: Analysis) => createAnalysisDisplay(testId, testName, analysis));
}

export function sortAnalysesBySampleType(analysisDisplay: Array<AnalysisDisplay>): Array<AnalysisDisplay> {
    const keys = SampleTypeEnumValues.getValues();
    const updateAnalysis: Array<AnalysisDisplay> = [];
    keys.forEach((specificCode: string) => {
        const urineAnalyses = analysisDisplay.filter(
            (analysisDisplayed: AnalysisDisplay) => analysisDisplayed.name === specificCode
        );
        if (urineAnalyses.length > 0) updateAnalysis.push(...urineAnalyses);
    });
    return updateAnalysis;
}

function getFormattedAttributes(analysis: Analysis): string {
    const formattedAttribute = analysis.sampleAnalysisAttributes
        .map((attribute: AnalysisAttribute) => attribute.analysisDescription.description)
        .join(', ');
    return isNullOrBlank(formattedAttribute) ? '' : `${formattedAttribute}`;
}
