import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { ConfirmLeaveService } from '@shared/services';

export interface CanComponentDeactivate {
    canDeactivate(): Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable()
export class CanDeactivateGuard implements CanDeactivate<CanComponentDeactivate> {
    constructor(private confirmLeaveService: ConfirmLeaveService) {}

    canDeactivate(
        component: CanComponentDeactivate,
        _currentRoute: ActivatedRouteSnapshot,
        _currentState: RouterStateSnapshot,
        nextState: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        // If we navigate to another step, call the step canDeactivate() method,
        // otherwise, allow navigation
        const toStepRouteRegex = /(to\/new\/step\/\d)|(to\/edit\/\d+\/step\/\d)|(to\/view\/\d)/;

        if (nextState.url.match(toStepRouteRegex)) {
            return this.confirmLeaveService.confirmChangeStep(component);
        }

        return this.confirmLeaveService.confirm();
    }
}
