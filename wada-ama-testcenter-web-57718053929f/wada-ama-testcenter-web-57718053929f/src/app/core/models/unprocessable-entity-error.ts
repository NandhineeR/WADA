import { Exception } from './exception';
import { UnprocessableEntity } from './unprocessable-entity';

export class UnprocessableEntityError extends Exception {
    status: number;

    name: string;

    message: string;

    unprocessableEntities: Array<UnprocessableEntity>;

    entityType?: string;

    constructor(unprocessableEntityError: UnprocessableEntityError) {
        super(
            unprocessableEntityError.status,
            unprocessableEntityError.code,
            unprocessableEntityError.message,
            unprocessableEntityError.messageKey
        );
        this.message = unprocessableEntityError.message;
        this.name = unprocessableEntityError.name;
        this.status = unprocessableEntityError.status;
        this.unprocessableEntities = (unprocessableEntityError.unprocessableEntities || []).map(
            (unprocessableEntity) => new UnprocessableEntity(unprocessableEntity)
        );
    }
}
