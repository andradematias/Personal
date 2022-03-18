//FormValidation for the Gambler Record

//pass in ControlName to validate a single item or nothing to validate everything.
var ErrorReporting = true;
var RunAll = false;
if (ControlName == null) {
    RunAll = true;
}

if (ControlName == 'Customer Name' || RunAll) {
    if (VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('Customer Name'), 'Blank') == false) {
        VV.Form.SetValidationErrorMessageOnField('Customer Name', 'A value needs to be entered for the Customer Name.');
        ErrorReporting = false;
    }
    else {
        VV.Form.ClearValidationErrorOnField('Customer Name');
    }
}

if (ControlName == 'Customer Type' || RunAll) {
    if (VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('Customer Type').trim(), 'DDSelect') == false) {
        VV.Form.SetValidationErrorMessageOnField('Customer Type', 'A value needs to be entered for the Customer Type.');
        ErrorReporting = false;
    }
    else {
        VV.Form.ClearValidationErrorOnField('Customer Type');
    }
}

if (ControlName == 'Month of Bill' || RunAll) {
    if (VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('Month of Bill'), 'Blank') == false) {
        VV.Form.SetValidationErrorMessageOnField('Month of Bill', 'A value is needed for the Month of Bill.');
        ErrorReporting = false;
    }
    else {
        VV.Form.ClearValidationErrorOnField('Month of Bill');
    }
}

if (ErrorReporting == false) {
    return false;
} else {
    return true;
}