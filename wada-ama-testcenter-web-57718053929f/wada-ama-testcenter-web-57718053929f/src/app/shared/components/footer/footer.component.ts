import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ModificationInfo } from '@shared/models';
import { displayDateFormatFooter } from '@shared/utils/string-utils';

@Component({
    selector: 'app-footer',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
    @Input() creationInfo?: ModificationInfo;

    @Input() updateInfo?: ModificationInfo;

    displayFormat: string = displayDateFormatFooter;
}
