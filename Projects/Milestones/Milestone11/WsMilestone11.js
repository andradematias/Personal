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

module.exports.main = async function (vvClient, response, token) {
    /*
      Script Name:   Milestone11SP
      Customer:      VisualVault
      Purpose:       A scheduled process was implemented on the "Make an Order" form, affecting the "Price by Unit", increasing its price by 10%. 
      Parameters:    The following are parameters that need to be passed into this libarary node script.
                     - Parameters are not required for a scheduled process.
 
      Return Object:
                     - Message will be sent back to VV as part of the ending of this scheduled process.
      Psuedo code:
                     1. Acquire the license lookup record that matches the license.
 
      Date of Dev:   01/04/2021
      Last Rev Date:
 
      Revision Notes:
      07/30/2021 - DEVELOPER NAME HERE:  First Setup of the script
     */

    logger.info('Start of logic for SCRIPT NAME HERE on ' + new Date());

    /***************
     Error handling
    ****************/

    // Array for capturing error messages that may occur during the execution of the script.
    let errorLog = [];

    /***********************
       Configurable Variables
      ************************/
    const queryName = 'QueryMilestone11'
    const formName = 'Make an Order'

    /***********************
       Script Variables
      ************************/

    // Describes the process being checked using the parsing and checking helper functions
    let shortDescription = `Get Custom Query ${queryName}`;
    let responseMessage = '';
    const scheduledProcessGUID = token;

    /*****************
     Helper Functions
    ******************/

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
            throw new Error(`${shortDescription} error. No meta object found in response. Check method call parameters and credentials.`);
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

        // If it is necessary to add a condition, do so in the "filter" attribute
        let filterObj = { filter: `` };

        // The results of the query are obtained
        let resp = await vvClient.customQuery
            .getCustomQueryResultsByName(queryName, filterObj).then((res) => parseRes(res))
            .then((res) => checkMetaAndStatus(res, shortDescription))
            .then((res) => checkDataPropertyExists(res, shortDescription))
            .then((res) => checkDataIsNotEmpty(res, shortDescription));

        if (resp.data.length > 0) {
            let count = 0;

            for (let record of resp.data) {


                let orderQuery = {
                    q: `[OrderID] = '${record.orderID}'`,
                    fields: 'PriceByUnit'
                };

                // Returns the order that has the same OrderID
                let order = await vvClient.forms.getForms(orderQuery, formName).then((res) => parseRes(res));

                // The price of each PriceByUnit was changed
                let total = record.priceByUnit *= 1.1;

                let formFieldsToUpdate = {
                    'PriceByUnit': total,
                };

                let GUID = order.data[count].revisionId;

                // The priceByUnit of each Make an Order is edited
                const postFormRevRes = await vvClient.forms
                    .postFormRevision(null, formFieldsToUpdate, formName, GUID)
                    .then((res) => parseRes(res))
                    .then((res) => checkMetaAndStatus(res, shortDescription))
                    .then((res) => checkDataPropertyExists(res, shortDescription))
                    .then((res) => checkDataIsNotEmpty(res, shortDescription));

                count += 1;
            }
        }
        // SEND THE SUCCESS RESPONSE MESSAGE
        responseMessage = 'Success';

        // Uncomment the following line for testing. You will see the log ONLY if the process runs as a test.
        //response.json(200, responseMessage);

        // Uncomment the following line for production. You will see the log ONLY if the process runs automatically.
        return vvClient.scheduledProcess.postCompletion(scheduledProcessGUID, 'complete', true, responseMessage);
    } catch (error) {
        // SEND THE ERROR RESPONSE MESSAGE

        if (errorLog.length > 0) {
            responseMessage = `Error/s: ${errorLog.join('; ')}`;
        } else {
            responseMessage = `Unhandeled error occurred: ${error}`;
        }

        // Uncomment the following line for testing. You will see the log ONLY if the process runs as a test.
        response.json(200, responseMessage);

        // Uncomment the following line for production. You will see the log ONLY if the process runs automatically.
        // return vvClient.scheduledProcess.postCompletion(scheduledProcessGUID, 'complete', false, responseMessage);
    }
};
