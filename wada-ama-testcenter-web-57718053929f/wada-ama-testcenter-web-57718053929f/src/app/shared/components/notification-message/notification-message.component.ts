import { Component, Input } from '@angular/core';
import { Message, MessageType } from '@shared/models';

@Component({
    selector: 'app-notification-message',
    template: `
        <div class="{{ type }} wrapper" *ngIf="_message.messages && _message.messages.length > 0" appInheritDir>
            <img class="icon" [src]="icon" />
            <div class="padding"></div>
            <div class="content">
                <ng-container *ngIf="_message.messages.length === 1">
                    <p *ngFor="let message of _message.messages" class="message">
                        {{ message }}
                    </p>
                </ng-container>
                <ul *ngIf="_message.messages.length > 1" class="message-list">
                    <li *ngFor="let message of _message.messages" class="message">
                        {{ message }}
                    </li>
                </ul>
                <p class="whats-next" *ngIf="_message.whatNext" i18n="@@whatsNext">What's next?</p>
                <ul class="links" *ngIf="_message.links.length">
                    <li *ngFor="let link of _message.links">
                        <a [href]="link.link">{{ link.message }}</a>
                    </li>
                </ul>
            </div>
        </div>
    `,
    styleUrls: ['./notification-message.component.scss'],
})
export class NotificationMessageComponent {
    @Input() set message(messageInput: Message) {
        this._message = messageInput || new Message();
        this.type = MessageType[this._message.type].toLowerCase();
        switch (this._message.type) {
            case MessageType.Error:
                this.icon = 'assets/error.svg';
                break;
            case MessageType.Warning:
                this.icon = 'assets/warning.svg';
                break;
            case MessageType.Success:
                this.icon = 'assets/success.svg';
                break;
            case MessageType.Info:
            default:
                this.icon = 'assets/informative.svg';
        }
    }

    _message = new Message();

    type = 'error';

    icon = 'assets/error.svg';
}
