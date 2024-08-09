import { Link } from './link.model';

export enum MessageType {
    Info,
    Success,
    Warning,
    Error,
}

export class Message {
    type: MessageType;

    messages: Array<string>;

    whatNext: boolean;

    links: Array<Link>;

    constructor(message?: Message) {
        this.type = message?.type || MessageType.Info;
        this.messages = message?.messages || [];
        this.whatNext = message?.whatNext || true;
        this.links = message?.links || [];
    }
}

export enum ErrorType {
    Format = 1,
    Business = 2,
    Mandatory = 3,
}
