import { Pipe, PipeTransform } from '@angular/core';
import { SampleValues } from '@tdp/models';

@Pipe({
    name: 'getBySampleType',
})
export class GetBySampleTypePipe implements PipeTransform {
    transform(array: Array<SampleValues>, required: SampleValues): Array<SampleValues> {
        return array.filter((sampleToFind: SampleValues) => sampleToFind.sampleType === required.sampleType);
    }
}
