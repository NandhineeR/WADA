/**
 * Laboratory class containing the initialization for the fields,
 * with the exception of biological and accredited, since this information is calculated in the frontend,
 * and not given by the backend
 */
export class Laboratory {
    id: string;

    description: string;

    name: string;

    biological: boolean;

    accredited: boolean;

    constructor(laboratory?: Partial<Laboratory> | null) {
        const { id = '', description = '', name = '', biological = false, accredited = false } = laboratory || {};

        this.id = id;
        this.description = description;
        this.name = name;
        this.biological = biological;
        this.accredited = accredited;
    }

    get displayDescriptionName(): string {
        const name = (this.name || '').trim();
        const desc = (this.description || '').trim();
        if (desc.substring(0, name.length).includes(name)) {
            return desc;
        }
        return name && desc ? `${name} - ${desc}` : `${name}${desc}`;
    }
}
