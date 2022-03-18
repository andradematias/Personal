// CallToBillRecordSave template function
//this function contains ajax call to node.js webservice called BillRecordSave
var Process = function () {
    VV.Form.ShowLoadingPanel();
    //This gets all of the form fields.
    var formData = VV.Form.getFormDataCollection();

    var FormInfo = {
        name: 'Revision ID',
        value: VV.Form.DataID
    };
    formData.push(FormInfo);

    //Following will prepare the collection and send with call to server side script.
    var data = JSON.stringify(formData);
    var requestObject = $.ajax({
        type: "POST",
        url: VV.BaseAppUrl + 'api/v1/' + VV.CustomerAlias + '/' + VV.CustomerDatabaseAlias + '/scripts?name=BillRecordSave',
        contentType: "application/json; charset=utf-8",
        data: data,
        success: '',
        error: ''
    });

    return requestObject;
};

VV.Form.ShowLoadingPanel();

$.when(
    Process()
).always(function (resp) {
    VV.Form.HideLoadingPanel();
    var messageData = '';
    if (typeof (resp.status) != 'undefined') {
        messageData = "A status code of " + resp.status + " returned from the server.  There is a communication problem with the  web servers.  If this continues, please contact the administrator and communicate to them this message and where it occured.";
        VV.Form.Global.DisplayMessaging(messageData);
    } else if (typeof (resp.statusCode) != 'undefined') {
        messageData = "A status code of " + resp.statusCode + " with a message of '" + resp.errorMessages[0].message + "' returned from the server.  This may mean that the servers to run the business logic are not available.";
        VV.Form.Global.DisplayMessaging(messageData);
    }
    else if (resp.meta.status == '200') {
        if (resp.data[0] != 'undefined') {
            if (resp.data[0] == 'Success') {
                VV.Form.HideLoadingPanel();
                VV.Form.SetFieldValue('LastSavingTime', new Date(), true);
                VV.Form.DoAjaxFormSave().then(function () {
                    VV.Form.Global.DisplayMessaging('Bill Record has been saved successfully.', 'Bill Record');
                })
            }
            else if (resp.data[0] == 'Duplicated') {
                VV.Form.HideLoadingPanel();
                VV.Form.Global.DisplayMessaging(resp.data[1], 'Bill Record');
            }
            else if (resp.data[0] == 'Error') {
                VV.Form.HideLoadingPanel();
                VV.Form.Global.DisplayMessaging(resp.data[1], 'Bill Record Error');
            } else {
                messageData = 'An unhandled response occurred from the unique record checking mechanism.  The form will not save at this time.  Please try again or communicate this issue to support.';
                VV.Form.HideLoadingPanel();
                VV.Form.Global.DisplayMessaging(messageData);
            }
        } else {
            messageData = 'The status of the response returned as undefined.';
            VV.Form.HideLoadingPanel();
            VV.Form.Global.DisplayMessaging(messageData);
        }
    } else {
        messageData = resp.data.error + '<br>';
        VV.Form.HideLoadingPanel();
        VV.Form.Global.DisplayMessaging(messageData);
    }
});