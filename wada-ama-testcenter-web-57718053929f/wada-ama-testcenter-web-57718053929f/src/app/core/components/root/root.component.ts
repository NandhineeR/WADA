import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isNullOrBlank } from '@shared/utils';
import { AbpAccess } from './abp.access.model';

@Component({
    template: '',
})
export class RootComponent implements OnInit {
    constructor(private router: Router, private route: ActivatedRoute) {}

    ngOnInit(): void {
        let link = '/dashboard';
        const abpAccess: AbpAccess | undefined = this.getAbpAccessToken();
        if (abpAccess) {
            link = `/${abpAccess.resourceType}/view/${abpAccess.resourceId}`;
        }
        this.router.navigate([link], { queryParamsHandling: 'preserve' });
    }

    getAbpAccessToken(): AbpAccess | undefined {
        const urlEncodedBase64EncodedAbpAccess: string = this.getRawAbpAccessParameter();
        if (!isNullOrBlank(urlEncodedBase64EncodedAbpAccess)) {
            const base64EncodedAbpAccess = decodeURI(urlEncodedBase64EncodedAbpAccess);
            if (base64EncodedAbpAccess) {
                const abpAccessParameter = atob(base64EncodedAbpAccess);
                const abpAccess: AbpAccess = JSON.parse(abpAccessParameter);
                return abpAccess;
            }
        }
        return undefined;
    }

    getRawAbpAccessParameter(): string {
        return this.route?.snapshot?.queryParams?.abpAccess || '';
    }
}
