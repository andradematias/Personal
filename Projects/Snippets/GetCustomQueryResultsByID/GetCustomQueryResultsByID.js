// vvClient.customQuery.getCustomQueryResultsByName(queryName, filterObj)
// The queryName is a variable with the name of the query.
// The filterObj is an object, with a "filter" attribute and the query condition is stored within it. 

//Add this variables in Configurable Variables
let queryID = 'ctl00$ContentBody$DG1$ctl00$ctl28$lnkDetails';

//Locate this variable in "Script Variables" 
const shortDescription = `Get Custom Query ${queryName}`;

// If it is necessary to add a condition, do so in the "filter" attribute
let filterObj = { filter: `` };

let resp = await vvClient.customQuery.getCustomQueryResultsById(queryID, filterObj).then((res) => parseRes(res))
    .then((res) => checkMetaAndStatus(res, shortDescription))
    .then((res) => checkDataPropertyExists(res, shortDescription))
    .then((res) => checkDataIsNotEmpty(res, shortDescription));

