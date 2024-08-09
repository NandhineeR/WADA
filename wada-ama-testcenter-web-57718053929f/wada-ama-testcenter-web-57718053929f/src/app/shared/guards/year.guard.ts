import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';

@Injectable()
export class YearGuard implements CanActivate {
    canActivate(
        route: ActivatedRouteSnapshot,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _state: RouterStateSnapshot
    ): boolean {
        const year = Number(route.paramMap.get('year'));
        const currentYear = new Date().getFullYear();
        // We only allow year to be +-1 around currentYear
        return Math.abs(year - currentYear) <= 1;
    }
}
