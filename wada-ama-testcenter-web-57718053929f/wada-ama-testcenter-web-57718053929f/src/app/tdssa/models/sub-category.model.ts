export class SubCategory {
    code: string;

    description: string; // Deprecated

    total: number;

    constructor(subCategory?: SubCategory) {
        this.code = subCategory?.code || '';
        this.description = subCategory?.description || '';
        this.total = subCategory?.total || 0;
    }

    clone(): this {
        const clone = new (this.constructor as typeof SubCategory)() as this;
        clone.code = this.code;
        clone.description = this.description;
        clone.total = this.total;

        return clone;
    }

    cumulateTotals(subCategoryList: Array<SubCategory>): void {
        subCategoryList.forEach((subCategory: SubCategory) => {
            if (this.code === subCategory.code) {
                this.total += subCategory.total;
            }
        });
    }
}
