//Template GUID goes here
const templateId = '40dadfca-b03d-ed11-8214-d297d0791575'

//Form fields go here
const SomeInformation = VV.Form.GetFieldValue('SomeInformation');
const FatherID = VV.Form.GetFieldValue('FatherID');
const isSaved = VV.Form.IsFormSaved;

//Do ajax save before opening new form to keep this current form on the tab it's on.
const results = VV.Form.Template.FormValidation();

if (results) {
    if (!isSaved) {
        VV.Form.DoAjaxFormSave().then(function () {
            buildFieldMappings();
        })
    } else {
        buildFieldMappings()
    }
} else {
    setTimeout(function () {
        VV.Form.Global.ValidationLoadModal('btnSave')
    }, 100);
}

function buildFieldMappings() {
    //Field mappings
    let fieldMappings = [
        {
            sourceFieldName: 'FatherID',
            sourceFieldValue: FatherID,
            targetFieldName: 'FatherID Target'
        },
        {
            sourceFieldName: 'SomeInformation',
            sourceFieldValue: SomeInformation,
            targetFieldName: 'Father Information Target'
        }
    ];

    VV.Form.Global.FillinAndRelateForm(templateId, fieldMappings);
}