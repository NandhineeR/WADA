import {
    OPTIMISTIC_LOCK_EXCEPTION,
    SAMPLE_CODE_VALIDATION_ERROR,
    SAMPLE_CODE_VALIDATION_WARNING,
} from '@shared/utils/exception-code';
import { Conflict } from './conflict';
import { Exception } from './exception';

export class ConflictException extends Exception {
    conflict?: Conflict;

    constructor(conflictException?: ConflictException) {
        super(conflictException?.status);
        this.conflict = conflictException && conflictException.conflict && new Conflict(conflictException.conflict);
    }

    hasOptimisticLockException(): boolean {
        return this.conflict?.code === OPTIMISTIC_LOCK_EXCEPTION || false;
    }

    hasSampleCodeValidationError(): boolean {
        return this.conflict?.code === SAMPLE_CODE_VALIDATION_ERROR || false;
    }

    hasCodeValidationWarning(): boolean {
        return this.conflict?.code === SAMPLE_CODE_VALIDATION_WARNING || false;
    }
}
