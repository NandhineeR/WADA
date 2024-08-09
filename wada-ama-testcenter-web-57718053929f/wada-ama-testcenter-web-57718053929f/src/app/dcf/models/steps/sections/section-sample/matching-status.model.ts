import { isNullOrBlank } from '@shared/utils/string-utils';

export class MatchingStatus {
    code: number | null;

    description: string | null;

    constructor(matchingStatus?: Partial<MatchingStatus> | null) {
        const { code = null, description = '' } = matchingStatus || {};

        this.code = code;
        this.description = description;
    }

    isNull(): boolean {
        return (isNullOrBlank(this.code?.toString()) || this.code === 0) && isNullOrBlank(this.description);
    }
}
