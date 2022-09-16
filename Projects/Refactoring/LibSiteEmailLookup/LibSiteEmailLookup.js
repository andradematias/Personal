// This is a script that can be used to start a node script that is called from a form.
// This can also be used as a base to build a library web service.

const logger = require("../log");

module.exports.getCredentials = function () {
    let options = {};
    options.customerAlias = 'Matias';
    options.databaseAlias = 'Main';
    options.userId = 'Matias.API2';
    options.password = 'p';
    options.clientId = '65951bdb-0822-45df-931b-fafbd57c9655';
    options.clientSecret = 'vdi6RrLC95I63TocMCs4bMGItx72nzZfXbxbr0Q6j8w=';
    return options;
};

module.exports.main = async function (ffCollection, vvClient, response) {
    /*Script Name:   LibSiteEmailLookup
   Customer:      VisualVault Library Function
   Purpose:       Get a list User IDs, First Name, Last Name and Email addresses for all users who are in a VisualVault Location.
                  Commonly used to get list of all email addresses for a provider.
   Parameters:    The following represent variables passed into the function:
                  Site ID = (string, Required) the id of the service provider used to lookup the VisualVault Location.

   Process PseudoCode:
                  1. Get the Site for the Site ID passed in.
                  2. Get list of users for that site.  Not discriminating between enabled or disabled users.
                  3. Load users into an object and return to the calling function.

   Return Array:  The following represents the array of information returned to the calling function. This is a standardized response. Any item in the array at points 2 or above can be used to return multiple items of information.
                  0 - Status: Success, Failure
                  1 - Message
                  2 - Array of User Objects

   Date of Dev:   02/16/2018
   Last Rev Date:  07/06/2021
   Revision Notes:
   02/16/2018 - Jason Hatch: Initial creation of the business process.
   03/09/2018 - Jason Hatch: Added mechanism to get the usid from the users.
   07/06/2021 - Emanuel Jofré: Promises transpiled to async/await.
   21/07/2022 - One tree team: Changed error handling and refactored code.
   */

    logger.info("Start of the process SCRIPT NAME HERE at " + Date());

    /* -------------------------------------------------------------------------- */
    /*                    Response and error handling variables                   */
    /* -------------------------------------------------------------------------- */

    // Response array
    let returnObj = [];

    // Array for capturing error messages that may occur during the process
    let errorLog = [];


    /* -------------------------------------------------------------------------- */
    /*                           Configurable Variables                           */
    /* -------------------------------------------------------------------------- */

    // These fields have to be written exactly as in the fields
    let userFields = "id, userid, siteid, firstname, lastname, emailaddress, enabled";

    /* -------------------------------------------------------------------------- */
    /*                              Script Variables                              */
    /* -------------------------------------------------------------------------- */

    // Description used to better identify API methods errors
    let shortDescription = "";

    /* -------------------------------------------------------------------------- */
    /*                              Helper Functions                              */
    /* -------------------------------------------------------------------------- */

    function getFieldValueByName(fieldName, isRequired = true) {
        /*
        Check if a field was passed in the request and get its value
        Parameters:
            fieldName: The name of the field to be checked
            isRequired: If the field is required or not
        */

        let resp = null;

        try {
            // Tries to get the field from the passed in arguments
            const field = ffCollection.getFormFieldByName(fieldName);

            if (!field && isRequired) {
                throw new Error(`The field '${fieldName}' was not found.`);
            } else if (field) {
                // If the field was found, get its value
                let fieldValue = field.value ? field.value : null;

                if (typeof fieldValue === "string") {
                    // Remove any leading or trailing spaces
                    fieldValue.trim();
                }

                if (fieldValue) {
                    // Sets the field value to the response
                    resp = fieldValue;
                } else if (isRequired) {
                    // If the field is required and has no value, throw an error
                    throw new Error(`The value property for the field '${fieldName}' was not found or is empty.`);
                }
            }
        } catch (error) {
            // If an error was thrown, add it to the error log
            errorLog.push(error);
        }
        return resp;
    }

    function parseRes(vvClientRes) {
        /*
        Generic JSON parsing function
        Parameters:
            vvClientRes: JSON response from a vvClient API method
        */
        try {
            // Parses the response in case it's a JSON string
            const jsObject = JSON.parse(vvClientRes);
            // Handle non-exception-throwing cases:
            if (jsObject && typeof jsObject === "object") {
                vvClientRes = jsObject;
            }
        } catch (e) {
            // If an error occurs, it's because the resp is already a JS object and doesn't need to be parsed
        }
        return vvClientRes;
    }

    function checkMetaAndStatus(vvClientRes, shortDescription, ignoreStatusCode = 999) {
        /*
        Checks that the meta property of a vvClient API response object has the expected status code
        Parameters:
            vvClientRes: Parsed response object from a vvClient API method
            shortDescription: A string with a short description of the process
            ignoreStatusCode: An integer status code for which no error should be thrown. If you're using checkData(), make sure to pass the same param as well.
        */

        if (!vvClientRes.meta) {
            throw new Error(`${shortDescription} error. No meta object found in response. Check method call parameters and credentials.`);
        }

        const status = vvClientRes.meta.status;

        // If the status is not the expected one, throw an error
        if (status != 200 && status != 201 && status != ignoreStatusCode) {
            const errorReason = vvClientRes.meta.errors && vvClientRes.meta.errors[0] ? vvClientRes.meta.errors[0].reason : "unspecified";
            throw new Error(`${shortDescription} error. Status: ${vvClientRes.meta.status}. Reason: ${errorReason}`);
        }
        return vvClientRes;
    }

    function checkDataPropertyExists(vvClientRes, shortDescription, ignoreStatusCode = 999) {
        /*
        Checks that the data property of a vvClient API response object exists 
        Parameters:
            res: Parsed response object from the API call
            shortDescription: A string with a short description of the process
            ignoreStatusCode: An integer status code for which no error should be thrown. If you're using checkMeta(), make sure to pass the same param as well.
        */
        const status = vvClientRes.meta.status;

        if (status != ignoreStatusCode) {
            // If the data property doesn't exist, throw an error
            if (!vvClientRes.data) {
                throw new Error(`${shortDescription} data property was not present. Please, check parameters and syntax. Status: ${status}.`);
            }
        }

        return vvClientRes;
    }

    function checkDataIsNotEmpty(vvClientRes, shortDescription, ignoreStatusCode = 999) {
        /*
        Checks that the data property of a vvClient API response object is not empty
        Parameters:
            res: Parsed response object from the API call
            shortDescription: A string with a short description of the process
            ignoreStatusCode: An integer status code for which no error should be thrown. If you're using checkMeta(), make sure to pass the same param as well.
        */
        const status = vvClientRes.meta.status;

        if (status != ignoreStatusCode) {
            const dataIsArray = Array.isArray(vvClientRes.data);
            const dataIsObject = typeof vvClientRes.data === "object";
            const isEmptyArray = dataIsArray && vvClientRes.data.length == 0;
            const isEmptyObject = dataIsObject && Object.keys(vvClientRes.data).length == 0;

            // If the data is empty, throw an error
            if (isEmptyArray || isEmptyObject) {
                throw new Error(`${shortDescription} returned no data. Please, check parameters and syntax. Status: ${status}.`);
            }
            // If it is a Web Service response, check that the first value is not an Error status
            if (dataIsArray) {
                const firstValue = vvClientRes.data[0];

                if (firstValue == "Error") {
                    throw new Error(`${shortDescription} returned an error. Please, check called Web Service. Status: ${status}.`);
                }
            }
        }
        return vvClientRes;
    }

    function getSite(siteName) {
        const shortDescription = `Get site ${siteName}`;
        const getSiteParams = {
            // Query to search for the site name
            q: `name eq '${siteName}'`,
            // Fields to return
            fields: `id`,
        };

        return vvClient.sites
            .getSites(getSiteParams)
            .then((res) => parseRes(res))
            .then((res) => checkMetaAndStatus(res, shortDescription))
            .then((res) => checkDataPropertyExists(res, shortDescription))
            .then((res) => checkDataIsNotEmpty(res, shortDescription))
            .then((res) => {
                return res.data[0].id;
            });
    }

    function getSiteUser(siteGUID) {
        shortDescription = `Get user`;
        const usersParams = {
            fields: userFields,
        };

        return vvClient.users
            .getUsers(usersParams, siteGUID)
            .then((res) => parseRes(res))
            .then((res) => checkMetaAndStatus(res, shortDescription))
            .then((res) => checkDataPropertyExists(res, shortDescription))
            .then((res) => checkDataIsNotEmpty(res, shortDescription))
            .then((res) => {
                let unfilteredUsers = res.data;

                let filteredUsers = deletePropertiesFromObjects(unfilteredUsers);

                return filteredUsers;
            });
    }

    function deletePropertiesFromObjects(arrayOfObjects) {
        let filteredUsers = [];
        // Create array with properties of the object
        let objKeys = Object.keys(arrayOfObjects[0]);
        // Set properties to lowercase
        objKeys = objKeys.map((key) => key.toLowerCase());
        userFields = userFields.split(",").map((key) => key.trim().toLowerCase());
        //
        let keysToRemove = objKeys.filter((key) => {
            if (userFields.includes(key)) {
                return false;
            } else {
                return true;
            }
        });

        filteredUsers = arrayOfObjects.map((user) => {
            keysToRemove.forEach((key) => {
                delete user[key];
            });
            return user;
        });

        return filteredUsers;
    }

    /* -------------------------------------------------------------------------- */
    /*                                  MAIN CODE                                 */
    /* -------------------------------------------------------------------------- */

    try {
        // 1. GET THE VALUES OF THE FIELDS

        const siteID = getFieldValueByName("Site ID");

        // 2. CHECKS IF THE REQUIRED PARAMETERS ARE PRESENT

        if (!siteID) {
            returnObj[0] = "No Site";
            returnObj[1] = "A site was not found where the user could be created.";
        }

        // GET SITE GUID

        const siteGUID = await getSite(siteID);

        // GET SITE USERS

        const emailList = await getSiteUser(siteGUID);

        // 4. BUILD THE SUCCESS RESPONSE ARRAY

        returnObj[0] = "Emails Found";
        returnObj[1] = "List of Emails Found and Returned.";
        returnObj[2] = emailList;
    } catch (error) {
        logger.info("Error encountered" + error);

        // BUILD THE ERROR RESPONSE ARRAY
        if (!returnObj) {
            if (error.message.includes('Get site')) {
                returnObj[0] = "No Site";
                returnObj[1] = "A site was not found where the user could be created.";
            } else if (error.message.includes('Get user')) {
                returnObj[0] = "No Email";
                returnObj[1] = "No Emails found for this site.";
            } else {
                returnObj[0] = "Error";
                returnObj[1] = error.message ? error.message : error;
            }
        }
    } finally {
        // SEND THE RESPONSE
        response.json(200, returnObj);
    }
};
