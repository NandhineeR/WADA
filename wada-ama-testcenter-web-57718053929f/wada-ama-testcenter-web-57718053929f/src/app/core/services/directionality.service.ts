import { Inject, Injectable, Optional } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type Direction = 'ltr' | 'rtl';

@Injectable()
export class DirectionalityService {
    readonly value: Direction = 'ltr';

    constructor(@Optional() @Inject(DOCUMENT) document?: any) {
        if (document) {
            const bodyDir = document.body?.dir || undefined;
            const htmlDir = document.documentElement?.dir || undefined;
            this.value = (bodyDir || htmlDir || 'ltr') as Direction;
        }
    }
}
