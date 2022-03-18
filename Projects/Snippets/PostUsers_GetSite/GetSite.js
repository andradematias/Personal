//  vvClient.sites.getSites(siteSearchObject)
//  This function returns the "GUID" of a site.
//  The parameter "siteSearchObject" is an object composed of two attributes, "q" is a query that compares the name of the site and "fields" that contain the id and name of the site.


//Locate this variable in "Configurable Variables"
const siteName;

//Locate this variable in "Script Variables" 
const siteID;

const shortDescription = `Get site ${siteName}`;

// Search the Site Name passed in to determine if it exists.
const siteSearchObject = {
    q: `name eq '${siteName}'`,
    fields: `id,name`,
};

const getSiteRes = await vvClient.sites
    .getSites(siteSearchObject)
    .then((res) => parseRes(res))
    .then((res) => checkMetaAndStatus(res, shortDescription))
    .then((res) => checkDataPropertyExists(res, shortDescription))
    .then((res) => checkDataIsNotEmpty(res, shortDescription));

if (getSiteRes.data.length > 0) {
    siteID = getSiteRes.data[0].id;
}

//If the site does not exist an error is thrown, it is recommended to use the try / catch structure to process that error or send it as a response