import { AthleteActivePage } from '@athlete/models';

export function urlToActivePage(url: string): AthleteActivePage | null {
    const urlIdentifier = url.split('/').pop();
    if (urlIdentifier) {
        const urlIdentifierUpdated = urlIdentifier.includes('#')
            ? urlIdentifier.substring(0, urlIdentifier.indexOf('#'))
            : urlIdentifier;
        return urlIdentifierUpdated.toUpperCase() as AthleteActivePage;
    }
    return null;
}
