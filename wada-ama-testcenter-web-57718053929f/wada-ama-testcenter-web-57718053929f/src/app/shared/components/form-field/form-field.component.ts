import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    selector: 'app-form-field',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './form-field.component.html',
    styleUrls: ['./form-field.component.scss'],
})
export class FormFieldComponent {
    @Input() columns = '30% auto min-content min-content';

    @Input() hasAsterisk = false;

    @Input() hasError = false;

    @Input() hasFieldInput3 = false;

    @Input() labelAlign = true;
}
