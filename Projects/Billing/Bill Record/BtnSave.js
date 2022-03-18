var isFormValid = VV.Form.Template.FormValidation()

if (isFormValid) {
    //Confirmation function
    VV.Form.Template.CallToBillRecordSave();
} else {
    VV.Form.ShowLoadingPanel();
    VV.Form.HideLoadingPanel();
    VV.Form.Global.DisplayMessaging("Bill Record was not saved. Please, complete the required fields before saving.", "Bill Record");
}