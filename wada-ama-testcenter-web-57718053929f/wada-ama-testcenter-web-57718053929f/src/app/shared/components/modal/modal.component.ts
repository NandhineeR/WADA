import {
    AfterContentInit,
    AfterViewInit,
    Component,
    ContentChildren,
    DoCheck,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    OnDestroy,
    Output,
    QueryList,
    Renderer2,
    ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-modal',
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements AfterContentInit, AfterViewInit, DoCheck, OnDestroy {
    @Output() readonly modalClose: EventEmitter<any> = new EventEmitter<any>();

    @Input() page = '';

    @Input() scrollable = false;

    @Input() removeMargin = false;

    @Input() centralizeButtons = false;

    @Input() resizeModal = false;

    @Input() minHeight = '680px';

    @Input() minWidth = '1200px';

    @Input() isClosable = true;

    @ContentChildren('button')
    content: QueryList<ElementRef> = new QueryList<ElementRef>();

    @ViewChild('modalWrapper', { static: true })
    modal: ElementRef | null = null;

    width = 0;

    modalLocked = false;

    isCloseModalClicked = false;

    hasContent = false;

    private subscription: Subscription = new Subscription();

    constructor(private router: Router, @Inject(APP_BASE_HREF) private baseHref: string, private renderer: Renderer2) {}

    @Input() set isModalLocked(isModalLocked: boolean) {
        this.modalLocked = isModalLocked;
        if (!isModalLocked) {
            this.closeModalWindow();
        }
    }

    closeModal(isClicked: boolean): void {
        this.isCloseModalClicked = isClicked;
        this.modalClose.next();
        if (!this.modalLocked) {
            this.closeModalWindow();
        }
    }

    closeModalWindow(): void {
        if (this.isCloseModalClicked) {
            if (this.page.indexOf('(')) {
                this.page = this.page.substring(this.baseHref.length, this.page.indexOf('('));
            }
            this.router.navigate([this.page, { outlets: { modal: null } }]);
        }
    }

    ngAfterViewInit(): void {
        this.redefineModalStyles();
    }

    ngAfterContentInit(): void {
        this.hasContent = this.content.length > 0;
        this.subscription = this.content.changes.subscribe(() => {
            this.hasContent = this.content.length > 0;
        });
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    ngDoCheck(): void {
        if (this.modal) {
            this.width = this.modal.nativeElement.clientWidth;
        }
    }

    redefineModalStyles(): void {
        if (this.resizeModal && this.modal) {
            this.renderer.setStyle(this.modal.nativeElement, 'min-height', `${this.minHeight}`);
            this.renderer.setStyle(this.modal.nativeElement, 'min-width', `${this.minWidth}`);
        }
    }
}
