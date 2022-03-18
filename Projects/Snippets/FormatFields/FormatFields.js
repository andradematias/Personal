//vvClient.forms.getFormTemplateIdByName(templateName)
//This web service returns the ID of a form template.
//receives the variable "templateName" 



//This code should be added to the blur event of a field you want to format
//Phone, Zip, SSN, FEIN

/*
1. Replace FieldName with the name of the phone number, zip code, social security number, or FEIN field. Leave the apostrophes.
2. Replace VV.Form.Global.FormatREPLACE with one of the functions below:
    VV.Form.Global.FormatFEIN
    VV.Form.Global.FormatPhone
    VV.Form.Global.FormatSSN
    VV.Form.Global.FormatZipCode
3. In the Script Editor of a VisualVault template, find the Form Field Control you wish to format and validate.
4. Click the Blur event of the field. Place your cursor in the large text box under the word "function."
5. Paste this code into the text box.
6. Save!
*/

var enteredValue = VV.Form.GetFieldValue('FieldName');
var formattedVal = VV.Form.Global.FormatREPLACE(enteredValue);

if (formattedVal != enteredValue) {
    VV.Form.SetFieldValue('FieldName', formattedVal)
        .then(function () {
            VV.Form.Template.FormValidation('FieldName');
        })
}
else {
    VV.Form.Template.FormValidation('FieldName');
}

var enteredValue = VV.Form.GetFieldValue('Phone');
var formattedVal = VV.Form.Global.FormatPhone(enteredValue);

if (formattedVal != enteredValue) {
    VV.Form.SetFieldValue('Phone', formattedVal)
        .then(function () {
            VV.Form.Template.FormValidation('Phone');
        })
}
else {
    VV.Form.Template.FormValidation('Phone');
}


if (VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('Phone Number'), 'Phone') == false) {
    VV.Form.SetValidationErrorMessageOnField('Phone Number', 'When a phone number is entered, it must be 10 digits, all numbers, and formatted (xxx) xxx-xxxx. The local prefix cannot start with a 0 or 1.');
    ErrorReporting = false;
} else {
    VV.Form.ClearValidationErrorOnField('Phone Number');
}
