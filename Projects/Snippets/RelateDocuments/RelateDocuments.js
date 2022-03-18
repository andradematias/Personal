//vvClient.forms.relateDocument(formRevisionId, documentId)
//This function relates a document to a form record
//Give "formRevisionId" and "documentId" variables as input parameters.

//Add this variables in Configurable Variables
const fileName = "TEST"

let formRevisionId = "";  // to get the formRevisionId use the function "vvClient.forms.getForms"

let documentId = "";  // to get the documentId use the function "vvClient.documents.getDocuments"

//Add this variable in "Script Variables" 
const shortDescription = `Relate document ${fileName}`;

//Add the following code in "Main code" "MAIN CODE"
// to get the documentId use the function "vvClient.documents.getDocuments"
const getDocumentsParams = {
    q: `[parameter or index field] eq 'Value'`,
    indexFields: 'include'
};

const getDocResult = await vvClient.documents.getDocuments(getDocumentsParams)
    .then((res) => parseRes(res))
    .then((res) => checkMetaAndStatus(res, shortDescription))
    .then((res) => checkDataPropertyExists(res, shortDescription))
    .then((res) => checkDataIsNotEmpty(res, shortDescription));

//Example to get the GUID of a document
documentId = getDocResult.data[0].id

// 2) Get the "formRevisionId"
const templateName = `Test Form`;

const formID = "Test Form-000002";

const getFormsParams = {
    q: `[instanceName] eq '${formID}'`,
    expand: true
};

const getFormsRes = await vvClient.forms
    .getForms(getFormsParams, templateName)
    .then((res) => parseRes(res))
    .then((res) => checkMetaAndStatus(res, shortDescription))
    .then((res) => checkDataPropertyExists(res, shortDescription))
    .then((res) => checkDataIsNotEmpty(res, shortDescription));

formRevisionId = getFormsRes.data[0].revisionId;

//The document is related to the form
const relateDocumentResp = await vvClient.forms.relateDocument(formRevisionId, documentId)
    .then((res) => parseRes(res))
    .then((res) => checkMetaAndStatus(res, shortDescription))





