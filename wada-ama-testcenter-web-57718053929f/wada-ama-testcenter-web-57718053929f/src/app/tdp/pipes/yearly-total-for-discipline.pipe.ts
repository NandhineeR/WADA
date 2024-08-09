import { Pipe, PipeTransform } from '@angular/core';
import { TDPSheet } from '@tdp/models';

@Pipe({
    name: 'yearlyTotalForDiscipline',
})
export class YearlyTotalForDisciplinePipe implements PipeTransform {
    transform(tdpSheet: TDPSheet, disciplineId: number): number {
        return tdpSheet.getYearlyTotalForDiscipline(disciplineId);
    }
}
