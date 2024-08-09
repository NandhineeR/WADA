import { Directive, ElementRef, OnDestroy, Renderer2 } from '@angular/core';

@Directive({
    selector: '[appRandomizeInput]',
    exportAs: 'appRandomizeInput',
})
export class RandomizeInputDirective implements OnDestroy {
    private changes: MutationObserver;

    private hasBeenRandomized: Set<string>;

    private mappedIdToRandomizedId: Map<string, string>;

    constructor(private elementRef: ElementRef, private _renderer: Renderer2) {
        this.hasBeenRandomized = new Set<string>();
        this.mappedIdToRandomizedId = new Map<string, string>();
        this.changes = new MutationObserver(() => {
            this.randomize();
        });

        this.changes.observe(elementRef.nativeElement, {
            childList: true,
            subtree: true,
        });
    }

    ngOnDestroy(): void {
        this.changes.disconnect();
    }

    randomize(): void {
        this.randomizeControl(this.elementRef.nativeElement);
        const list = this.elementRef.nativeElement.querySelectorAll("input[type='text'], textarea, app-dropdown") || [];
        list.forEach((input: HTMLElement) => {
            this.randomizeControl(input);
        });
    }

    randomizeControl(element: any): void {
        let randomizedId = '';
        if (!this.mappedIdToRandomizedId.get(element.id) && !this.hasBeenRandomized.has(element.id)) {
            randomizedId = this.getRandomId();
            this.mappedIdToRandomizedId.set(element.id, randomizedId);
            this.hasBeenRandomized.add(randomizedId);
            this._renderer.setAttribute(element, 'id', randomizedId);
        } else if (this.mappedIdToRandomizedId.get(element.id)) {
            this._renderer.setAttribute(element, 'id', this.mappedIdToRandomizedId.get(element.id) || '');
        }
    }

    getId(key: string): string {
        return this.mappedIdToRandomizedId.get(key) || '';
    }

    getRandomId(): string {
        return Math.floor(Math.random() * 1000000).toString(); // NOSONAR
    }
}
