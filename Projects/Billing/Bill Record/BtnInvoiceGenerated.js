//btn Invoice Generated

var isFormValid = VV.Form.Template.FormValidation()
var messageData = 'The record has been saved.';
var title = 'Generate invoice';

if (isFormValid) {
    //Confirmation function

    var okfunction = function () {
        VV.Form.ShowLoadingPanel();

        // Set the status to be ‘Disabled’
        VV.Form.SetFieldValue('Status', 'Invoice Generated', true);

        VV.Form.DoAjaxFormSave().then(function () {
            VV.Form.HideLoadingPanel();
            VV.Form.Global.DisplayMessaging(messageData, title);
        });
    };

    var cancelfunction = function () {
        return;
    }

    VV.Form.Global.DisplayConfirmMessaging('Is this invoice record ready to be marked as a generated invoice?', title, okfunction, cancelfunction);

}
else {
    VV.Form.ShowLoadingPanel();
    VV.Form.HideLoadingPanel()
    VV.Form.Global.DisplayMessaging(
        'The Bill Record was not saved. Please, complete the required fields before saving.', title
    );
}