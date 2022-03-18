//vvClient.forms.getFormTemplates(getFormsTemplateParams)

//This function returns all the data from one or more form templates

//Give "getFormsTemplateParams" object as input parameter. 
//This object has as variables:
//q: Form template search filter
//expand: True to get all the form's fields
//fields: 'id,name' (for example To get only the fields 'id' and 'name')


//Add this variables in Configurable Variables
const templateName = "Affirmation Template";

//Add this variable in "Script Variables" 
const shortDescription = `Get form Template ${templateName}`;

let getFormsTemplateParams = {
    q: `[name] eq '${templateName}'`,
    expand: true
};

const getFormsTemplateRes = await vvClient.forms
    .getFormTemplates(getFormsTemplateParams)
    .then((res) => parseRes(res))
    .then((res) => checkMetaAndStatus(res, shortDescription))
    .then((res) => checkDataPropertyExists(res, shortDescription))
    .then((res) => checkDataIsNotEmpty(res, shortDescription));

//Get revisionId as an example
let templateID = getFormsTemplateRes.data[0].revisionId;
