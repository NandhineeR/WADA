import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-generic-menu',
    templateUrl: './generic-menu.component.html',
    styleUrls: ['./generic-menu.component.scss'],
})
export class GenericMenuComponent {
    @Input() disabled = false;

    @Input() hasCustomLook = false;

    @Input() isSidebarMenu = false;

    @Input() dataQA = '';

    direction: 'up' | 'down' = 'down';

    changeDirection(): void {
        this.direction = this.direction === 'up' ? 'down' : 'up';
    }
}
