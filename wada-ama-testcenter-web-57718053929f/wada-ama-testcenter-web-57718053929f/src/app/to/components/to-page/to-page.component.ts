import { Component } from '@angular/core';

@Component({
    selector: 'app-to-page',
    template: `
        <div class="wrapper" appInheritDir>
            <div class="title">
                <ng-content select="[errors]"></ng-content>
                <ng-content select="[title]"></ng-content>
            </div>
            <div class="header">
                <ng-content select="app-header"></ng-content>
                <div class="controls">
                    <ng-content select="[controls]"></ng-content>
                </div>
            </div>
            <div class="message">
                <ng-content select="[message]"></ng-content>
            </div>
            <div class="steps">
                <ng-content select="app-steps"></ng-content>
            </div>
            <div class="content">
                <ng-content></ng-content>
            </div>
        </div>
    `,
    styleUrls: ['./to-page.component.scss'],
})
export class TOPageComponent {}
