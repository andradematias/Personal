
var isFormValid = VV.Form.Template.FormValidation()

VV.Form.ShowLoadingPanel();

if (isFormValid) {
  VV.Form.DoAjaxFormSave().then(function () {
    VV.Form.Global.DisplayMessaging("Billing Option Lookup was saved.", "Billing Option Lookup");
    VV.Form.HideLoadingPanel();
  });
} else {
  VV.Form.Global.DisplayMessaging("Billing Option Lookup was not saved. Please, complete the required fields before saving.", "Billing Option Lookup");
  VV.Form.HideLoadingPanel();
}

