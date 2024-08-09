import { LongTermStorage } from './long-term-storage.model';
import { QuickTurnAround } from './quick-turn-around.model';

export class Sample {
    id: number | null;

    ltsRequest: LongTermStorage | null;

    qtaRequest: QuickTurnAround | null;

    constructor(sample?: Partial<Sample> | null) {
        const { id = null, ltsRequest = null, qtaRequest = null } = sample || {};

        this.id = id || null;
        this.ltsRequest = ltsRequest ? new LongTermStorage(ltsRequest) : null;
        this.qtaRequest = qtaRequest ? new QuickTurnAround(qtaRequest) : null;
    }
}
