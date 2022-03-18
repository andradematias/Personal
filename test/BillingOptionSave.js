/* 
USE JAVASCRIPT ES6 AND ABOVE 
https://www.w3schools.com/js/js_es6.asp 
*/
const logger = require('../log');

module.exports.getCredentials = function () {
    // Get customerAlias and databaseAlias from the project url
    // https://vv5demo.visualvault.com/app/customerAlias/Main/UserPortal
    // Get ID and Secret from /Control Panel/Administration Tools/User Administration/User Information => HTTP API Access
    // clientId: API Key
    // clientSecret: API Secret
    let options = {};
    options.customerAlias = "VisualVault";
    options.databaseAlias = "BillingAutomation";
    options.userId = "Billing.API";
    options.password = "p";
    options.clientId = "641d730d-79ba-46da-9ee6-c08a526beb47";
    options.clientSecret = "MCRZIkjt2JzedLIc2Jsno5J6saPr9VNwnluNBu0d2kU=";
    return options;
};

module.exports.main = async function (ffCollection, vvClient, response) {
    /*
    Script Name:  BillingOptionSave 
    Customer:      Billing Automation
    Purpose:       Validate if a Billing Option is duplicated
    Parameters:    The following represent variables passed into the function:
                    Summary: String summary
                    Status: String ("Enable" and "Disabled")
                    Customer ID: Form ID of the customer record
    Psuedo code: 
                1° Verify with an API call if the Billing option is duplicated for this customer or not.
                2° Send response.
                ...
  ​
    Date of Dev:   11/22/2021
    Last Rev Date: 11/22/2021
  ​
    Revision Notes:
    11/22/2021 - Matías Andrade:  Web service created
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

    const billingOptionRecordName = 'Billing Options';

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

    /*
    DECLARE HERE ANY ADDITIONAL HELPER FUNCTIONS THAT YOU NEED TO USE IN THE WS
    */

    /**********
     MAIN CODE 
    **********/

    try {
        // Create variables for the values send as parameters
        let summary = getFieldValueByName('Summary');
        let status = getFieldValueByName('Status');
        let customerID = getFieldValueByName('Customer ID');
        let billingOptionID = getFieldValueByName('Billing Option ID');

        // Checks if the required paramenters are present
        if (!summary || !status || !customerID || !billingOptionID) {
            // It could be more than one error, so we need to send all of them in one response
            throw new Error(errorLog.join('; '));
        }

        const formQuery = {
            q: `[Summary] = '${summary}' AND [Status] eq 'Enabled' AND [Customer ID] eq '${customerID}'`,
            expand: true
        };

        let getFormResp = await vvClient.forms.getForms(formQuery, billingOptionRecordName);

        getFormResp = JSON.parse(getFormResp);

        // getForms() response processing
        if (!getFormResp.meta) {
            throw new Error("Call to getForms on Billing Options error. Check web service and credentials.");
        }
        if (getFormResp.meta.status != 200) {
            throw new Error("getForms on Billing Options returned with an error.");
        }
        if (!getFormResp.data) {
            throw new Error("getForms on Billing Options returned no data.");
        }

        // 3° BUILDS THE RESPONSE OBJECT
        let duplicated = false;

        if (getFormResp.data.length > 0) {
            getFormResp.data.forEach(record => {
                if (record.dhdocid1 != billingOptionID) {
                    duplicated = true;
                }
            });
        }

        if (duplicated) {
            outputCollection[0] = "Duplicated";
            outputCollection[1] = "Another active Billing Option exists with the same Summary and Customer Id.";
        } else {
            outputCollection[0] = "Success";
            outputCollection[1] = "Bill Record ready to be saved.";
        }
    } catch (error) {
        // Builds the error response array
        outputCollection[0] = 'Error';
        outputCollection[1] = error.message ? error.message : error;
    } finally {
        // Sends the response
        response.json(200, outputCollection);
    }
};