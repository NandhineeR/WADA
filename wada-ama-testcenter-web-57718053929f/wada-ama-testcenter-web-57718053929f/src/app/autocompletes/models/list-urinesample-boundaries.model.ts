import { UrineSampleBoundaries } from '@dcf/models';

export class ListUrineSampleBoundaries {
    urineSampleBoundaries: Array<UrineSampleBoundaries>;

    constructor(listUrineSampleBoundaries?: Partial<ListUrineSampleBoundaries> | null) {
        const { urineSampleBoundaries = null } = listUrineSampleBoundaries || {};

        this.urineSampleBoundaries = (urineSampleBoundaries || []).map(() => new UrineSampleBoundaries());
    }
}
