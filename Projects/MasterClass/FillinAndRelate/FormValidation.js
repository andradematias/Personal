let ErrorReporting = true;
let RunAll = false;
if (ControlName == null) {
    RunAll = true;
}
//Text Box that must be filled out
if (ControlName == 'SomeInformation' || RunAll) {
    if (VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('SomeInformation'), 'Blank') == false) {
        VV.Form.SetValidationErrorMessageOnField('SomeInformation', 'A value needs to be entered.');
        ErrorReporting = false;
    }
    else {
        VV.Form.ClearValidationErrorOnField('SomeInformation');
    }
}

if (ErrorReporting == false) {
    return false;
} else {
    return true;
}