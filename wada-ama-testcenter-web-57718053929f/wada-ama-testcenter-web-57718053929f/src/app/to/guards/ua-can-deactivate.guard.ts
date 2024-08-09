import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { CanComponentDeactivate } from '@to/guards/can-deactivate.guard';
import { ConfirmLeaveService } from '@shared/services';

@Injectable()
export class UACanDeactivateGuard implements CanDeactivate<CanComponentDeactivate> {
    constructor(private confirmLeaveService: ConfirmLeaveService) {}

    canDeactivate(
        component: CanComponentDeactivate,
        _currentRoute: ActivatedRouteSnapshot,
        _currentState: RouterStateSnapshot,
        nextState: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        // If we navigate to another step, call the step canDeactivate() method,
        // otherwise, allow navigation
        const uaRouteRegex = /(to\/ua\/new\/)|(to\/ua\/edit)|(to\/ua\/view)/;
        if (nextState.url.match(uaRouteRegex)) {
            return component.canDeactivate ? component.canDeactivate() : true;
        }
        return this.confirmLeaveService.confirm();
    }
}
