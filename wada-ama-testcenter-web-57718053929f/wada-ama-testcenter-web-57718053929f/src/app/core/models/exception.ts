export class Exception {
    status?: number;

    code?: string;

    message?: string;

    messageKey?: string;

    constructor(status?: number, code?: string, message?: string, messageKey?: string) {
        this.status = status;
        this.code = code;
        this.message = message;
        this.messageKey = messageKey;
    }
}
