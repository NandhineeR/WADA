import { fromEvent, Subscription } from 'rxjs';
import {
    AfterViewChecked,
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    Output,
    Renderer2,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { MLA_OPTIONAL_LEVEL } from '@shared/models/constants';
import { Analysis, MLA, TDSSARow, TDSSASheet } from '@tdssa/models';
import * as fromStore from '@tdssa/store';
import { TranslationService } from '@core/services';

const LOADING_ANIMATION_MS = 1000;

// An interface to map strings to booleans
// to determine the visibility of subrows in the table
interface SportNameToVisibilityMap {
    [key: string]: boolean;
}

@Component({
    selector: 'app-tdssa-table',
    templateUrl: './tdssa-table.component.html',
    styleUrls: ['./tdssa-table.component.scss'],
})
export class TDSSATableComponent implements OnChanges, AfterViewChecked, AfterViewInit, OnDestroy {
    @Input() tdssaSheet: TDSSASheet = new TDSSASheet();

    @Input() mlaArray: Array<MLA> = new Array<MLA>();

    @Output()
    readonly search: EventEmitter<string> = new EventEmitter<string>();

    @Output()
    readonly mlaChange: EventEmitter<fromStore.IMLAObject> = new EventEmitter<fromStore.IMLAObject>();

    @ViewChild('searchBarRef', { static: true }) searchRef: ElementRef | undefined;

    @ViewChild('headerRef', { static: true }) headerRef: ElementRef | undefined;

    @ViewChild('grandTotalRowRef', { static: true }) grandTotalRowRef: ElementRef | undefined;

    @ViewChild('tableBodyRef') tableBodyRef: ElementRef | undefined;

    @ViewChild('imgLoadingRef') imgLoadingRef: ElementRef | undefined;

    @ViewChild('textLoadingRef') textLoadingRef: ElementRef | undefined;

    @ViewChild('loadingOverlayRef') loadingOverlayRef: ElementRef | undefined;

    visibilityMap: SportNameToVisibilityMap = {};

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
        }
        if (this.loadingTimeout) {
            clearTimeout(this.loadingTimeout);
            this.loadingTimeout = undefined;
        }
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
        this.updateOverlaySize();
    }

    ngAfterViewChecked(): void {
        this.updateOverlaySize();
    }

    ngOnChanges(changes: SimpleChanges): void {
        // When the TDSSA sheet is updated, update the visibility array
        if (this.tdssaSheet && changes.tdssaSheet && this.tdssaSheet !== changes.tdssaSheet.previousValue) {
            this.tdssaSheet.rows.forEach((row: TDSSARow) => {
                this.visibilityMap[row.sportName] = this.visibilityMap[row.sportName] || false;
            });
            this.updateCollapseButtonStatus();
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

    onMLAChange(value: number, index: number): void {
        const mla: fromStore.IMLAObject = { index, value };
        this.animateLoading();
        this.mlaChange.emit(mla);
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

    lengthCoveredChanged(length: number): void {
        this.lengthCovered = length;
        this.updateOverlaySize();
    }

    toggleVisibility(sportName: string): void {
        this.visibilityMap[sportName] = !this.visibilityMap[sportName];
        this.updateCollapseButtonStatus();
    }

    showAll(isVisible: boolean): void {
        this.anyExpanded = isVisible;
        this.anyCollapsed = !isVisible;
        if (this.tdssaSheet) {
            this.tdssaSheet.rows.forEach((row: TDSSARow) => {
                this.visibilityMap[row.sportName] = isVisible;
            });
        }
    }

    updateCollapseButtonStatus(): void {
        this.anyCollapsed = false;
        this.anyExpanded = false;
        this.tdssaSheet.rows.forEach((row: TDSSARow) => {
            this.anyCollapsed = this.anyCollapsed || this.visibilityMap[row.sportName] === false;
            this.anyExpanded = this.anyExpanded || this.visibilityMap[row.sportName] === true;
        });
    }

    iconLevel(discipline: TDSSARow, analysis: Analysis): string {
        if (analysis.mla === MLA_OPTIONAL_LEVEL || analysis.categoryCode === 'GH') {
            if (
                discipline.totals.testTotal === 0
                    ? 0
                    : analysis.total >= Math.round((analysis.mla * discipline.totals.testTotal) / 100)
            ) {
                return 'green';
            }
            return 'yellow';
        }
        if (
            discipline.totals.testTotal === 0
                ? 0
                : analysis.total >= Math.round((analysis.mla * discipline.totals.testTotal) / 100)
        ) {
            return 'green';
        }
        return 'red';
    }
}
