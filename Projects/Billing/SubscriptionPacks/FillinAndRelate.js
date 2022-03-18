//FillinAndRelate RRC


var isFormValid = VV.Form.Template.FormValidation();
var title = 'Subscription Pack';
var fields = [
    {
        sourceFieldName: 'Pack Type',
        sourceFieldValue: VV.Form.GetFieldValue('Pack Type'),
        targetFieldName: 'Pack Type',
    },
    {
        sourceFieldName: 'Subscription Pack ID',
        sourceFieldValue: VV.Form.GetFieldValue('Subscription Pack ID'),
        targetFieldName: 'Subscription Pack ID',
    },
];

var GUID = 'a6ac835e-5954-ec11-a9d3-e4a99b52c98f';

function okFunction() {
    VV.Form.ShowLoadingPanel();
    //Call the fill in global script
    VV.Form.DoAjaxFormSave().then(function () {
        VV.Form.HideLoadingPanel();
        VV.Form.Global.FillinAndRelateForm(GUID, fields);
    });
}

var cancelfunction = function () {
    return;
};

if (isFormValid) {
    //Confirmation function
    VV.Form.Global.DisplayConfirmMessaging(
        'You have indicated that you want to add a Subscription Pack Line Item. Select OK to continue or Cancel if you are not yet ready.',
        title,
        okFunction,
        cancelfunction
    );
} else {
    VV.Form.Global.DisplayMessaging(
        'All of the fields have not been filled in completely. Highlight your mouse over the red icon to see how you can resolve the error stopping you from saving this form.',
        title
    );
}