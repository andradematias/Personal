//vvClient.forms.relateDocumentByDocId(formRevisionId, documentId)
//This function relates a document to a form record
//Give "formRevisionId" and "documentId" variables as input parameters.

//Add this variables in Configurable Variables
let formID = ""

let formRevisionId;  // to get the formRevisionId use the function "vvClient.forms.getForms"

let documentId;  // to get the documentId use the function "vvClient.documents.getDocuments"

//Add this variable in "Script Variables" 
const shortDescription = `Relate Document ${formID}`;

let relateDocumentResp = await vvClient.forms.relateDocumentByDocId(formRevisionId, documentId)
    .then((res) => parseRes(res))
    .then((res) => checkMetaAndStatus(res, shortDescription))




