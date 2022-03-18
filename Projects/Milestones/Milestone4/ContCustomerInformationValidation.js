
//pass in ControlName to validate a single item or nothing to validate everything.
var ErrorReporting = true;
var RunAll = false;
if (ControlName == null) {
    RunAll = true;
}

if (ControlName == 'Date of complaint' || RunAll) {
    if (VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('Date of complaint'), 'Blank') == false) {
        VV.Form.SetValidationErrorMessageOnField('Date of complaint', 'A value is needed for the Date of complaint.');
        ErrorReporting = false;
    }
    else {
        VV.Form.ClearValidationErrorOnField('Date of complaint');
    }
}

if (ControlName == 'Name' || RunAll) {
    if (VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('Name'), 'Blank') == false) {
        VV.Form.SetValidationErrorMessageOnField('Name', 'A value needs to be entered for the Name.');
        ErrorReporting = false;
    }
    else {
        VV.Form.ClearValidationErrorOnField('Name');
    }
}

if (ControlName == 'Email' || RunAll) {
    if (VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('Email'), 'Blank') == false) {
        VV.Form.SetValidationErrorMessageOnField('Email', 'A value needs to be entered for the Email.');
        ErrorReporting = false;
    }
    else {
        VV.Form.ClearValidationErrorOnField('Email');
    }
}

if (ControlName == 'Address' || RunAll) {
    if (VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('Address'), 'Blank') == false) {
        VV.Form.SetValidationErrorMessageOnField('Address', 'A value needs to be entered for the Address.');
        ErrorReporting = false;
    }
    else {
        VV.Form.ClearValidationErrorOnField('Address');
    }
}

if (ErrorReporting == false) {
    return false;
} else {
    return true;
}