import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-collapse-button',
    template: `
        <div class="wrapper" [class.disabled]="disabled">
            <div
                class="collapse-button"
                [class.collapsed]="collapsed"
                [class.expanded]="!collapsed"
                [attr.data-qa]="dataQA"
            ></div>
            <div class="side-content">
                <ng-content></ng-content>
            </div>
        </div>
    `,
    styleUrls: ['./collapse-button.component.scss'],
})
export class CollapseButtonComponent {
    @Input() collapsed = false;

    @Input() toggles = true;

    @Input() disabled = false;

    @Input() dataQA = '';
}
