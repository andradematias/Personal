var isFormValid = VV.Form.Template.FormValidation()

if (isFormValid) {
    VV.Form.DoAjaxFormSave().then(function () {

        //Reload RRC Billing Items from Bill Record
        window.opener.VV.Form.ReloadRepeatingRowControl('RRC Billing Items');

        VV.Form.HideLoadingPanel();

        VV.Form.Global.DisplayMessaging("Bill Line Item was saved.", "Bill Line Item")

    })
} else {
    VV.Form.Global.DisplayMessaging("Bill Line Item was not saved. Please, complete the required fields before saving.", "Bill Line Item")
}