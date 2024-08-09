import { fromEvent, Subscription } from 'rxjs';
import {
    AfterViewChecked,
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    Output,
    Renderer2,
    ViewChild,
} from '@angular/core';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { TDPMRow, TDPMSheetInfo, TestTypeToShow } from '@tdpm/models';

import { TranslationService } from '@core/services';

const LOADING_ANIMATION_MS = 1000;

interface SportIdToVisibilityMap {
    [key: number]: boolean;
}

@Component({
    selector: 'app-tdpm-table',
    templateUrl: './tdpm-table.component.html',
    styleUrls: ['./tdpm-table.component.scss'],
})
export class TDPMTableComponent implements AfterViewChecked, AfterViewInit, OnDestroy {
    @Input() showType: TestTypeToShow = TestTypeToShow.CompleteNoLabResultMatched;

    @Input() tdpmSheetInfo: TDPMSheetInfo = new TDPMSheetInfo();

    @ViewChild('searchBarRef') searchRef: ElementRef | undefined;

    @ViewChild('headerRef') headerRef: ElementRef | undefined;

    @ViewChild('grandTotalRowRef') grandTotalRowRef: ElementRef | undefined;

    @ViewChild('tableBodyRef') tableBodyRef: ElementRef | undefined;

    @ViewChild('imgLoadingRef') imgLoadingRef: ElementRef | undefined;

    @ViewChild('textLoadingRef') textLoadingRef: ElementRef | undefined;

    @ViewChild('loadingOverlayRef') loadingOverlayRef: ElementRef | undefined;

    @Output()
    readonly search: EventEmitter<string> = new EventEmitter<string>();

    showTypeEnum = TestTypeToShow;

    visibilityMap: SportIdToVisibilityMap = {};

    anyExpanded = false;

    anyCollapsed = true;

    tableLoading = false;

    translations$ = this.translationService.translations$;

    private lengthCovered = 0;

    private keyupSubscription: Subscription | undefined;

    private loadingTimeout?: NodeJS.Timer = undefined;

    constructor(private renderer: Renderer2, private translationService: TranslationService) {}

    ngOnDestroy(): void {
        if (this.keyupSubscription) {
            this.keyupSubscription.unsubscribe();
            this.keyupSubscription = undefined;
        }
        if (this.loadingTimeout) {
            clearTimeout(this.loadingTimeout);
            this.loadingTimeout = undefined;
        }
    }

    updateOverlaySize(): void {
        if (
            this.tableLoading &&
            this.headerRef &&
            this.loadingOverlayRef &&
            this.grandTotalRowRef &&
            this.tableBodyRef &&
            this.imgLoadingRef &&
            this.textLoadingRef
        ) {
            // The loading overlay must cover the body and the grand total row
            const overlayTop =
                this.lengthCovered +
                this.headerRef.nativeElement.clientHeight -
                this.grandTotalRowRef.nativeElement.clientHeight;
            this.renderer.setStyle(this.loadingOverlayRef.nativeElement, 'top', `${overlayTop}px`);

            // If the body is too small, the image will disappear and the text will be smaller
            if (
                this.tableBodyRef.nativeElement.clientHeight <=
                this.imgLoadingRef.nativeElement.clientHeight + this.textLoadingRef.nativeElement.clientHeight
            ) {
                this.renderer.addClass(this.imgLoadingRef.nativeElement, 'none');
                this.renderer.addClass(this.textLoadingRef.nativeElement, 'small');
            } else {
                this.renderer.removeClass(this.imgLoadingRef.nativeElement, 'none');
                this.renderer.removeClass(this.textLoadingRef.nativeElement, 'small');
            }
        }
    }

    animateLoading(): void {
        this.tableLoading = true;
        // Remove the animation after a delay
        if (this.loadingTimeout) {
            clearTimeout(this.loadingTimeout);
        }
        this.loadingTimeout = setTimeout(() => {
            this.tableLoading = false;
            this.loadingTimeout = undefined;
        }, LOADING_ANIMATION_MS);
    }

    lengthCoveredChanged(length: number): void {
        this.lengthCovered = length;
        this.updateOverlaySize();
    }

    ngAfterViewInit(): void {
        if (this.searchRef) {
            this.keyupSubscription = fromEvent(this.searchRef.nativeElement, 'keyup')
                .pipe(
                    map((event: any) => event.target.value),
                    debounceTime(300),
                    distinctUntilChanged()
                )
                .subscribe((text: string) => {
                    this.animateLoading();
                    this.search.emit(text);
                });
        }
    }

    ngAfterViewChecked(): void {
        this.updateOverlaySize();
    }

    toggleVisibility(sportId: number): void {
        this.visibilityMap[sportId] = !this.visibilityMap[sportId];
        this.updateCollapseButtonStatus();
    }

    updateCollapseButtonStatus(): void {
        if (this.tdpmSheetInfo) {
            this.anyCollapsed = false;
            this.anyExpanded = false;
            this.tdpmSheetInfo.rows.forEach((row: TDPMRow) => {
                this.anyCollapsed = this.anyCollapsed || this.visibilityMap[row.sportId] === false;
                this.anyExpanded = this.anyExpanded || this.visibilityMap[row.sportId] === true;
            });
        }
    }

    showAll(isVisible: boolean): void {
        this.anyExpanded = isVisible;
        this.anyCollapsed = !isVisible;
        if (this.tdpmSheetInfo) {
            this.tdpmSheetInfo.rows.forEach((row: TDPMRow) => {
                this.visibilityMap[row.sportId] = isVisible;
            });
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    customTrackBy(index: number, _item: any): number {
        return index;
    }
}
