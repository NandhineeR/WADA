import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { TranslationMap, TranslationService } from '@core/services';

@Injectable()
export class TableTranslationService {
    translations$ = this.translationService.translations$;

    constructor(private translationService: TranslationService) {}

    translateHeader(key: string): Observable<string> {
        return this.translations$.pipe(
            map(
                (translations: TranslationMap) =>
                    translations[this.translationService.getTableHeaderKey(key.toString())]
            )
        );
    }
}
