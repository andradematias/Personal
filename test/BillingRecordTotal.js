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
    Script Name:  BillingRecordTotal
    Customer:      Billing Automation
    Purpose:       Get all billing record line items and calculate the total.
    Parameters:    The following represent variables passed into the function:
                    Bill ID: Form ID of the Bill Record
    Psuedo code: 
                1° Checks if the required paramenters are present.
                2° Get Billing Item Forms
                3° calulate Amount
                4° Send response.
  ​
    Date of Dev:   02/12/2021
    Last Rev Date: 02/12/2021
  ​
    Revision Notes:
    02/12/2021 - Matías Andrade:  Web service created
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

    const billLineItemName = 'Bill Line Item';

    /***********************
      Script Variables
     ************************/
    let total = 0;

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
        let billRecordID = getFieldValueByName('Bill ID');


        // 1° Checks if the required paramenters are present.

        // Checks if the required paramenters are present
        if (!billRecordID) {
            // It could be more than one error, so we need to send all of them in one response
            throw new Error(errorLog.join('; '));
        }

        //2° Get Billing Item Forms
        const formQuery = {
            q: `[Bill ID] eq '${billRecordID}'`,
            fields: 'Amount'
        };

        let getFormResp = await vvClient.forms.getForms(formQuery, billLineItemName);

        getFormResp = JSON.parse(getFormResp);

        // getForms() response processing
        if (!getFormResp.meta) {
            throw new Error("Call to getForms on Bill Line Item error. Check web service and credentials");
        }
        if (getFormResp.meta.status != 200) {
            throw new Error("getForms on Bill Line Item returned with an error");
        }
        if (getFormResp.data) {
            //3° calulate Amount
            if (getFormResp.data.length > 0) {
                getFormResp.data.forEach(item => {
                    total += item.amount
                });
            }
        }

        //4° Send response.
        outputCollection[0] = "Success";
        outputCollection[1] = "Total result";
        outputCollection[2] = total;

    } catch (error) {
        // Builds the error response array
        outputCollection[0] = 'Error';
        outputCollection[1] = error.message ? error.message : error;
    } finally {
        // Sends the response
        response.json(200, outputCollection);
    }
};