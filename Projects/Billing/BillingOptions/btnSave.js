
var isFormValid = VV.Form.Template.FormValidation()
var summaryValue;
var optionTypeValue = VV.Form.GetFieldValue('Option Type');
var unitTypeValue = VV.Form.GetFieldValue('Unit Type');
var amountValue = VV.Form.GetFieldValue('Amount');

VV.Form.ShowLoadingPanel();

if (isFormValid) {
  summaryValue = optionTypeValue + ' - ' + unitTypeValue + ' - Amount: ' + amountValue;
  VV.Form.SetFieldValue('Summary', summaryValue);
  VV.Form.Template.callToBillingOptionSave();
} else {
  VV.Form.Global.DisplayMessaging("Billing Option was not saved. Please, complete the required fields before saving.", "Billing Option")
  VV.Form.HideLoadingPanel();
}