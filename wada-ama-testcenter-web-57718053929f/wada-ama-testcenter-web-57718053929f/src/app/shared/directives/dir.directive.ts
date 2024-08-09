import { Directive, HostBinding, Input } from '@angular/core';
import { Direction, DirectionalityService } from '@core/services/directionality.service';

@Directive({
    selector: '[appDir]',
    providers: [{ provide: DirectionalityService, useExisting: DirDirective }],
})
export class DirDirective implements DirectionalityService {
    private dir: Direction = 'ltr';

    @Input()
    @HostBinding('dir')
    get appDir(): Direction {
        return this.dir;
    }

    set appDir(value: Direction) {
        this.dir = value;
    }

    get value(): Direction {
        return this.dir;
    }
}
