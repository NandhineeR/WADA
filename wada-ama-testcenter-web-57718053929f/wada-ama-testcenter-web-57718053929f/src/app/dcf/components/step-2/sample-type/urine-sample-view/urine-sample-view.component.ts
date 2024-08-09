import { Component, Input } from '@angular/core';
import { Urine, UrineSampleBoundaries, UrineUtils } from '@dcf/models';
import { BaseSample } from '@dcf/utils/base-sample/base-sample.directive';
import { sampleIsDiluted } from '@shared/utils';

@Component({
    selector: 'app-urine-sample-view',
    templateUrl: './urine-sample-view.component.html',
    styleUrls: ['./urine-sample-view.component.scss'],
})
export class UrineSampleViewComponent extends BaseSample {
    readonly fields = UrineUtils.requiredFields;

    @Input() set urineSampleBoundaries(urineSampleBoundaries: UrineSampleBoundaries | null) {
        if (urineSampleBoundaries) {
            this.urineSample = this.sample as Urine;
            this.boundaries = urineSampleBoundaries;
            this.setMinimumValues(this.urineSample?.volume);
            this.isDilute = this.checkIsDiluteSample();
        }
    }

    boundaries: UrineSampleBoundaries | null = null;

    isDilute = false;

    isFirstThresholdOrBelow = false;

    minimumSpecificGravity: number | null = null;

    minimumVolume: number | null = null;

    upperThreshold: number | null = null;

    urineSample: Urine | null = null;

    displayVolumeBelowMinimumReason(): boolean {
        const urineSample = this.sample as Urine;
        return (urineSample.volumeBelowMinimumReason?.length || 0) > 0;
    }

    /**
     * Sets the minimumVolume, minimumSpecificGravity and isFirstThreshold properties.
     * If the volume entered by the user is below the second volume threshold, then we use the first SG threshold (so isFirstThreshold = true)
     * else, the volume entered by the user is equal to or above the second volume threshold, in which case we use the second SG threshold (so isFirstThreshold = false)
     * @param volume - the updated volume in the form
     */
    setMinimumValues(volume: number | null) {
        if (
            volume &&
            this.boundaries &&
            this.boundaries.minimumVolumeThreshold2 &&
            this.boundaries.minimumVolumeThreshold1
        ) {
            if (volume < this.boundaries.minimumVolumeThreshold1) {
                this.minimumVolume = this.boundaries.minimumVolumeThreshold0;
                this.minimumSpecificGravity = this.boundaries.minimumSpecificGravityThreshold0;
                this.upperThreshold = this.boundaries.minimumVolumeThreshold1 - 1;
                this.isFirstThresholdOrBelow = true;
            } else if (volume < this.boundaries.minimumVolumeThreshold2) {
                this.minimumVolume = this.boundaries.minimumVolumeThreshold1;
                this.minimumSpecificGravity = this.boundaries.minimumSpecificGravityThreshold1;
                this.upperThreshold = this.boundaries.minimumVolumeThreshold2 - 1;
                this.isFirstThresholdOrBelow = true;
            } else {
                this.minimumVolume = this.boundaries.minimumVolumeThreshold2;
                this.minimumSpecificGravity = this.boundaries.minimumSpecificGravityThreshold2;
                this.upperThreshold = null;
                this.isFirstThresholdOrBelow = false;
            }
        }
    }

    private checkIsDiluteSample(): boolean {
        const sample = this.sample as Urine;
        if (sample && this.boundaries) {
            const specificGravity = parseFloat(sample.specificGravity || '');

            return sampleIsDiluted(specificGravity, sample.volume, this.boundaries);
        }

        return false;
    }
}
