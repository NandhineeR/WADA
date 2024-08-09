import { Pipe, PipeTransform } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { TranslationMap, TranslationService } from '@core/services';

@Pipe({
    name: 'getSampleType',
})
export class GetSampleTypePipe implements PipeTransform {
    constructor(private translationService: TranslationService) {}

    transform(translations$: Observable<TranslationMap>, key: string): Observable<string> {
        return key
            ? translations$.pipe(
                  map(
                      (translations: TranslationMap) =>
                          translations[this.translationService.getSampleTypeKey(key.toString())]
                  )
              )
            : of('');
    }
}
