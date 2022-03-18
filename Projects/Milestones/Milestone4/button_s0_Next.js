var isFormValid = VV.Form.Template.ContCustomerInformationValidation()

if (isFormValid) {
    VV.Form.SetFieldValue('Stage', 1);
} else {
    VV.Form.Global.DisplayMessaging("Please complete the required fields before continuing.", "CUSTOMER COMPLAINT FORM")
}