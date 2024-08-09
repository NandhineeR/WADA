import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    selector: 'app-modal-field',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './modal-field.component.html',
    styleUrls: ['./modal-field.component.scss'],
})
export class ModalFieldComponent {
    @Input() hasError = false;

    @Input() hasAsterisk = false;

    @Input() columns = '80% auto min-content';
}
