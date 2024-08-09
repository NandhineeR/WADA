import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    selector: 'app-steps',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="steps" appInheritDir>
            <span class="hline-{{ numSteps }}"></span>
            <span class="hline-active-{{ activeStep }}"></span>
            <ng-content select="app-step"></ng-content>
        </div>
    `,
    styleUrls: ['./steps.component.scss'],
})
export class StepsComponent {
    @Input() numSteps = 0;

    @Input() activeStep = 0;
}
