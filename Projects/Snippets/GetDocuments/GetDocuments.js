//vvClient.documents.getDocuments(getDocumentsParams)
//This snippet returns all the parameters of a document
//Give "getDocumentsParams" object as an input parameter.
//The "getDocumentsParams" object is made up of "q" and "indexFields":
//  q: Contains the Query that allows filtering the documents obtained
//  indexFields: If it receives the value of "include" it will add the values of the index fiels to the result obtained

//Locate this variable in "Script Variables" 
const shortDescription = `Get Documents`;

let getDocumentsParams = {
    q: `[parameter or index field] eq 'Value'`,
    indexFields: 'include'
};

var getDocResult = await vvClient.documents.getDocuments(getDocumentsParams)
    .then((res) => parseRes(res))
    .then((res) => checkMetaAndStatus(res, shortDescription))
    .then((res) => checkDataPropertyExists(res, shortDescription))
    .then((res) => checkDataIsNotEmpty(res, shortDescription));

//Example to get the GUID of a document
let documentId = getDocResult.data[0].id
