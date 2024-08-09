import { Component, Input } from '@angular/core';
import { User } from '@tdp/models';
import { TranslationService } from '@core/services';

@Component({
    selector: 'app-initials',
    templateUrl: './initials.component.html',
    styleUrls: ['./initials.component.scss'],
})
export class InitialsComponent {
    translations$ = this.translationService.translations$;

    @Input() loggedInUser = '';

    @Input() user: User = new User();

    constructor(private translationService: TranslationService) {}
}
