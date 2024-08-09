import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-show-more-less',
    templateUrl: './show-more-less.component.html',
    styleUrls: ['./show-more-less.component.scss'],
})
export class ShowMoreLessComponent {
    @Input() set text(info: string) {
        this._text = info;
        this.displayedText = this.setMaxLengthString();
    }

    displayedText = '';

    showMore = false;

    isTextShortened = false;

    isTextTooLong = false;

    @Input() maxLength = 1000;

    @Input() dataQA = '';

    private _text = '';

    showAll(): void {
        this.showMore = !this.showMore;
        this.displayedText = this.setMaxLengthString();
    }

    setMaxLengthString(): string {
        if (!this.showMore && this._text.length > this.maxLength) {
            this.isTextTooLong = true;
            this.isTextShortened = true;
            return `${this._text.substring(0, this.maxLength)}...`;
        }
        this.isTextShortened = false;
        this.isTextTooLong = false;
        return this._text;
    }
}
