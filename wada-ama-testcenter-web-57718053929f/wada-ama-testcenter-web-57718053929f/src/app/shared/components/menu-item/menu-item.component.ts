import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-menu-item',
    templateUrl: './menu-item.component.html',
    styleUrls: ['./menu-item.component.scss'],
})
export class MenuComponent {
    @Input() dataQA = '';

    @Input() disabled = false;

    @Input() isDeletable = false;

    @Input() isSidebarMenu = false;

    @Input() isTooltip = false;
}
