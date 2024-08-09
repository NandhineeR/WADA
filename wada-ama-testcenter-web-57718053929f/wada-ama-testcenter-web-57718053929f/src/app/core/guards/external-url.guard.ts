import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';

@Injectable()
export class ExternalUrlGuard implements CanActivate {
    canActivate(route: ActivatedRouteSnapshot): boolean {
        const externalUrl = route.paramMap.get('externalUrl');
        if (externalUrl) {
            window.open(externalUrl, '_self');
        }
        return false;
    }
}
