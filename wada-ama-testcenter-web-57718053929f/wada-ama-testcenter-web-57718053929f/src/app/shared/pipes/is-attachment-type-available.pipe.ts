import { Pipe, PipeTransform } from '@angular/core';
import { Attachment, AttachmentType } from '@shared/models';

@Pipe({
    name: 'isAttachmentTypeAvailable',
})
export class IsAttachmentTypeAvailablePipe implements PipeTransform {
    transform(attachments: Array<Attachment>, neededAttachmentType: AttachmentType): boolean {
        return Boolean(attachments.find((attachment) => attachment.attachmentType === neededAttachmentType));
    }
}
