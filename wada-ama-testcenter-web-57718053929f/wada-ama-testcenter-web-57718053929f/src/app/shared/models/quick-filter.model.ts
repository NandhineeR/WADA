/* eslint-disable @typescript-eslint/no-empty-function */
export class QuickFilter {
    value: string;

    displayName: string;

    dataQA: string;

    filterFn: any;

    constructor() {
        this.value = '';
        this.displayName = '';
        this.dataQA = '';
    }
}
