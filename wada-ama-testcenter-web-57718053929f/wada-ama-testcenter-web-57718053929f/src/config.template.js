/* eslint-disable no-undef */
window.clientConfig = {
    clientApiBaseUrl: `${CAPI_BASE_URL}`,
    adamsUrl: `${ADAMS_URL}`,
    sampleManagementUrl: `${SAMPLE_MANAGEMENT_URL}`,
    sampleManagementLink: `${SAMPLE_MANAGEMENT_LINK}`,
    supportedLanguages: `${SUPPORTED_LANGUAGES}`,
    localeCookieExpirationInDays: parseInt(`${LOCALE_COOKIE_EXPIRATION_IN_DAYS}`, 10),
    apm: {
        enabled: `${ENABLE_APM_AGENT}` === 'true',
        serverUrl: `${APM_SERVER_URL}`,
        environment: `${ELASTIC_APM_ENVIRONMENT}`,
    },
};
