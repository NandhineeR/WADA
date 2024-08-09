import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-progressbar-multi',
    templateUrl: './progressbar-multi.component.html',
    styleUrls: ['./progressbar-multi.component.scss'],
})
export class ProgressbarMultiComponent {
    @Input() bar = 0;

    @Input() colors = ['#000', '#7d7d7d', '#c3c3c3', '#d4d4d4'];

    @Input() showBar = false;

    @Input() set total(total: number) {
        this._total = total;
    }

    @Input() set values(values: Array<number>) {
        this._values = values;
        if (this._values.length > 0) {
            this.update();
        }
    }

    bars: Array<{ value: number; color: string }> = [];

    private _values: Array<number> = [];

    private _total = 100;

    private update(): void {
        // If no total is provided, compute it by summing all values
        const barsTotal = this._values.reduce((v1, v2) => v1 + v2, 0);
        const total = this._total >= barsTotal ? this._total : barsTotal;

        // Compute the accumulation of the values
        // so we can detect when the sum becomes greater than the total
        let accum = 0;
        const valuesAccumulated = this._values.map((value) => {
            accum += value;
            return accum;
        });

        let hasBeenClamped = false;
        this.bars = this._values.map((value, index) => {
            // Clamp the first value which is greater than the total to the remaining width
            // and discard the following values by setting their value to 0
            const discardRemainingValues = hasBeenClamped;
            hasBeenClamped = hasBeenClamped || valuesAccumulated[index] > total;

            // Calculate the percentage value
            const percentageValue =
                ((hasBeenClamped ? total - (valuesAccumulated[index] - value) : value) / total) * 100;

            // Set the clamped value
            const clampedValue = discardRemainingValues ? 0 : percentageValue;

            return {
                value: clampedValue,
                color: this.colors[index % this.colors.length],
            };
        });
    }
}
