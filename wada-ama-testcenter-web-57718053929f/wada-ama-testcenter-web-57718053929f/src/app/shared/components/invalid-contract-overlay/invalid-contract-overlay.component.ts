import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-invalid-contract-overlay',
    templateUrl: './invalid-contract-overlay.component.html',
    styleUrls: ['./invalid-contract-overlay.component.scss'],
})
export class InvalidContractOverlayComponent {
    @Input() showOverlay = false;
}
