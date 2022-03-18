var messageData = 'You have indicated that you want to activate a Billing Option. Select OK to continue or Cancel if you are not yet ready.';
var title = 'Activate Billing Option';
var selectRRC = VV.Form.Global.RRCGetSelectedItemsFormIDs('RRC_BillingOptions');

// Data for calling DisplayConfirmMessaging asking for confirmation

function okFunction() {
    VV.Form.ShowLoadingPanel();
    //Call the fill in global script
    VV.Form.Template.CallTo_BillingOptionActiveInactive("Enabled");
    VV.Form.HideLoadingPanel();
}

function cancelFunction() {
    return;
}

if (selectRRC.length > 0) {
    VV.Form.Global.DisplayConfirmMessaging(messageData, title, okFunction, cancelFunction);
} else {
    VV.Form.Global.DisplayMessaging('Please, select a Billing Option in the Row Control to activate.', 'Customer Record');
}