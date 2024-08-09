import { isNullOrBlank } from '@shared/utils';
import { Directive, HostListener, Input } from '@angular/core';
import { environment } from '@env';
import { removeLastSlash } from '@shared/utils/string-utils';

/**
 * Directive used to open entities from NEXGEN on Adams classic
 */
@Directive({
    selector: '[appOpenObjectInClassic]',
})
export class OpenTargetObjectInClassicDirective {
    @Input() objectId = '';

    @Input() dcfId = '';

    @Input() targetObject = '';

    @Input() abpAccess = '';

    @Input() athleteId = '';

    @Input() type = '';

    @Input() toId = '';

    @Input() sampleId = '';

    @Input() toEndDate = Date;

    @Input() toStartDate = Date;

    @Input() enabled = true;

    @Input() newTab = true;

    adamsUrl = removeLastSlash(environment.adamsUrl);

    /**
     * Dynamically adds a click event to a html element, which is responsible for opening a popup window with an Object in Adams Classic
     */
    @HostListener('click', ['$event']) onClick(event: Event): void {
        if (this.enabled) {
            let url = '';
            switch (this.targetObject) {
                case 'AAF':
                case 'ATF':
                    url = `${this.adamsUrl}/requestViewAAF.do?aafId=${this.objectId}&athleteId=${this.athleteId}&frameset=none`;
                    url = this.appendAbpAccessQueryParameter(url);
                    break;
                case 'BloodPassportSample':
                    url = `${this.adamsUrl}/requestTemplateConfiguration.do?action=generatePDF&entityType=${this.targetObject}&entityId=${this.sampleId}&athleteId=${this.athleteId}&templateIdPDF=${this.targetObject}&noDuplicates=3&imageFormat=false`;
                    url = this.appendAbpAccessQueryParameter(url);
                    break;
                case 'CreateTestingOrderActivity':
                    url = `${this.adamsUrl}/requestNewMissionOrderActivity.do?method=requestNewActivity&athlete=true&ownerId=${this.objectId}&ownerType=MissionOrder&activityType=MissionOrder&year=&month=&whereabouts=&nonAthlete=false`;
                    break;
                case 'CreateDCFActivity':
                    url = `${this.adamsUrl}/requestNewDCFActivity.do?method=requestNewActivity&athlete=true&athleteId=${this.athleteId}&ownerId=${this.objectId}&ownerType=Test&activityType=DCF&year=&month=&whereabouts=&nonAthlete=false`;
                    break;
                case 'CreateAthlete':
                    url = `${this.adamsUrl}/requestNewAthleteForm.do`;
                    break;
                case 'DCFActivity':
                    url =
                        `${this.adamsUrl}/requestView${this.targetObject}.do?method=requestViewActivity&athleteRetired=false&activityId=${this.objectId}&athlete=true` +
                        `&athleteId=${this.athleteId}&ownerId=${this.dcfId}&ownerType=Test&activityType=DCF&nonAthlete=false&canEditMedical=false&differentOrg=false`;
                    url = this.appendAbpAccessQueryParameter(url);
                    break;
                case 'MissionOrderActivity':
                    url =
                        `${this.adamsUrl}/requestView${this.targetObject}.do?method=requestViewActivity&activityId=${this.objectId}` +
                        `&ownerId=${this.toId}&ownerType=MissionOrder&activityType=MissionOrder&nonAthlete=false&canEditMedical=false&differentOrg=false`;
                    break;
                case 'Athlete':
                    url = `${this.adamsUrl}/requestView${this.targetObject}.do?athleteId=${this.objectId}&view=true&frameset=none`;
                    url = this.appendAbpAccessQueryParameter(url);
                    break;
                case 'ChainOfCustody':
                    if (isNullOrBlank(this.objectId)) {
                        url = `${this.adamsUrl}/manage${this.targetObject}.do?method=searchChainOfCustody&view=true&frameset=none`;
                    } else {
                        url = `${this.adamsUrl}/manage${this.targetObject}.do?method=requestViewChainOfCustody&chainId=${this.objectId}&view=true&frameset=none`;
                    }
                    url = this.appendAbpAccessQueryParameter(url);
                    break;
                case 'Dcf':
                    url = `${this.adamsUrl}/requestViewDCF.do?athleteId=${this.objectId}&dcfId=${this.dcfId}&fromTree=true&refreshNeeded=true&frameset=full`;
                    break;
                case 'LabResult':
                    if (this.type === 'Blood_passport') {
                        url = `${this.adamsUrl}/requestViewBPLabResult.do?method=requestViewBPLabResult&id=${this.objectId}&view=true&frameset=none`;
                    } else {
                        url = `${this.adamsUrl}/requestViewLabResult.do?method=requestViewLabResult&id=${this.objectId}&view=true&frameset=none`;
                    }
                    url = this.appendAbpAccessQueryParameter(url);
                    break;
                case 'MajorGame':
                    url = `${this.adamsUrl}/manageMajorGame.do?method=requestViewMajorGame&id=${this.objectId}&exploded=true&frameset=none`;
                    break;
                case 'MissionOrder':
                    url = `${this.adamsUrl}/requestViewMissionOrder.do?id=${this.objectId}&fromTree=true&refreshNeeded=true&frameset=full`;
                    break;
                case 'Organization':
                    url = `${this.adamsUrl}/requestSearchOrganizations.do?contactSearch=true&frameset=full`;
                    break;
                case 'UserPreferences':
                    url = `${this.adamsUrl}/userPreferences.do?action=requestUserPreferencesForm&refresh=true`;
                    break;
                case 'WhereaboutsArea':
                    url = `${this.adamsUrl}/request${this.targetObject}.do?missionOrderId=${this.toId}&method=printWhereabouts&ownerType=ATHLETE&nonAthlete=false&startDate=${this.toStartDate}&endDate=${this.toEndDate}&viewDetails=2&${this.objectId}&frameset=none`;
                    break;
                default:
                    break;
            }

            this.openPageInClassic(this.newTab, url, event);
        }
    }

    private appendAbpAccessQueryParameter(url: string): string {
        if (!isNullOrBlank(this.abpAccess)) {
            return `${url + (url.includes('?') ? '&' : '?')}abpAccess=${this.abpAccess}`;
        }
        return url;
    }

    private openPageInClassic(newTab: boolean, url: string, event: Event): void {
        const classicUrl = this.appendFromNgQueryParameter(url);

        if (!newTab) {
            window.location.href = classicUrl;
        } else {
            window.open(classicUrl, 'classic', 'width=940,height=768');
        }
        event.preventDefault();
    }

    private appendFromNgQueryParameter(url: string): string {
        return `${url + (url.includes('?') ? '&' : '?')}fromNG=true`;
    }
}
