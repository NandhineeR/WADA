import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'sportDisciplineName',
})
export class SportDisciplineNamePipe implements PipeTransform {
    transform(sport: string, discipline: string): string {
        return `${sport.toUpperCase()} / ${discipline.toUpperCase()}`;
    }
}
