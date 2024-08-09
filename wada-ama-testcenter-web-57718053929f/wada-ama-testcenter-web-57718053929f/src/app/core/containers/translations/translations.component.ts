import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { TranslationMap, TranslationService } from '@core/services';

@Component({
    selector: 'app-translations',
    templateUrl: './translations.component.html',
})
export class TranslationsComponent implements OnInit {
    @ViewChild('translationsRef', { static: true })
    translationsRef?: TemplateRef<any>;

    constructor(private translationService: TranslationService) {}

    ngOnInit(): void {
        this.translationService.setMap(this.createMap());
    }

    private createMap(): TranslationMap {
        // We instantiate the template and extract the translations from the span elements
        // The class name on each span is the key in the resulting translations map
        if (this.translationsRef) {
            return this.translationsRef
                .createEmbeddedView({})
                .rootNodes.filter(
                    (item) => item.nodeName && item.nodeName.toLocaleLowerCase() === 'span' && item.className.length > 0
                )
                .reduce((accum, item) => {
                    accum[item.className.replace(/\s/g, '').toLowerCase()] = item.textContent;
                    return accum;
                }, {});
        }
        return {};
    }
}
