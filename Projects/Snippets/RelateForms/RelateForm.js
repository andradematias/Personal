//vvClient.forms.relateForm(currentFormRevisionId, childFormRevisionId)
//This function relates two form records of different forms templates.
//Get as parameter:
//currentFormRevisionId: The "formRevisionId" from the current form
//childFormRevisionId: The "formRevisionId" of the child form

//Add this variables in Configurable Variables

let currentFormRevisionId; // To get the formRevisionId use the function "vvClient.forms.getForms"
let childFormRevisionId;

//Add this variable in "Script Variables" 
const shortDescription = `Relate Forms`;

const relatePromise = await vvClient.forms.relateForm(currentFormRevisionId, childFormRevisionId)
    .then((res) => parseRes(res))
    .then((res) => checkMetaAndStatus(res, shortDescription));
