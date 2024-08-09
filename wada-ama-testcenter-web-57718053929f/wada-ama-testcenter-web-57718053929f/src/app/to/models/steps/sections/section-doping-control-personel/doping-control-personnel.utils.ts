export class DopingControlPersonnelUtils {
    static requiredFields = {};

    static missingFields(): Set<string> {
        return new Set<string>(Object.values(this.requiredFields));
    }
}
