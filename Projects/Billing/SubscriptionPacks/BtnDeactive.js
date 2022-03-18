//btn Deactive
var isFormValid = VV.Form.Template.FormValidation()
var messageData = 'The Subscription Pack has been saved.';
var title = 'Subscription Packs';

if (isFormValid) {
    //Confirmation function

    var okfunction = function () {
        VV.Form.ShowLoadingPanel();

        // Set the status to be ‘Disabled’
        VV.Form.SetFieldValue('Status', 'Inactive', true);

        VV.Form.DoAjaxFormSave().then(function () {
            VV.Form.HideLoadingPanel();
            VV.Form.Global.DisplayMessaging(messageData, title);
        });
    };

    var cancelfunction = function () {
        return;
    }

    VV.Form.Global.DisplayConfirmMessaging('You have indicated that you want to deactivate the Subscription Pack. Select OK to continue or Cancel if you are not yet ready', title, okfunction, cancelfunction);

}
else {
    VV.Form.ShowLoadingPanel();
    VV.Form.HideLoadingPanel()
    VV.Form.Global.DisplayMessaging(
        'The Subscription Pack was not saved. Please, complete the required fields before saving.', title
    );
}