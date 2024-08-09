import { Pipe, PipeTransform } from '@angular/core';
import { ColumnDef } from '@shared/models';
import { TestRow } from '@to/models/test/test-row.model';

@Pipe({
    name: 'sampleCount',
})
export class SampleAccumulatorPipe implements PipeTransform {
    transform(columns: Array<Partial<ColumnDef<TestRow>>>): number {
        return columns.reduce((count: number, current: Partial<ColumnDef<TestRow>>) => {
            return (
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                count + (current.cell?.analysis.length || 0)
            );
        }, 0);
    }
}
