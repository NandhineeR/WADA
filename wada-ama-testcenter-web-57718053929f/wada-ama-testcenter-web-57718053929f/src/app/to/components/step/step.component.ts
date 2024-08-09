import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    selector: 'app-step',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="step">
            <a
                [routerLink]="link"
                queryParamsHandling="merge"
                [attr.data-qa]="dataQA"
                [ngClass]="{
                    circle: true,
                    active: step == activeStep,
                    completed: step < activeStep,
                    disabled: isLinkDisabled
                }"
            >
                {{ step }}
            </a>
            <div
                [attr.data-qa]="dataQA"
                [ngClass]="{
                    label: true,
                    active: step == activeStep,
                    completed: step < activeStep
                }"
            >
                <ng-content></ng-content>
            </div>
        </div>
    `,
    styleUrls: ['./step.component.scss'],
})
export class StepComponent {
    @Input() link = '#';

    @Input() step = 0;

    @Input() activeStep = 0;

    @Input() isLinkDisabled = false;

    // The input field data-qa attribute
    @Input() dataQA = '';
}
