import { fromEvent, Subscription } from 'rxjs';
import { Directive, ElementRef, EventEmitter, Inject, Input, OnDestroy, Output } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { delay, map, tap } from 'rxjs/operators';

interface ClickOutsideEvent {
    target: EventTarget | undefined;
    value: boolean;
}

@Directive({
    selector: '[appClickOutside]',
})
export class ClickOutsideDirective implements OnDestroy {
    @Output()
    readonly clickOutside: EventEmitter<ClickOutsideEvent> = new EventEmitter();

    @Input() verifyClickCoordinates = false;

    private listening = false;

    private globalClick: Subscription;

    constructor(private elementRef: ElementRef, @Inject(DOCUMENT) private document: Document) {
        this.globalClick = fromEvent(this.document, 'mousedown')
            .pipe(
                delay(1),
                tap(() => {
                    this.listening = true;
                }),
                map((event: any) => event as MouseEvent)
            )
            .subscribe((event: MouseEvent) => this.onGlobalClick(event));
    }

    ngOnDestroy(): void {
        this.globalClick.unsubscribe();
    }

    onGlobalClick(event: MouseEvent): void {
        if (event instanceof MouseEvent && this.listening === true) {
            if (this.verifyClickCoordinates) {
                const parentRect = this.elementRef.nativeElement.getBoundingClientRect();
                if (
                    event.x < parentRect.x ||
                    event.x > parentRect.x + parentRect.width ||
                    event.y < parentRect.y ||
                    event.y > parentRect.y + parentRect.height
                ) {
                    this.clickOutside.emit({
                        target: event.target || undefined,
                        value: true,
                    });
                }
            } else if (!this.isDescendant(this.elementRef.nativeElement, event.target)) {
                this.clickOutside.emit({
                    target: event.target || undefined,
                    value: true,
                });
            }
        }
    }

    isDescendant(parent: any, child: any): boolean {
        let node = child;
        while (node !== null) {
            if (node === parent) {
                return true;
            }
            node = node.parentNode;
        }
        return false;
    }
}
