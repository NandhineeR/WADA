export class FieldsSecurity {
    actions: Array<string>;

    fields: Map<string, string>;

    constructor(security?: Partial<FieldsSecurity> | null) {
        const { actions = [], fields = new Map<string, string>() } = security || {};

        this.actions = actions;
        this.fields = fields;
    }
}
