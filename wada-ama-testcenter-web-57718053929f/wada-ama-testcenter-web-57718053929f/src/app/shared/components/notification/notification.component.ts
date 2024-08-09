import { AfterViewInit, Component, ElementRef, Input, Renderer2, ViewChild } from '@angular/core';

type NotificationType = 'error' | 'warning' | 'informative' | 'success';

@Component({
    selector: 'app-notification',
    template: `
        <div class="{{ _type }} wrapper" appInheritDir #notification>
            <img class="icon" [src]="icon" />
            <div class="padding"></div>
            <div class="content">
                <ng-content></ng-content>
                <ng-content select="[links]"></ng-content>
                <ng-content select="[whatsNext]"></ng-content>
            </div>
        </div>
    `,
    styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent implements AfterViewInit {
    @ViewChild('notification', { static: true }) notification?: ElementRef;

    @Input() changeTableStyles = false;

    @Input() set type(type: NotificationType) {
        this._type = type;
        switch (type) {
            case 'error':
                this.icon = 'assets/error.svg';
                break;
            case 'warning':
                this.icon = 'assets/warning.svg';
                break;
            case 'success':
                this.icon = 'assets/success.svg';
                break;
            case 'informative':
            default:
                this.icon = 'assets/informative.svg';
        }
    }

    _type: NotificationType = 'error';

    icon = 'assets/error.svg';

    constructor(private renderer: Renderer2) {}

    ngAfterViewInit(): void {
        if (this.changeTableStyles && this.notification) {
            this.renderer.setStyle(this.notification.nativeElement, 'margin-left', '20px');
            this.renderer.setStyle(this.notification.nativeElement, 'margin-right', '20px');
        }
    }
}
