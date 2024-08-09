import { LongTermStorage } from './long-term-storage.model';
import { QuickTurnAround } from './quick-turn-around.model';

export class AnalysisSample {
    label: string;

    ltsRequest: LongTermStorage | null;

    qtaRequest: QuickTurnAround | null;

    constructor(analysisSample?: Partial<AnalysisSample> | null) {
        const { label = '', ltsRequest = null, qtaRequest = null } = analysisSample || {};

        this.label = label || '';
        this.ltsRequest = ltsRequest ? new LongTermStorage(ltsRequest) : null;
        this.qtaRequest = qtaRequest ? new QuickTurnAround(qtaRequest) : null;
    }
}
