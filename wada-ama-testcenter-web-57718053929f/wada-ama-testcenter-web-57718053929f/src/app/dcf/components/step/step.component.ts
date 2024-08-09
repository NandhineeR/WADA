import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    selector: 'app-step',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="step">
            <a
                queryParamsHandling="merge"
                [attr.data-qa]="dataQA"
                [ngClass]="{
                    active: step == activeStep,
                    circle: true,
                    completed: step < activeStep,
                    disabled: isLinkDisabled
                }"
                [routerLink]="link"
            >
                {{ step }}
            </a>
            <div
                [attr.data-qa]="dataQA"
                [ngClass]="{
                    active: step == activeStep,
                    completed: step < activeStep,
                    label: true
                }"
            >
                <ng-content></ng-content>
            </div>
        </div>
    `,
    styleUrls: ['./step.component.scss'],
})
export class StepComponent {
    @Input() activeStep = 0;

    @Input() dataQA = '';

    @Input() isLinkDisabled = false;

    @Input() link = '#';

    @Input() step = 0;
}
