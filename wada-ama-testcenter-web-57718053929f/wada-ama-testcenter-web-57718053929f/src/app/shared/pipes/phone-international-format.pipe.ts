import { Pipe, PipeTransform } from '@angular/core';
import { PhoneNumber, PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';
import { isNullOrBlank } from '@shared/utils';
import { TranslationMap, TranslationService } from '@core/services';
import { map } from 'rxjs/operators';
import { ErrorMessageKeyEnums, Phone } from '@shared/models';

/*
 * Pipe to format a phone into his international format
 * Usage: 'phone'
 * Returns: 'international-phone-in-string'
 */
@Pipe({
    name: 'phoneInternationalFormat',
})
export class PhoneInternationalFormatPipe implements PipeTransform {
    translations$ = this.translationService.translations$;

    constructor(private translationService: TranslationService) {}

    transform(phone: Phone): string {
        if (!phone) return '';
        const phoneUtil: PhoneNumberUtil = PhoneNumberUtil.getInstance();
        const extension = phone.extension ? `#${phone.extension}` : '';
        try {
            const shortCode = phone.country?.telephoneCountryCode
                ? phoneUtil.getRegionCodeForCountryCode(Number(phone.country?.telephoneCountryCode))
                : '';
            if (isNullOrBlank(shortCode)) {
                return `${phone.toString()} ${extension}`;
            }
            const phoneNumber: PhoneNumber = phoneUtil.parseAndKeepRawInput(phone.toString(), shortCode);
            return `${phoneUtil.format(phoneNumber, PhoneNumberFormat.INTERNATIONAL)} ${extension}`;
        } catch (e) {
            let errorMsg = '';
            this.translations$
                .pipe(
                    map(
                        (translations: TranslationMap) =>
                            translations[
                                this.translationService.getErrorMessageKey(
                                    ErrorMessageKeyEnums.getValue('INVALID_PHONE_NUMBER')?.toString() || ''
                                )
                            ]
                    )
                )
                .subscribe((err) => {
                    errorMsg = err.toString();
                });
            return errorMsg;
        }
    }
}
