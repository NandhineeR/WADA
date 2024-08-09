import { Pipe, PipeTransform } from '@angular/core';
import { UnprocessableEntity } from '@core/models';

@Pipe({
    name: 'sampleType',
})
export class SampleTypePipe implements PipeTransform {
    transform(sampleCountErrorUnprocessableEntity: UnprocessableEntity): string {
        let sampleType: string | undefined;
        const param = sampleCountErrorUnprocessableEntity.parameters;
        if (param) {
            sampleType = param.get('SAMPLE_TYPE');
        }
        return sampleType || '';
    }
}
