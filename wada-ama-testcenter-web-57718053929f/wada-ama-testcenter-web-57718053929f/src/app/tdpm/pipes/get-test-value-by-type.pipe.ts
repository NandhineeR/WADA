import { Pipe, PipeTransform } from '@angular/core';
import { AnalysisValues, SampleValues, TDPMCell, TestTypeToShow } from '@tdpm/models';

@Pipe({
    name: 'getTestValueByType',
})
export class GetTestValueByTypePipe implements PipeTransform {
    transform(
        value: AnalysisValues | SampleValues,
        showTestType: TestTypeToShow,
        isIC: boolean,
        isActualValue: boolean
    ): number {
        let tempObject: TDPMCell = new TDPMCell();

        // eslint-disable-next-line default-case
        switch (showTestType) {
            case TestTypeToShow.Complete:
                tempObject = isIC ? value.inCompetitionCompleteCell : value.outOfCompetitionCompleteCell;
                break;
            case TestTypeToShow.CompleteNoLabResultMatched:
                tempObject = isIC
                    ? value.inCompetitionCompleteWithoutLabResultsCell
                    : value.outOfCompetitionCompleteWithoutLabResultsCell;
                break;
            case TestTypeToShow.PlannedAndComplete:
                tempObject = isIC
                    ? value.inCompetitionPlannedAndCompleteCell
                    : value.outOfCompetitionPlannedAndCompleteCell;
                break;
        }

        return isActualValue ? tempObject.actualValue : tempObject.forecastedValue;
    }
}
