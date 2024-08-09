import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { TableTranslationService } from '@shared/services/table-translation.service';

@Pipe({
    name: 'matMenu',
})
export class MatMenuPipe implements PipeTransform {
    constructor(private tableTranslationService: TableTranslationService) {}

    transform(key: string): Observable<string> {
        return this.tableTranslationService.translateHeader(key);
    }
}
