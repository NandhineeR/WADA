import { LocalizedEntity } from '@shared/models';

export class AttemptMethod {
    selected: boolean;

    method: LocalizedEntity | null;

    constructor(attemptMethod?: Partial<AttemptMethod> | null) {
        const { selected = false, method = null } = attemptMethod || {};

        this.selected = selected;
        this.method = method;
    }
}
