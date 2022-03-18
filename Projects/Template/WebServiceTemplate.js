const logger = require('../log');

module.exports.getCredentials = function () {
    // Get customerAlias and databaseAlias from the project url
    // https://vv5demo.visualvault.com/app/customerAlias/Main/UserPortal
    // Get ID and Secret from /Control Panel/Administration Tools/User Administration/User Information => HTTP API Access
    // clientId: API Key
    // clientSecret: API Secret
    let options = {};
    options.customerAlias = 'customerAlias';
    options.databaseAlias = 'Main';
    options.userId = '';
    options.password = '';
    options.clientId = '2b8971f7-3986-42d5-bffa-6619fd66ef73';
    options.clientSecret = '2RAb7tEJrLlpRQoP224rTuOg++tc49/672YilQea60c=';
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
                  .
    Psuedo code: 
              1° Does this
              2° Does that
              ...

    Date of Dev:   10/19/2021
    Last Rev Date: 10/19/2021

    Revision Notes:
    10/19/2021 - Emanuel Jofré:  Mock up created
    */

    logger.info('Start of the process SelfExclusionApprove at ' + Date());

    /**************************************
     Response and error handling variables
    ***************************************/

    // Response array to be returned
    // outputCollection[0]: Status
    // outputCollection[1]: Short description message
    // outputCollection[2]: Data. Usually an object
    let outputCollection = [];
    // Array for capturing error messages that may occur within helper functions.
    let errorLog = [];

    /***********************
     Configurable Variables
    ************************/

    /*
    DEFINE HERE VARIABLES THAT HOLD CONFIGURABLE VALUES USED ALONG THE WS
    LIKE FLODER PATHS, NAMES OF EXTERNAL QUERIES, TESTING EMAIL ADRESSES, ETC.
    */

    /*****************
     Script Variables
    ******************/

    /*****************
     Helper Functions
    ******************/

    function getFieldValueByName(fieldNameString, isRequired = true) {
        // Check if a field was passed in the request and get its value
        // If isOptionalBoolean parameter is not passed in, the field is required
        let resp = null;

        try {
            // Tries to get the field from the passed in arguments
            let field = ffCollection.getFormFieldByName(fieldNameString);

            if (!field) {
                throw new Error(`The field '${fieldNameString}' was not found.`);
            } else {
                // If the field was found, get its value
                let fieldValue = field.value ? field.value : null;

                if (typeof fieldValue === 'string') {
                    // Remove any leading or trailing spaces
                    fieldValue.trim();
                }

                if (fieldValue) {
                    // Sets the field value to the response
                    resp = fieldValue;
                } else if (isRequired) {
                    // If the field is required and has no value, throw an error
                    throw new Error(`The value property for the field '${fieldNameString}' was not found or is empty.`);
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
            if (jsObject && typeof jsObject === 'object') {
                vvClientRes = jsObject;
            }
        } catch (e) {
            // If an error ocurrs, it's because the resp is already a JS object and doesn't need to be parsed
        }
        return vvClientRes;
    }

    function checkMetaAndStatus(vvClientRes, shortDescription, ignoreStatusCode = 999) {
        /*
        Checks that the meta property of a vvCliente API response object has the expected status code
        Parameters:
            vvClientRes: Parsed response object from a vvClient API method
            shortDescription: A string with a short description of the process
            ignoreStatusCode: An integer status code for which no error should be thrown. If you're using checkData(), make sure to pass the same param as well.
        */

        if (!vvClientRes.meta) {
            throw new Error(`${shortDescription} error. No meta object found in response. Check method call and credentials.`);
        }

        const status = vvClientRes.meta.status;

        // If the status is not the expected one, throw an error
        if (status != 200 && status != 201 && status != ignoreStatusCode) {
            const errorReason = vvClientRes.meta.errors && vvClientRes.meta.errors[0] ? vvClientRes.meta.errors[0].reason : 'unspecified';
            throw new Error(`${shortDescription} error. Status: ${vvClientRes.meta.status}. Reason: ${errorReason}`);
        }
        return vvClientRes;
    }

    function checkDataPropertyExists(vvClientRes, shortDescription, ignoreStatusCode = 999) {
        /*
        Checks that the data property of a vvCliente API response object exists 
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
        Checks that the data property of a vvCliente API response object is not empty
        Parameters:
            res: Parsed response object from the API call
            shortDescription: A string with a short description of the process
            ignoreStatusCode: An integer status code for which no error should be thrown. If you're using checkMeta(), make sure to pass the same param as well.
        */
        const status = vvClientRes.meta.status;

        if (status != ignoreStatusCode) {
            const dataIsArray = Array.isArray(vvClientRes.data);
            const dataIsObject = typeof vvClientRes.data === 'object';
            const isEmptyArray = dataIsArray && vvClientRes.data.length == 0;
            const isEmptyObject = dataIsObject && Object.keys(vvClientRes.data).length == 0;

            // If the data is empty, throw an error
            if (isEmptyArray || isEmptyObject) {
                throw new Error(`${shortDescription} returned no data. Please, check parameters and syntax. Status: ${status}.`);
            }
            // If it is a Web Service response, check that the first value is not an Error status
            if (dataIsArray) {
                const firstValue = vvClientRes.data[0];

                if (firstValue == 'Error') {
                    throw new Error(`${shortDescription} returned an error. Please, check called Web Service. Status: ${status}.`);
                }
            }
        }
        return vvClientRes;
    }

    /**********
     MAIN CODE 
    **********/

    try {
        // Create variables for the values send as parameters
        let formID = getFieldValueByName('Form ID');

        // Checks if the required paramenters are present
        if (!formID) {
            // It could be more than one error, so we need to send all of them in one response
            throw new Error(errorLog.join('; '));
        }

        const shortDescription = `Get form ${formID}`;
        const templateName = `Individual Record`;

        let getFormsParams = {
            q: `[Individual ID] eq ${formID}`,
        };

        let getFormsRes = await vvClient.library
            .getForms(getFormsParams, templateName)
            .then((res) => parseRes(res))
            .then((res) => checkMetaAndStatus(res, shortDescription))
            .then((res) => checkDataPropertyExists(res, shortDescription));
        //  .then((res) => checkDataIsNotEmpty(res, shortDescription));
        //  The line above is not used because the API returns an empty array when the folder doesn't exist

        // It returns the complete response object
        if (getFormsRes.data.length == 0) {
            // Folder doesn't exist
        } else {
            // Folder exists
        }

        // Builds the success response array
        outputCollection[0] = 'Success';
        outputCollection[1] = 'Success short description here';
    } catch (error) {
        // Builds the error response array
        outputCollection[0] = 'Error';
        outputCollection[1] = error.message ? error.message : error;
    } finally {
        // Sends the response
        response.json(200, outputCollection);
    }
};
