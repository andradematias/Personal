var isFormValid = VV.Form.Template.ContComplaintInformationValidaion()

if (isFormValid) {
    VV.Form.SetFieldValue("Stage", 2);
} else {
    VV.Form.Global.DisplayMessaging("Please complete the required fields before continuing.", "CUSTOMER COMPLAINT FORM")
}