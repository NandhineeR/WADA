import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements AfterViewInit {
    @ViewChild('searchRef', { static: true }) searchRef: ElementRef | undefined;

    @Output()
    readonly searchAthlete: EventEmitter<string> = new EventEmitter<string>();

    @Output()
    readonly searchLengthError: EventEmitter<boolean> = new EventEmitter<boolean>();

    @Input() searchAthleteRowsLength = 0;

    @Input() searchStringText = '';

    @Input() loadingSearch = false;

    @Input() isLengthErrorActive = false;

    ngAfterViewInit(): void {
        setTimeout(() => {
            if (this.searchRef) {
                this.searchRef.nativeElement.focus();
            }
        });
    }

    resetResearch(): void {
        if (this.searchRef) {
            this.searchRef.nativeElement.value = '';
            setTimeout(() => this.searchRef && this.searchRef.nativeElement.focus());
        }
    }

    searchAthleteClick(): void {
        if (this.searchRef) {
            const isMinimumLength = this.searchRef.nativeElement.value.length >= 2;
            if (isMinimumLength) {
                this.searchAthlete.emit(this.searchRef.nativeElement.value);
            }
            this.searchLengthError.emit(!isMinimumLength);
        }
    }

    validateLength(): void {
        if (this.searchRef && this.isLengthErrorActive) {
            this.searchLengthError.emit(this.searchRef.nativeElement.value.length < 2);
        }
    }
}
