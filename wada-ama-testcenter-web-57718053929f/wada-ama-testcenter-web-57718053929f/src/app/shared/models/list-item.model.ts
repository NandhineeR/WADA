export class ListItem {
    id: number | null;

    description: string;

    name: string;

    displayDescriptionName: string;

    specificCode?: string;

    constructor(listItem?: Partial<ListItem> | null) {
        const { id = null, description = '', name = '', specificCode = undefined } = listItem || {};

        this.id = id;
        this.description = description;
        this.name = name;
        this.specificCode = specificCode;

        const tempName = (name || '').trim();
        const desc = (description || '').trim();
        if (desc.startsWith(`${tempName} - `)) this.displayDescriptionName = `${desc}`;
        else this.displayDescriptionName = tempName && desc ? `${tempName} - ${desc}` : `${tempName}${desc}`;
    }
}
