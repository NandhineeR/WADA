export class UrineSampleBoundaries {
    /**
     * The below minimum SG threshold
     * Specific gravity must be above this SG threshold when the volume is below the first volume threshold
     */
    minimumSpecificGravityThreshold0: number | null;

    /**
     * The below minimum volume threshold
     */
    minimumVolumeThreshold0: number | null;

    /**
     * The first SG threshold
     * Specific gravity must be above the first SG threshold when the volume is between the first volume threshold and the second
     */
    minimumSpecificGravityThreshold1: number | null;

    /**
     * The first volume threshold
     */
    minimumVolumeThreshold1: number | null;

    /**
     * The second SG threshold
     * Specific gravity must be above the second SG threshold when the volume is above or equal to the second volume threshold
     */
    minimumSpecificGravityThreshold2: number | null;

    /**
     * The second volume threshold
     */
    minimumVolumeThreshold2: number | null;

    constructor(urineSampleBoundaries?: Partial<UrineSampleBoundaries> | null) {
        const {
            minimumSpecificGravityThreshold0 = null,
            minimumVolumeThreshold0 = null,
            minimumSpecificGravityThreshold1 = null,
            minimumVolumeThreshold1 = null,
            minimumSpecificGravityThreshold2 = null,
            minimumVolumeThreshold2 = null,
        } = urineSampleBoundaries || {};

        this.minimumSpecificGravityThreshold0 = minimumSpecificGravityThreshold0;
        this.minimumVolumeThreshold0 = minimumVolumeThreshold0;
        this.minimumSpecificGravityThreshold1 = minimumSpecificGravityThreshold1;
        this.minimumVolumeThreshold1 = minimumVolumeThreshold1;
        this.minimumSpecificGravityThreshold2 = minimumSpecificGravityThreshold2;
        this.minimumVolumeThreshold2 = minimumVolumeThreshold2;
    }
}
