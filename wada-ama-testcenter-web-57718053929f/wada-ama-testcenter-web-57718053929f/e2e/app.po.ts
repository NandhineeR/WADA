/* eslint-disable */
import { browser, by, element, promise } from 'protractor';

export class AppPage {
    navigateTo(): promise.Promise<any> {
        return browser.get('/');
    }

    getParagraphText(): promise.Promise<string> {
        return element(by.css('ui-root h1')).getText();
    }
}
