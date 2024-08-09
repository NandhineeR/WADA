export class TDPMCell {
    forecastedValue: number;

    actualValue: number;

    constructor(cell?: TDPMCell) {
        this.forecastedValue = cell?.forecastedValue || 0;
        this.actualValue = cell?.actualValue || 0;
    }

    clone(): this {
        const clone = new (this.constructor as typeof TDPMCell)() as this;
        clone.forecastedValue = this.forecastedValue;
        clone.actualValue = this.actualValue;

        return clone;
    }
}
