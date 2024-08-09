import { Pipe, PipeTransform } from '@angular/core';
import { AnalysisValues } from '@tdp/models';

@Pipe({
    name: 'getByAnalysisCategory',
})
export class GetByAnalysisCategoryPipe implements PipeTransform {
    transform(array: Array<AnalysisValues>, required: AnalysisValues): Array<AnalysisValues> {
        return array.filter(
            (analysisToFind: AnalysisValues) => analysisToFind.analysisCategory === required.analysisCategory
        );
    }
}
