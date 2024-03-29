// This is a script that can be used to start a node script that is called from a form.
// This can also be used as a base to build a library web service.

const logger = require("../log");

module.exports.getCredentials = function () {
    // Get customerAlias and databaseAlias from the project url
    // https://vv5demo.visualvault.com/app/customerAlias/Main/UserPortal
    // Get ID and Secret from /Control Panel/Administration Tools/User Administration/User Information => HTTP API Access
    // clientId: API Key
    // clientSecret: API Secret
    let options = {};
    options.customerAlias = 'Matias';
    options.databaseAlias = 'Main';
    options.userId = 'Matias.API';
    options.password = 'p';
    options.clientId = 'ce26b233-d68e-4406-a148-3b9458cd6f33';
    options.clientSecret = 'yJCQUzYNS7CvJypLp18klcY5Ncyap6Pm12n2tNKFy2s=';
    return options;
};

module.exports.main = async function (ffCollection, vvClient, response) {
    /*
    Script Name:    WebService name 
    Customer:       Project Name
    Purpose:        Brief description of the purpose of the script
    Parameters:     The following represent variables passed into the function:
                    parameter1: Description of parameter1
                    parameter2: Description of parameter2
    Return Object:
                    outputCollection[0]: Status
                    outputCollection[1]: Short description message
                    outputCollection[2]: Data
    Pseudo code: 
                    1° Does this
                    2° Does that
                    ...
 
    Date of Dev:    10/19/2021
    Last Rev Date:  10/19/2021
 
    Revision Notes:
                    07/30/2021 - DEVELOPER NAME HERE:  First Setup of the script
    */

    logger.info("Start of the process SCRIPT NAME HERE at " + Date());

    /* -------------------------------------------------------------------------- */
    /*                    Response and error handling variables                   */
    /* -------------------------------------------------------------------------- */

    // Response array
    let outputCollection = [];
    // Array for capturing error messages that may occur during the process
    let errorLog = [];

    /* -------------------------------------------------------------------------- */
    /*                           Configurable Variables                           */
    /* -------------------------------------------------------------------------- */

    const someTemplateName = "TEMPLATENAME";

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

    /* -------------------------------------------------------------------------- */
    /*                                  MAIN CODE                                 */
    /* -------------------------------------------------------------------------- */

    try {
        const webServiceName = "LibV2"; // Place this in the 'Configurable Variables' section
        shortDescription = `Run Web Service: ${webServiceName}`;

        let webServiceParams = [
            {
                name: "Site ID",
                value: "TestMatiasAndrade",
            },
        ];

        const clientLibrary = require("../VVRestApi");
        const scriptToExecute = require("../files/LibV2.js");
        const ffcol = new clientLibrary.forms.formFieldCollection(webServiceParams);
        const runWSResp = await scriptToExecute.main(ffcol, vvClient, response);

        // const runWSResp = await vvClient.scripts
        //     .runWebService(webServiceName, webServiceParams)
        //     .then((res) => checkMetaAndStatus(res, shortDescription))
        //     .then((res) => checkDataPropertyExists(res, shortDescription))
        //     .then((res) => checkDataIsNotEmpty(res, shortDescription));

        const runWSData = runWSResp.data;

        // 4. BUILD THE SUCCESS RESPONSE ARRAY

        outputCollection[0] = "Success"; // Don´t change this
        outputCollection[1] = "Success short description here";
        // outputCollection[2] = someVariableWithData;
    } catch (error) {
        logger.info("Error encountered" + error);

        // BUILD THE ERROR RESPONSE ARRAY

        outputCollection[0] = "Error"; // Don´t change this

        if (errorLog.length > 0) {
            outputCollection[1] = "Some errors ocurred";
            outputCollection[2] = `Error/s: ${errorLog.join("; ")}`;
        } else {
            outputCollection[1] = error.message ? error.message : `Unhandled error occurred: ${error}`;
        }
    } finally {
        // SEND THE RESPONSE

        response.json(200, outputCollection);
    }
};
