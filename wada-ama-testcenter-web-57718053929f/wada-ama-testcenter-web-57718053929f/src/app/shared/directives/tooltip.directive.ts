import {
    ComponentFactoryResolver,
    ComponentRef,
    Directive,
    ElementRef,
    HostListener,
    Injector,
    Input,
    OnDestroy,
    TemplateRef,
} from '@angular/core';
import { Size, TooltipWrapperComponent } from '@shared/components';
import { TooltipService } from '@core/services';
import { Placement, Rect } from '@shared/utils';

/**
 * A directive to add a tooltip to any target.
 * <div appTooltip tooltipContent="Some tooltip content here">
 *     My target element
 * </div>
 *
 * For complex tooltips, a template can be used to define the content:
 * <div
 *     [appTooltip]="tooltipTemplate"
 *     [tooltipContext]="{ prop1: 'hasta', prop2: 'luego' }"
 *     tooltipSize=400
 *     tooltipPlacement="right">
 *     My target element
 * </div>
 * <ng-template #tooltipTemplate>
 *     {{ prop1 }}<br />{{ prop2 }}
 * </ng-template>
 *
 * openMouseX and openMouseY can be used to place the tooltip where the mouse
 * entered the target, on the X and/or Y axis.
 * <div
 *     appTooltip
 *     tooltipContent="Some tooltip content here"
 *     [openOnMouseX]="true">
 *     My target element.
 * </div>
 *
 * The tooltip directive can also be used on a target to close all
 * tooltips on hover. The following div closes all tooltips on hover.
 * <div
 *     appTooltip
 *     [hideAllTooltips]="true">
 *     My target element.
 * </div>
 */
@Directive({
    selector: '[appTooltip]',
})
export class TooltipDirective implements OnDestroy {
    @Input() appTooltip: TemplateRef<any> | undefined;

    @Input() hideAllTooltips = false;

    @Input() openOnMouseX = false;

    @Input() openOnMouseY = false;

    @Input() set showTooltip(value: boolean) {
        this._showTooltip = value;
        if (!this._showTooltip) {
            this.hide();
        }
    }

    @Input() tooltipContent: string | undefined;

    @Input() tooltipPlacement: Placement = Placement.top;

    @Input() tooltipSize: Size = 'sm';

    @Input() tooltipContext: any = {};

    private _showTooltip = true;

    private mouseX = 0;

    private mouseY = 0;

    private tooltipWrapperRef: ComponentRef<TooltipWrapperComponent> | undefined;

    constructor(
        private elementRef: ElementRef,
        private resolver: ComponentFactoryResolver,
        private injector: Injector,
        private tooltipService: TooltipService
    ) {}

    @HostListener('mouseenter', ['$event']) onMouseEnter(event: MouseEvent): void {
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;
        if (this.hideAllTooltips) {
            this.hide();
        } else {
            this.show();
        }
    }

    @HostListener('mouseleave') onMouseLeave(): void {
        this.hide();
    }

    @HostListener('window:resize') onResize(): void {
        if (this.tooltipWrapperRef) {
            this.tooltipWrapperRef.instance.target = this.getTargetRect();
            this.tooltipWrapperRef.instance.update();
        }
    }

    ngOnDestroy(): void {
        this.hide();
    }

    getTargetRect(): Rect {
        const element = this.elementRef.nativeElement;
        const boundingRect = element.getBoundingClientRect();
        const rect = {
            left: boundingRect.left,
            top: boundingRect.top,
            width: element.clientWidth,
            height: element.clientHeight,
        };

        if (this.openOnMouseX) {
            rect.left = this.mouseX;
            rect.width = 0;
        }
        if (this.openOnMouseY) {
            rect.top = this.mouseY;
            rect.height = 0;
        }
        return rect;
    }

    hide(): void {
        this.tooltipService.hide();
    }

    show(): void {
        if (this._showTooltip && !this.hideAllTooltips) {
            // Instantiate the tooltip wrapper component
            const tooltipWrapperfactory = this.resolver.resolveComponentFactory(TooltipWrapperComponent);
            this.tooltipWrapperRef = tooltipWrapperfactory.create(this.injector);

            // Set the tooltip inputs
            this.tooltipWrapperRef.instance.tooltipTemplate = this.appTooltip;
            this.tooltipWrapperRef.instance.tooltipContent = this.tooltipContent;
            this.tooltipWrapperRef.instance.tooltipContext = {
                $implicit: this.tooltipContext,
            };
            this.tooltipWrapperRef.instance.target = this.getTargetRect();
            this.tooltipWrapperRef.instance.size = this.tooltipSize;
            this.tooltipWrapperRef.instance.defaultPlacement = this.tooltipPlacement;

            this.tooltipService.show(this.tooltipWrapperRef);
        }
    }
}
