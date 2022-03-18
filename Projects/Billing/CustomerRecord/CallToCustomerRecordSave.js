//Add Customer Record
var VV;
var CallServerSide = function () {
    VV.Form.HideLoadingPanel();
    //This gets all of the form fields.
    var formData = VV.Form.getFormDataCollection();

    var FormInfo = {};
    FormInfo.name = 'REVISIONID';
    FormInfo.value = VV.Form.DataID;
    formData.push(FormInfo);

    //Following will prepare the collection and send with call to server side script.
    var data = JSON.stringify(formData);
    var requestObject = $.ajax({
        type: "POST",
        url: VV.BaseAppUrl + 'api/v1/' + VV.CustomerAlias + '/' + VV.CustomerDatabaseAlias + '/scripts?name=CustomerRecordSave',
        contentType: "application/json; charset=utf-8",
        data: data,
        success: '',
        error: ''
    });

    return requestObject;
};

$.when(
    CallServerSide()
).always(function (resp) {
    var messageData = '';
    if (typeof (resp.status) != 'undefined') {
        messageData = "A status code of " + resp.status + " returned from the server.  There is a communication problem with the web servers.  If this continues, please contact the administrator and communicate to them this message and where it occurred.";
        VV.Form.HideLoadingPanel();
        VV.Form.Global.DisplayMessaging(messageData, "Error");
    }
    else if (typeof (resp.statusCode) != 'undefined') {
        messageData = "A status code of " + resp.statusCode + " with a message of '" + resp.errorMessages[0].message + "' returned from the server.  This may mean that the servers to run the business logic are not available.";
        VV.Form.HideLoadingPanel();
        VV.Form.Global.DisplayMessaging(messageData, "Error");
    }
    else if (resp.meta.status == '200') {
        if (resp.data[0] != undefined) {
            if (resp.data[0] == 'Success') {

                if (resp.data[2] == 'Unique') {
                    // VV.Form.ShowLoadingPanel();

                    VV.Form.DoAjaxFormSave().then(function (resp) {
                        window.opener.VV.Form.ReloadRepeatingRowControl('RRC_CustomerList')

                        VV.Form.HideLoadingPanel();

                        VV.Form.Global.DisplayMessaging('Customer Record has been saved successfully.', "Success");
                    })
                }

                else if (resp.data[2] == 'Unique Matched') {
                    VV.Form.DoAjaxFormSave().then(function (resp) {
                        VV.Form.HideLoadingPanel();

                        VV.Form.Global.DisplayMessaging('Customer Record has been saved successfully.', "Success");
                    })

                }
                else if (resp.data[1] == 'Not Unique') {
                    VV.Form.HideLoadingPanel();
                    VV.Form.Global.DisplayMessaging(resp.data[2], "Customer Record");
                }


            }
            else if (resp.data[0] == 'Error') {
                messageData = 'An error was encountered. ' + resp.data[1];
                VV.Form.HideLoadingPanel();
                VV.Form.Global.DisplayMessaging(messageData, "Error");
            }
            else {
                messageData = 'An unhandled response occurred when calling CustomerRecordSave. The form will not save at this time.  Please try again or communicate this issue to support.';
                VV.Form.HideLoadingPanel();
                VV.Form.Global.DisplayMessaging(messageData, "Error");
            }
        }
        else {
            messageData = 'The status of the response returned as undefined.';
            VV.Form.HideLoadingPanel();
            VV.Form.Global.DisplayMessaging(messageData, "Error");
        }
    }
    else {
        messageData = "The following unhandled response occurred while attempting to retrieve data on the the server side get data logic." + resp.data.error + '<br>';
        VV.Form.HideLoadingPanel();
        VV.Form.Global.DisplayMessaging(messageData, "Error");
    }
}

);