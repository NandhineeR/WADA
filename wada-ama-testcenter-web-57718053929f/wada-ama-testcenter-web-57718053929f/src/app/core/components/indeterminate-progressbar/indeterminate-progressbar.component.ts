import { Component } from '@angular/core';

@Component({
    selector: 'app-indeterminate-progressbar',
    template: `
        <div class="progressbar">
            <div class="indeterminate"></div>
        </div>
    `,
    styleUrls: ['./indeterminate-progressbar.component.scss'],
})
export class IndeterminateProgressbarComponent {}
