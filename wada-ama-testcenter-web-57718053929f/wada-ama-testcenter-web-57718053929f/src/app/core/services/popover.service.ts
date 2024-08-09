import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class PopoverService {
    state$: Observable<boolean>;

    private stateSource: Subject<boolean> = new Subject<boolean>();

    constructor() {
        this.state$ = this.stateSource.asObservable();
    }

    closeAll(): void {
        this.stateSource.next(false);
    }
}
