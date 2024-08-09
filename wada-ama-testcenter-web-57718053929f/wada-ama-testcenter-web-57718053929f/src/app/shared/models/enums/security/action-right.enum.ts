export enum DCFActionRight {
    BindTestingOrder = 'BIND_TO',
    Cancel = 'CANCEL',
    CreateChainOfCustody = 'CREATE_CHAIN_OF_CUSTODY',
    Delete = 'DELETE',
    Download = 'DOWNLOAD',
    DownloadABPReportForm = 'DOWNLOAD_ABP_REPORT_FORM',
    Edit = 'EDIT',
    EditMatchingResult = 'EDIT_MATCHING_RESULT',
    ViewMatchingResult = 'VIEW_MATCHING_RESULT',
    ViewBPLabResult = 'VIEW_BP_LAB_RESULT',
    ViewChainOfCustody = 'VIEW_CHAIN_OF_CUSTODY',
    ViewLabResult = 'VIEW_LAB_RESULT',
}

export enum TOActionRight {
    BindAthlete = 'BIND_ATHLETE',
    Cancel = 'CANCEL',
    CancelTest = 'CANCEL_TEST',
    CheckWhereabouts = 'CHECK_WHEREABOUTS',
    CloseTest = 'CLOSE_TEST',
    Complete = 'COMPLETE',
    Copy = 'COPY',
    CreateAthlete = 'CREATE_ATHLETE',
    CreateDCF = 'CREATE_DCF',
    CreateUA = 'CREATE_UA',
    Delete = 'DELETE',
    Edit = 'EDIT',
    EditAnalyses = 'EDIT_ANALYSES',
    EditDopingControlPersonnel = 'EDIT_DOPING_CONTROL_PERSONNEL',
    EditTests = 'EDIT_TESTS',
    EditTestParticipants = 'EDIT_TEST_PARTICIPANTS',
    Issue = 'ISSUE',
    MoveAthlete = 'MOVE_ATHLETE',
    DownloadAuthorization = 'DOWNLOAD_AUTHORIZATION',
    DownloadLaboratoryRequestForm = 'DOWNLOAD_LABORATORY_REQUEST_FORM',
    DownloadInstructions = 'DOWNLOAD_INSTRUCTIONS',
    DownloadDcoReport = 'DOWNLOAD_DCO_REPORT',
    DownloadTO = 'DOWNLOAD_TO',
    ViewLabResults = 'VIEW_LAB_RESULTS',
    ViewUA = 'VIEW_UA',
}

export enum UAActionRight {
    Edit = 'EDIT_UA',
    Delete = 'DELETE_UA',
}