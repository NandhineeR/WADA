import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-loading-animation',
    templateUrl: './loading-animation.component.html',
    styleUrls: ['./loading-animation.component.scss'],
})
export class LoadingAnimationComponent {
    @Input() isTemplate = false;

    @Input() isTable = false;

    @Input() isDashboard = false;

    @Input() error = false;
}
