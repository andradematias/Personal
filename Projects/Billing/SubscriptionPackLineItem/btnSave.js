var change = VV.Form.UnsavedChanges;

if (VV.Form.Template.FormValidation() === true || change > 0) {
    //Confirmation function
    var messageData = 'The record has been saved.';
    var title = 'Save Form';

    VV.Form.DoAjaxFormSave().then(function () {
        //Reload RRC Subscription Pack Form
        window.opener.VV.Form.ReloadRepeatingRowControl('RRCPackItems');
        VV.Form.HideLoadingPanel();
        VV.Form.Global.DisplayMessaging(messageData, title);
    });
} else {
    VV.Form.Global.DisplayMessaging(
        'All of the fields have not been filled in completely. Highlight your mouse over the red icon to see how you can resolve the error stopping you from saving this form.',
        'Subscription Pack Line Item'
    );
}