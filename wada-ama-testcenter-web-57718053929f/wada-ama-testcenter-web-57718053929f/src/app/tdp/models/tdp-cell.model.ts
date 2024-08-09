export class TDPCell {
    id: number | undefined;

    value: number;

    isDirty: boolean;

    constructor(tdpCell?: TDPCell) {
        this.id = tdpCell && tdpCell.id;
        this.value = tdpCell?.value || 0;
        this.isDirty = tdpCell?.isDirty || false;
    }

    clone(): this {
        const clone = new (this.constructor as typeof TDPCell)() as this;
        clone.id = this.id;
        clone.value = this.value;
        clone.isDirty = this.isDirty;

        return clone;
    }
}
