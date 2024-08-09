import { Directive, HostBinding, OnInit } from '@angular/core';
import { Direction, DirectionalityService } from '@core/services';

@Directive({
    selector: '[appInheritDir]',
})
export class InheritDirDirective implements OnInit {
    private dir: Direction = 'ltr';

    @HostBinding('dir')
    get value(): Direction {
        return this.dir;
    }

    constructor(private directionalityService: DirectionalityService) {}

    ngOnInit(): void {
        this.dir = this.directionalityService.value;
    }
}
