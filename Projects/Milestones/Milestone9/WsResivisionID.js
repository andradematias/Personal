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
    Script Name:  WsRevisionID
    Customer:      Milestones
    Purpose:       
    Parameters:    
    Psuedo code: 
                1° Verify with an API call if the Billing option is duplicated for this customer or not.
                2° Send response.
                ...
  ​
    Date of Dev:   12/22/2021
    Last Rev Date: 12/22/2021
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

    const billingOptionRecordName = 'Make an Order';

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
        let OrderRecordID = getFieldValueByName('OrderID');
        let BillID = getFieldValueByName('Bill ID');

        // 1° Checks if the required paramenters are present.

        // Checks if the required paramenters are present
        if (!OrderRecordID || !BillID) {
            // It could be more than one error, so we need to send all of them in one response
            throw new Error(errorLog.join('; '));
        }


        const formQuery = {
            q: `[OrderID] = '${OrderRecordID}'`,
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
        let exist = false;

        if (getFormResp.data.length > 0) {
            exist = true;
        }
        let GUIDOrder = getFormResp.data[0].dhid1;
        if (exist) {

            let relateResp = await vvClient.forms.relateFormByDocId(GUIDOrder, "Bill-000012");
            var relatedResp = JSON.parse(relateResp);
            if (relatedResp.meta.status === 200 || relatedResp.meta.status === 404) {
                //This is the last action. Return the result to the calling function.
                outputCollection[0] = 'Success';
                outputCollection[1] = "Relate a form was handled successfully.";
            }
            else {
                //logger.info("Call to relate forms returned with an error.");
                throw new Error("Call to relate forms returned with an error.");
            }


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
