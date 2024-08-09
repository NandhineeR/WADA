export class UnprocessableEntity {
    parameters?: Map<string, string>;

    code: string;

    constructor(unprocessableEntity: UnprocessableEntity) {
        this.code = unprocessableEntity.code;
        this.parameters = unprocessableEntity.parameters
            ? this.createMapFromObject(unprocessableEntity.parameters)
            : undefined;
    }

    createMapFromObject(parameters: any): Map<string, string> {
        const map = new Map<string, string>();
        Object.keys(parameters).forEach((x: string) => map.set(x, parameters[x]));
        return map;
    }
}
