//Father / Template Form
var title = 'Bill Record';
var fields = [
    {
        sourceFieldName: "Bill ID",
        sourceFieldValue: VV.Form.GetFieldValue("Bill ID"),
        targetFieldName: "Bill ID",
    },
];
var GUID = "c1e78954-044e-ec11-a9d3-e4a99b52c98f";
var isValid = VV.Form.Template.FormValidation()

if (isValid) {
    //Confirmation function

    var okFunction = function () {
        VV.Form.ShowLoadingPanel();

        //Relate fields with Subscription Pack Line Item Form
        VV.Form.Global.FillinAndRelateForm(GUID, fields);

        VV.Form.HideLoadingPanel();

    };

    VV.Form.Global.DisplayConfirmMessaging("You have indicated that you want to add a Line Item. Be aware that Line Items are added automatically according the Customer's monthly usage of our services. Select OK to continue or Cancel if you are not ready yet.", title, okFunction, cancelFunction);
} else {
    VV.Form.ShowLoadingPanel();
    VV.Form.HideLoadingPanel();
    VV.Form.Global.DisplayMessaging("All required fields have not been filled in completely. Highlight your mouse over the red icon to see how you can resolve the error.", "Bill Record");
}

var cancelFunction = function () {
    return;
}

