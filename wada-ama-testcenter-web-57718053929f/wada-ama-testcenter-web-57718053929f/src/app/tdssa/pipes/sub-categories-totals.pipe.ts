import { Pipe, PipeTransform } from '@angular/core';
import { Analysis } from '@tdssa/models';

@Pipe({
    name: 'subCategoriesTotals',
})
export class SubCategoriesTotalsPipe implements PipeTransform {
    transform(data: Analysis): Array<number> {
        const array: Array<number> = [];
        data.subCategories.forEach((subCategory) => {
            array.push(subCategory.total);
        });
        return array;
    }
}
