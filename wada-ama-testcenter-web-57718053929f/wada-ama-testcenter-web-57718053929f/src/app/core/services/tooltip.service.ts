import { ComponentRef, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TooltipWrapperComponent } from '@shared/components';

@Injectable()
export class TooltipService {
    private tooltipSubject: BehaviorSubject<ComponentRef<TooltipWrapperComponent> | undefined> = new BehaviorSubject<
        ComponentRef<TooltipWrapperComponent> | undefined
    >(undefined);

    readonly tooltip$: Observable<
        ComponentRef<TooltipWrapperComponent> | undefined
    > = this.tooltipSubject.asObservable();

    show(tooltip: ComponentRef<TooltipWrapperComponent> | undefined): void {
        this.tooltipSubject.next(tooltip);
    }

    hide(): void {
        this.tooltipSubject.next(undefined);
    }
}
