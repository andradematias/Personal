let logger = require('../log');
let moment = require('moment')

module.exports.getCredentials = function () {
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
    /*Script Name:  CustomerRecordSave
     Customer:      BillingAutomation
     Purpose:       The purpose of this process is to save  a customer record only if the form is Unique or Unique Matched (results from the LibFormVerifyUniqueRecord that indicate that a form is not
   present on the system or that you are trying to save a modification of a given Form).
     Parameters:    CustomerNumber - (String, Required) Used in the query to verify if the record is unique or unique matched.
                    Record ID - (String, Required) Used in the query to verify if the record is unique or unique matched.
                    
     Return Array:  1. Status: 'Success', 'Error'
                    2. Message
                  
                    
     Pseudo code:   1. Call VerifyUniqueRecord to determine whether the template record is unique per the passed in information.
                    2. Send response with return array.
   
         */

    logger.info('Start of the process CustomerRecordSave at ' + Date())

    /**********************
     Configurable Variables
    ***********************/
    //Template ID for Employee Assignment
    let CustomerTemplateID = 'Customer Record'
    // Error message guidances
    let errorMessageGuidance = 'Please try to add this customer again, or contact a system administrator if this problem continues.'
    let missingFieldGuidance = 'Please provide a value for the missing field and try again, or contact a system administrator if this problem continues.'


    // Response array populated in try or catch block, used in response sent in final block.
    let outputCollection = []
    // Array for capturing error messages that may occur within helper functions.
    let errorLog = []
    try {
        /*********************
         Form Record Variables
        **********************/
        // Holds group permissions when processing formFieldsToGroupsRelationships
        let groupList = []
        //Create variables for the values on the form record
        let CustomerRevisionID = getFieldValueByName('REVISIONID')
        let CustomerNumber = getFieldValueByName('Customer Number')
        let FormID = getFieldValueByName('Record ID')
        /****************
         Script Variables
        *****************/
        var CustomerNumberSearch = CustomerNumber.replace(/'/g, "\\'");
        /****************
         Helper Functions
        *****************/
        // Check if field object has a value property and that value is truthy before returning value.
        function getFieldValueByName(fieldName, isOptional) {
            try {
                let fieldObj = ffCollection.getFormFieldByName(fieldName)
                let fieldValue = fieldObj && (fieldObj.hasOwnProperty('value') ? fieldObj.value : null)

                if (fieldValue === null) {
                    throw new Error(`A value property for ${fieldName} was not found.`)
                }
                if (!isOptional && !fieldValue) {
                    throw new Error(`A value for ${fieldName} was not provided.`)
                }
                return fieldValue
            } catch (error) {
                errorLog.push(error)
            }
        }
        /****************
         BEGIN ASYNC CODE
        *****************/
        // STEP 1 - Call VerifyUniqueRecord to determine whether the template record is unique per the passed in information.
        //Query formatted variables
        let uniqueRecordArr = [
            {
                name: 'templateId',
                value: CustomerTemplateID
            },
            {
                name: 'query',
                value: "[Customer Number] eq '" + CustomerNumberSearch + "'"
            },
            {
                name: 'formId',
                value: FormID
            }
        ];
        let verifyUniqueResp = await vvClient.scripts.runWebService('LibFormVerifyUniqueRecord', uniqueRecordArr);
        let verifyUniqueData = (verifyUniqueResp.hasOwnProperty('data') ? verifyUniqueResp.data : null);
        let verifyUniqueStatus = (verifyUniqueData.hasOwnProperty('status') ? verifyUniqueData.status : null);

        if (verifyUniqueResp.meta.status !== 200) {
            throw new Error(`There was an error when calling LibFormVerifyUniqueRecord. ${errorMessageGuidance}`)
        }
        if (verifyUniqueData === null) {
            throw new Error(`Data was not returned when calling LibFormVerifyUniqueRecord. ${errorMessageGuidance}`)
        }
        if (verifyUniqueStatus === null) {
            throw new Error(`A status was not returned when calling LibFormVerifyUniqueRecord. ${errorMessageGuidance}`)
        }
        if (verifyUniqueStatus === 'Error') {
            throw new Error(`The call to LibFormVerifyUniqueRecord returned with an error. ${verifyUniqueData.statusMessage}. ${errorMessageGuidance}`)
        }
        if (verifyUniqueStatus === 'Not Unique') {
            outputCollection[0] = 'Success';
            outputCollection[1] = 'Not Unique';
            outputCollection[2] = 'Another Customer record already exists with the same Customer Number.';
        }
        if (verifyUniqueStatus === 'Unique') {
            outputCollection[0] = 'Success';
            outputCollection[1] = 'Unique Customer';
            outputCollection[2] = verifyUniqueStatus;
        }
        if (verifyUniqueStatus === 'Unique Matched') {
            outputCollection[0] = 'Success';
            outputCollection[1] = 'Unique Matched';
            outputCollection[2] = verifyUniqueStatus;
        }


    } catch (error) {
        // Log errors captured.
        logger.info(JSON.stringify(`${error} ${errorLog}`))
        outputCollection[0] = 'Error'
        outputCollection[1] = `${errorLog.join(' ')} ${error.message}`
    } finally {
        response.json(200, outputCollection)
    }
}
