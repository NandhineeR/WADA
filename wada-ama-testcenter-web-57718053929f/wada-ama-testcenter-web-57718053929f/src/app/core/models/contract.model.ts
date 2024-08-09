export class Contract {
    organizationId: string;

    selected: boolean;

    constructor(id: string, selected: boolean) {
        this.organizationId = id;
        this.selected = selected;
    }
}
