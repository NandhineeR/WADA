import { isNullOrBlank } from '@shared/utils';
import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    Output,
    Renderer2,
    ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { PopoverService } from '@core/services';

type Placement = 'top' | 'bottom';

@Component({
    selector: 'app-popover',
    templateUrl: './popover.component.html',
    styleUrls: ['./popover.component.scss'],
})
export class PopoverComponent implements OnDestroy {
    @ViewChild('arrowRef') arrowRef?: ElementRef;

    @ViewChild('popoverRef') set popoverRef(element: ElementRef) {
        this._popoverRef = element;
        this.calcVerticalPlacement();
        this.checkHorizontalOverflow();
        this.changeDetector.detectChanges();
    }

    @ViewChild('targetRef', { static: true }) targetRef?: ElementRef;

    // Event emitted when this popover is closed
    @Output()
    readonly closePopover: EventEmitter<boolean> = new EventEmitter<boolean>();

    // Event emitted when this popover is opened
    @Output()
    readonly openPopover: EventEmitter<boolean> = new EventEmitter<boolean>();

    @Input() arrowTranslateX = -50;

    @Input() popoverTranslateX = 0;

    @Input() standardWidth = '';

    @Input() wantedPlacement: Placement = 'top';

    opened = false;

    placement: Placement = 'top';

    private _popoverRef?: ElementRef;

    private popoverSafetyMargin = 20; // This is a safety margin to make sure the popover is never cropped

    private popoverServiceSubscription: Subscription;

    private requestOpen = false;

    private windowMargin = 10; // The margin between the window and the popover

    constructor(
        private popoverService: PopoverService,
        private renderer: Renderer2,
        private changeDetector: ChangeDetectorRef
    ) {
        this.popoverServiceSubscription = this.popoverService.state$.subscribe(() => {
            if (this.requestOpen) {
                this.doOpen();
            } else {
                this.doClose();
            }
        });
    }

    ngOnDestroy(): void {
        this.popoverServiceSubscription.unsubscribe();
    }

    calcAvailableSpaceOnSide(side: Placement): number {
        if (!this.targetRef) {
            return 0;
        }

        let element = this.targetRef.nativeElement;
        let targetSideOffset = side === 'top' ? 0 : element.offsetHeight;

        while (element !== null) {
            targetSideOffset += element.offsetTop;
            element = element.offsetParent;
        }

        return side === 'top'
            ? targetSideOffset - window.scrollY
            : window.scrollY + window.innerHeight - targetSideOffset;
    }

    calcVerticalPlacement(): void {
        if (!this._popoverRef || !this.targetRef) {
            return;
        }

        const spaceAtTop = this.calcAvailableSpaceOnSide('top');
        const spaceAtBottom = this.calcAvailableSpaceOnSide('bottom');
        if (this.wantedPlacement !== 'top') {
            this.placement = this.wantedPlacement;
        } else if (spaceAtTop >= this._popoverRef.nativeElement.offsetHeight + this.popoverSafetyMargin) {
            this.placement = 'top';
        } else {
            this.placement = spaceAtBottom > spaceAtTop ? 'bottom' : 'top';
        }
    }

    checkHorizontalOverflow(): void {
        if (!this._popoverRef || !this.targetRef || !this.arrowRef) {
            return;
        }

        const targetWidth = this.targetRef.nativeElement.offsetWidth;
        const popoverWidth = this._popoverRef.nativeElement.offsetWidth;
        const halfWidthDifference = (popoverWidth - targetWidth) / 2;

        // Check overflow on left side
        let element = this.targetRef.nativeElement;
        let offsetTotal = 0;

        while (element !== null) {
            offsetTotal += element.offsetLeft;
            element = element.offsetParent;
        }
        let freeSpace = offsetTotal;

        if (freeSpace < halfWidthDifference + this.windowMargin) {
            const offset = -(freeSpace - this.windowMargin);
            this.renderer.setStyle(
                this._popoverRef.nativeElement,
                'transform',
                `translateX(${this.popoverTranslateX}%)`
            );
            if (!isNullOrBlank(this.standardWidth)) {
                this.renderer.setStyle(this._popoverRef.nativeElement, 'width', `${this.standardWidth}px`);
            }
            this.renderer.setStyle(this.arrowRef.nativeElement, 'transform', `translateX(${this.arrowTranslateX}%)`);
            this.renderer.setStyle(this._popoverRef.nativeElement, 'left', `${offset}px`);
            this.renderer.setStyle(this.arrowRef.nativeElement, 'left', `${-offset + targetWidth / 2}px`);
        }

        // Check overflow on right side
        element = this.targetRef.nativeElement;
        offsetTotal = element.offsetWidth;

        while (element !== null) {
            offsetTotal += element.offsetLeft;
            element = element.offsetParent;
        }
        const RIGHT_MARGIN = 110;
        freeSpace = window.scrollX + window.innerWidth - offsetTotal - RIGHT_MARGIN;

        if (freeSpace < halfWidthDifference + this.windowMargin) {
            const offset = freeSpace - this.windowMargin;
            this.renderer.setStyle(
                this._popoverRef.nativeElement,
                'transform',
                `translateX(${this.popoverTranslateX}%)`
            );
            if (!isNullOrBlank(this.standardWidth)) {
                this.renderer.setStyle(this._popoverRef.nativeElement, 'width', `${this.standardWidth}px`);
            }
            this.renderer.setStyle(this.arrowRef.nativeElement, 'transform', `translateX(${this.arrowTranslateX}%)`);
            this.renderer.setStyle(this._popoverRef.nativeElement, 'left', `${offset - halfWidthDifference * 2}px`);
            this.renderer.setStyle(
                this.arrowRef.nativeElement,
                'left',
                `${popoverWidth - offset - targetWidth / 2 - 1}px`
            );
        }
    }

    doClose(): void {
        if (this.opened) {
            this.opened = false;
            this.closePopover.emit(true);
        }
        this.requestOpen = false;
    }

    doOpen(): void {
        this.opened = true;
        this.openPopover.emit(true);
        this.requestOpen = false;
    }

    onClose(): void {
        this.popoverService.closeAll();
    }

    onToggle(event: any): void {
        event.stopPropagation();
        if (!this.opened) {
            this.requestOpen = true;
        }
        this.popoverService.closeAll();
    }
}
