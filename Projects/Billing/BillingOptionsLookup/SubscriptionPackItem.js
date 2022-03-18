//clears the fields: Subscription Pack ID if Select Item is selected


var fieldValue = VV.Form.GetFieldValue('Subscription Pack');

if (fieldValue == 'Select Item') {
    VV.Form.SetFieldValue('Subscription Pack ID', '', true)
}