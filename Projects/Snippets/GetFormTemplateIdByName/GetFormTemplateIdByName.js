//vvClient.forms.getFormTemplateIdByName(templateName)
//This web service returns the ID of a form template.
//receives the variable "templateName" 



//Add this variables in Configurable Variables
const templateName = "Template Name";

//Add this variable in "Script Variables" 
const shortDescription = `Get form Template ${templateName}`;


let getTemplateId = await vvClient.forms.getFormTemplateIdByName(templateName)
    .then((res) => parseRes(res))

if (!getTemplateId) { throw new Error(`Unable to find template name ${templateName} in the system.`) }

const templateID = getTemplateId.templateIdGuid;
