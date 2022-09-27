
VV.Form.DoAjaxFormSave().then(function () {
    window.opener.VV.Form.ReloadRepeatingRowControl('RRCChildForms');
    VV.Form.Global.MessageModal(false, 'Record Saved', "The record has been saved. The window will now close.", false, true, 'Ok', VV.Form.Global.CloseWindowNoModal)
});