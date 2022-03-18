
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

if (ControlName == 'Date of the incident' || RunAll) {
    if (VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('Date of the incident'), 'Blank') == false) {
        VV.Form.SetValidationErrorMessageOnField('Date of the incident', 'A value is needed for the Date of the incident.');
        ErrorReporting = false;
    }
    else {
        VV.Form.ClearValidationErrorOnField('Date of the incident');
    }
}

if (ControlName == 'Incident location' || RunAll) {
    if (VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('Incident location'), 'Blank') == false) {
        VV.Form.SetValidationErrorMessageOnField('Incident location', 'A value needs to be entered for the Incident location.');
        ErrorReporting = false;
    }
    else {
        VV.Form.ClearValidationErrorOnField('Incident location');
    }
}

if (ControlName == 'Complaint details' || RunAll) {
    if (VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('Complaint details'), 'Blank') == false) {
        VV.Form.SetValidationErrorMessageOnField('Complaint details', 'A value needs to be entered for the Complaint details.');
        ErrorReporting = false;
    }
    else {
        VV.Form.ClearValidationErrorOnField('Complaint details');
    }
}


if (ErrorReporting == false) {
    return false;
} else {
    return true;
}