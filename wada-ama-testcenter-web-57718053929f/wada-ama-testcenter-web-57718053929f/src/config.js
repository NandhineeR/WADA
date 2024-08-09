// eslint-disable-next-line no-undef
window.clientConfig = {
    clientApiBaseUrl: 'https://wada.wsl.host:9443/tc-api',
    adamsUrl: 'http://wada.win.host:8080/adams/',
    sampleManagementUrl: 'https://wada.wsl.host:9443/sm',
    sampleManagementLink: 'https://wada.win.host:8086/link',
    supportedLanguages: 'am,ar,az,bg,cs,de,en,es,et,fa_IR,fi,fr,hu,it,ja,ko,lv,nl_BE,nl,om,pl,pt_BR,pt,ro,ru,sk,sr,sw,ti,tr,uk_UA,zh,zh_TW',
    localeCookieExpirationInDays: 100,
    apm: {
        enabled: false,
        serverUrl: 'http://localhost:8200',
        environment: 'dev',
    },
};
