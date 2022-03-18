
var stage0 = VV.Form.Template.ContCustomerInformationValidation()
var stage1 = VV.Form.Template.ContComplaintInformationValidaion()


VV.Form.ShowLoadingPanel();

if (stage0 && stage1) {
    VV.Form.DoAjaxFormSave().then(function () {
        VV.Form.Global.DisplayMessaging("Form was saved.", "CUSTOMER COMPLAINT FORM");
        VV.Form.HideLoadingPanel();
    });
} else {
    VV.Form.Global.DisplayMessaging("Form was not saved. Please, complete the required fields before saving.", "CUSTOMER COMPLAINT FORM");
    VV.Form.HideLoadingPanel();
}