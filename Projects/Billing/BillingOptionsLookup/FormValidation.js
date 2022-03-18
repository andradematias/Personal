//pass in ControlName to validate a single item or nothing to validate everything.
var ErrorReporting = true;

var RunAll = false;
if (ControlName == null) {
    RunAll = true;
}

//Text Box that must be filled out
if (ControlName == 'Option Type' || RunAll) {
    if (VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('Option Type'), 'Blank') == false) {
        VV.Form.SetValidationErrorMessageOnField('Option Type', 'A value needs to be entered for the Option Type.');
        ErrorReporting = false;
    }
    else {
        VV.Form.ClearValidationErrorOnField('Option Type');
    }
}

if (ControlName == 'Start Date' || RunAll) {
    //if the Start Date is empty
    if (VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('Start Date'), 'Blank') == false) {
        VV.Form.SetValidationErrorMessageOnField('Start Date', 'Start Date has to be selected.')
        ErrorReporting = false;
    }
    //If the start date is not empty
    else {
        VV.Form.ClearValidationErrorOnField('Start Date');
        //if the End Date Date is not Empty 
        if (VV.Form.GetFieldValue('End Date')) {
            if (VV.Form.Global.CentralDateValidation(VV.Form.GetFieldValue('Start Date'), 'DateBefore', VV.Form.GetFieldValue('End Date'), 'D', 1) != true) {
                VV.Form.SetValidationErrorMessageOnField('Start Date', 'Start Date has to be selected being at least one day before End Date.')
                ErrorReporting = false;
            }
            else {
                VV.Form.ClearValidationErrorOnField('End Date')
                VV.Form.ClearValidationErrorOnField('Start Date');
            }
        }
    }
}
if (ControlName == 'End Date' || RunAll) {
    //if the End Date date is empty
    if (VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('End Date'), 'Blank') == false) {
        VV.Form.SetValidationErrorMessageOnField('End Date', 'End Date has to be selected.');
        ErrorReporting = false;
    } else {
        VV.Form.ClearValidationErrorOnField('End Date');
        //If Start Date is not Empty

        if (VV.Form.GetFieldValue('Start Date')) {
            if (VV.Form.Global.CentralDateValidation(VV.Form.GetFieldValue('End Date'), 'DateAfter', VV.Form.GetFieldValue('Start Date'), 'D', 1) != true) {
                VV.Form.SetValidationErrorMessageOnField('End Date', 'A date for End Date has to be selected being at least one day after Start Date.');
                ErrorReporting = false;
            }
            else {
                VV.Form.ClearValidationErrorOnField('Start Date')
                VV.Form.ClearValidationErrorOnField('End Date');
            }
        }
    }
}

if (ControlName == 'Status' || RunAll) {
    if (VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('Status').trim(), 'DDSelect') == false) {
        VV.Form.SetValidationErrorMessageOnField('Status', 'Please select a Status option from the dropdown list.');
        ErrorReporting = false;
    }
    else {
        VV.Form.ClearValidationErrorOnField('Status');
    }
}


if (VV.Form.GetFieldValue('Subscription Pack ID')) {
    if (ControlName == 'Amount' || RunAll) {
        if (VV.Form.Global.CentralNumericValidation(VV.Form.GetFieldValue('Amount'), 0, 'GreaterThanEqualTo') == false) {
            VV.Form.SetValidationErrorMessageOnField('Amount', 'A number needs to be entered for the Amount.');
            ErrorReporting = false;
        }

        else {
            VV.Form.ClearValidationErrorOnField('Amount');

        }
    }
    if (ControlName == 'Unit Type' || RunAll) {
        if (VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('Unit Type'), 'DDSelect') == false) {
            VV.Form.SetValidationErrorMessageOnField('Unit Type', 'Please select a Unit Type from the dropdown list.');
            ErrorReporting = false;
        }
        else {
            VV.Form.ClearValidationErrorOnField('Unit Type');
        }
    }
} else {
    if (VV.Form.Global.CentralNumericValidation(VV.Form.GetFieldValue('Amount'), 0, 'GreaterThanEqualTo') == false) {
        VV.Form.SetValidationErrorMessageOnField('Amount', 'A number needs to be entered for the Amount.');
        ErrorReporting = false;
    }
    else {
        VV.Form.ClearValidationErrorOnField('Amount');
    }
    if (ControlName == 'Unit Type' || RunAll) {
        if (VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('Unit Type'), 'DDSelect') == false) {
            VV.Form.SetValidationErrorMessageOnField('Unit Type', 'Please select a Unit Type from the dropdown list.');
            ErrorReporting = false;
        }
        else {
            VV.Form.ClearValidationErrorOnField('Unit Type');
        }
    }
}
return ErrorReporting;