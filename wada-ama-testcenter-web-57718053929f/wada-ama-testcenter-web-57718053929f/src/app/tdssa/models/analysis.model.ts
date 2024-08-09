import { SubCategory } from './sub-category.model';

export class Analysis {
    categoryCode: string;

    categoryDescription: string; // Deprecated

    total: number;

    mla: number;

    subCategories: Array<SubCategory>;

    constructor(analysis?: Analysis) {
        this.categoryCode = analysis?.categoryCode || '';
        this.categoryDescription = analysis?.categoryDescription || '';
        this.total = analysis?.total || 0;
        this.mla = analysis?.mla || 0;
        this.subCategories = new Array<SubCategory>();

        if (analysis) {
            analysis.subCategories.forEach((subCat: SubCategory) => this.subCategories.push(new SubCategory(subCat)));
        }
    }

    clone(): this {
        const clone = new (this.constructor as typeof Analysis)() as this;
        clone.categoryCode = this.categoryCode;
        clone.categoryDescription = this.categoryDescription;
        clone.total = this.total;
        clone.mla = this.mla;
        this.subCategories.forEach((subCat: SubCategory) => clone.subCategories.push(subCat.clone()));

        return clone;
    }

    cumulateTotals(analysisList: Array<Analysis>): void {
        analysisList.forEach((analysis: Analysis) => {
            if (this.categoryCode === analysis.categoryCode) {
                this.total += analysis.total;
                this.subCategories.forEach((subCat: SubCategory) => subCat.cumulateTotals(analysis.subCategories));
            }
        });
    }
}
