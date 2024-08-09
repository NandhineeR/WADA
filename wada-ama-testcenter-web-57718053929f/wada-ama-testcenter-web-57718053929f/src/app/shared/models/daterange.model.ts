export class Daterange {
    from: string;

    to: string;

    quickFilter: {
        displayName: string;
        value: string;
    };

    constructor() {
        this.from = '';
        this.to = '';
        this.quickFilter = { displayName: '', value: '' };
    }
}
