//clears the fields: Subscription Pack ID and Billing Options Lookup ID if Select Item is selected

var fieldValue = VV.Form.GetFieldValue('Option Type');

if (fieldValue == 'Select Item') {
    VV.Form.SetFieldValue('Subscription Pack ID', '', true)
    VV.Form.SetFieldValue('Billing Options Lookup ID', '', true)
    VV.Form.SetFieldValue('Amount', 0, true)
    VV.Form.SetDropDownListIndex('Unit Type', -1);
}