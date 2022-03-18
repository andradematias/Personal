const logger = require("../log");

var Q = require('q');

module.exports.getCredentials = function () {
    var options = {};
    options.customerAlias = "DevelopmentLibraryTe";
    options.databaseAlias = "Default";
    options.userId = "DevLibraryTesting.api";
    options.password = "&n>/sLcX]9qB";
    options.clientId = "cec3d7de-7d53-4f9f-b49a-39c8c8f04a14";
    options.clientSecret = "QdtJXYbqpbTlgtEvRFFQ3i3Aup3bg5oe4Chq3EhWKQY=";
    return options;
};

module.exports.main = async function (ffCollection, vvClient, response) {
    /*
      Script Name:  WsRelateDocumentsByDocID
      Customer: Visual Vault
      Purpose: This WS relates a document to a form record
      Parameters: documentId, formRevisionId;
      Psuedo code: 
                  1) The documentId is obtained
                  2) Get the "formRevisionId"
                  3) The document is related to the form record
                  4) Reply is sent
    ​
      Date of Dev:   01/10/2022
      Last Rev Date: 01/10/2022
    ​
      Revision Notes:
      01/10/2022- Matías Andrade:  Web service created
      */

    logger.info("Start of the process SelfExclusionApprove at " + Date());

    /**************************************
       Response and error handling letiables
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
    let formID = "Test Dat-000001"
    let documentId;
    let formRevisionId;

    /***********************
       Script Variables
      ************************/

    const shortDescription = `Relate Document ${formID}`;

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
            if (jsObject && typeof jsObject === "object") {
                vvClientRes = jsObject;
            }
        } catch (e) {
            // If an error ocurrs, it's because the resp is already a JS object and doesn't need to be parsed
        }
        return vvClientRes;
    }

    function checkMetaAndStatus(
        vvClientRes,
        shortDescription,
        ignoreStatusCode = 999
    ) {
        /*
        Checks that the meta property of a vvCliente API response object has the expected status code
        Parameters:
                vvClientRes: Parsed response object from a vvClient API method
                shortDescription: A string with a short description of the process
                ignoreStatusCode: An integer status code for which no error should be thrown. If you're using checkData(), make sure to pass the same param as well.
        */
        if (!vvClientRes.meta) {
            throw new Error(
                `${shortDescription} error. No meta object found in response. Check method call parameters and credentials.`
            );
        }

        const status = vvClientRes.meta.status;

        // If the status is not the expected one, throw an error
        if (status != 200 && status != 201 && status != ignoreStatusCode) {
            const errorReason =
                vvClientRes.meta.errors && vvClientRes.meta.errors[0]
                    ? vvClientRes.meta.errors[0].reason
                    : "unspecified";
            throw new Error(
                `${shortDescription} error. Status: ${vvClientRes.meta.status}. Reason: ${errorReason}`
            );
        }
        return vvClientRes;
    }

    function checkDataPropertyExists(
        vvClientRes,
        shortDescription,
        ignoreStatusCode = 999
    ) {
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
                throw new Error(
                    `${shortDescription} data property was not present. Please, check parameters and syntax. Status: ${status}.`
                );
            }
        }

        return vvClientRes;
    }

    function checkDataIsNotEmpty(
        vvClientRes,
        shortDescription,
        ignoreStatusCode = 999
    ) {
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
            const dataIsObject = typeof vvClientRes.data === "object";
            const isEmptyArray = dataIsArray && vvClientRes.data.length == 0;
            const isEmptyObject =
                dataIsObject && Object.keys(vvClientRes.data).length == 0;

            // If the data is empty, throw an error
            if (isEmptyArray || isEmptyObject) {
                throw new Error(
                    `${shortDescription} returned no data. Please, check parameters and syntax. Status: ${status}.`
                );
            }
            // If it is a Web Service response, check that the first value is not an Error status
            if (dataIsArray) {
                const firstValue = vvClientRes.data[0];

                if (firstValue == "Error") {
                    throw new Error(
                        `${shortDescription} returned an error. Please, check called Web Service. Status: ${status}.`
                    );
                }
            }
        }
        return vvClientRes;
    }

    /**********
       MAIN CODE 
      **********/

    try {

        // 1) The documentId is obtained

        //Get the documentID that will be used on the relateDocumentByDocId (This is just an example of how to obtain a documentID)
        let getDocumentsParams = {
            q: `[description] eq 'Recipe1.pdf'`,
            indexFields: 'include'
        };

        // The document property that contains the documentId is called [name]
        var getDocResult = await vvClient.documents.getDocuments(getDocumentsParams)
            .then((res) => parseRes(res))
            .then((res) => checkMetaAndStatus(res, shortDescription))
            .then((res) => checkDataPropertyExists(res, shortDescription))
            .then((res) => checkDataIsNotEmpty(res, shortDescription));

        documentId = getDocResult.data[0].name

        // 2) Get the "formRevisionId"
        const templateName = `Test Data Template`;

        let getFormsParams = {
            q: `[instanceName] eq '${formID}'`,
            expand: true
        };

        const getFormsRes = await vvClient.forms
            .getForms(getFormsParams, templateName)
            .then((res) => parseRes(res))
            .then((res) => checkMetaAndStatus(res, shortDescription))
            .then((res) => checkDataPropertyExists(res, shortDescription))
            .then((res) => checkDataIsNotEmpty(res, shortDescription));

        formRevisionId = getFormsRes.data[0].revisionId;

        //3) The document is related to the form record
        let relateDocumentResp = await vvClient.forms.relateDocumentByDocId(formRevisionId, documentId)
            .then((res) => parseRes(res))
            .then((res) => checkMetaAndStatus(res, shortDescription))

        //4) Reply is sent
        outputCollection[0] = "Success";

    } catch (error) {
        // Builds the error response array
        outputCollection[0] = "Error";
        outputCollection[1] = error.message ? error.message : error;
    } finally {
        // Sends the response
        response.json(200, outputCollection);
    }
};

