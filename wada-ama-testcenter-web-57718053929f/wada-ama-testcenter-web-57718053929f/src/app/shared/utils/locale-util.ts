/* eslint-disable prettier/prettier */
const arabic = ['ar','ar-ye','ar-YE','ar-tn','ar-TN','ar-td','ar-TD','ar-sy','ar-SY','ar-ss',
'ar-SS','ar-so','ar-SO','ar-sd','ar-SD','ar-sa','ar-SA','ar-qa','ar-QA','ar-ps','ar-PS','ar-ps',
'ar-PS','ar-mr','ar-MR','ar-ma','ar-MA','ar-ly','ar-LY','ar-lb','ar-LB','ar-kw','ar-KW','ar-km',
'ar-KM','ar-jo','ar-JO','ar-iq','ar-IQ','ar-il','ar-IL','ar-er','ar-ER','ar-eh','ar-EH','ar-eg',
'ar-EG','ar-dz','ar-DZ','ar-dj','ar-DJ','ar-bh','ar-BH','ar-ae','ar-AE'
];

const farsi = ['fa-af','fa-AF','fa'];

const hebrew = ['he'];

const northenLuri = ['lrc-iq','lrc-IQ','lrc',];

const mazanderani = ['mzn'];

const punjabi = ['pa-arab', 'pa-Arab'];

const pashto = ['ps-pk','ps-PK','ps'];

const sudan = ['sd'];

const uyghur = ['ug'];

const urdu = ['ur-in','ur-IN', 'ur'];

const uzbek = ['uz-arab','uz-Arab'];

const yiddish = ['yi'];

const rightToLeftLocaleWritingDirection = [...arabic, ...farsi, ...hebrew, 
    ...northenLuri, ...mazanderani, ...punjabi, ...pashto, ...sudan, ...uyghur, 
    ...urdu, ...uzbek, ...yiddish];

export function getLocaleWritingDirection(locale: string): string {
    if(rightToLeftLocaleWritingDirection.find(rtlLocale => rtlLocale === locale))
        return 'rtl';    

    return 'ltr';
}
