import { AttachmentType } from '@shared/models';

export class Attachment {
    id: string | null;

    mimeType: string | null;

    attachmentType: AttachmentType | null;

    meta: AttachmentMetadata | null;

    url: string;

    constructor(attachment?: Partial<Attachment> | null) {
        const { id = null, mimeType = null, attachmentType = null, meta = null, url = null } = attachment || {};
        this.id = id;
        this.mimeType = mimeType;
        this.attachmentType = attachmentType;
        this.meta = meta;
        this.url = url || '';
    }
}
export interface AttachmentMetadata {
    [key: string]: string | number;
}
