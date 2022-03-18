/// This script assumes that there is are 4 custom query named 'Test Custom Query[1-4]'
/// Credentials are for Nebraska DHHS Dev environment
///
/// To execute directly, place file in \nodeJs-rest-client-library\scripts\test-scripts\scheduled ,
/// start debugging the node js server and then go to http://localhost:3000/TestScripts/Scheduled/Sample22427
///

//Sample22427.js

module.exports.getCredentials = function () {
    var options = {};
    options.baseUrl = 'https://vv5dev.visualvault.com/';
    options.customerAlias = 'NEDHHS';
    options.databaseAlias = 'LIS';
    options.userId = 'NEDHHS.api';
    options.password = 'NEDHHSapi2021';
    options.clientId = '03ab5b3c-abee-4188-a9f2-bcf93d2467aa';
    options.clientSecret = 'h4I2RKUXBqAcNFTqL7VDsrPNMUmUKMQyJIDXm9vXW1o=';
    return options;
};

module.exports.main = async function (vvClient, response, scriptId) {
    const queryType = 3; //change query type for testing each scenario below
    let params;
    let queryParams;
    let CustomQueryResponse;

    switch (queryType) {
        case 1:
            //Using filter parameter for backward compatibility.  This is how each of you have previously used Custom Query API and is still supported.
            //Custom Query using filter parameter for backward compatibility
            //SELECT [Form ID], [Professional License Type] FROM [License Application]
            //Query name = TestCustomQuery1
            params = {
                filter: "[Professional License Type] = 'Athletic Trainer'",
            };
            CustomQueryResponse = JSON.parse(await vvClient.customQuery.getCustomQueryResultsByName('TestCustomQuery1', params));
            response.json(200, CustomQueryResponse);
            break;
        case 2:
            //Custom Query using SQL Parameters.  Uses any number of SQL Parameters defined in the saved SQL Query with parameter values provided at runtime.
            //Custom Query using SQL Parameters
            //SELECT [Form ID], [Professional License Type] FROM [License Application] WHERE [Professional License Type] = @value1
            //Query name = TestCustomQuery2
            params = {};
            queryParams = [
                {
                    parameterName: 'value1',
                    value: 'Massage Therapist',
                },
            ];
            params.params = JSON.stringify(queryParams); //Params query string parameter
            CustomQueryResponse = JSON.parse(await vvClient.customQuery.getCustomQueryResultsByName('TestCustomQuery2', params));
            response.json(200, CustomQueryResponse);
            break;
        case 3:
            //Most flexible option supports: Paging, Sorting, ODATA Query Syntax, AND can be combined with SQL Parameters
            //Custom Query using multiple features including: SQL Parameters, Paging, Sorting, and ODATA style Query syntax (same syntax used by GetForms, etc.)
            //SELECT [Form ID], [Professional License Type],[Status] FROM [License Application] WHERE [Professional License Type] = @value1
            //Query name = TestCustomQuery3
            params = {
                sort: 'Professional License Type', //sort
                sortdir: 'desc', //sort direction
                limit: 100, //limit to n records, can be used for paging or select top. Example limit=100, offset=101 would be page 2 of 100 records per page.
                offset: 0, //used for paging, offset is the page start record number
                q: `[Status] eq 'Submitted'`, //q query filter see: https://developer.visualvault.com/api/v1/RestApi/Data/datafilters
            };
            queryParams = [
                {
                    parameterName: 'value1',
                    value: 'Athletic Trainer',
                },
            ];
            params.params = JSON.stringify(queryParams); //Params query string parameter
            CustomQueryResponse = JSON.parse(await vvClient.customQuery.getCustomQueryResultsByName('TestCustomQuery3', params));
            response.json(200, CustomQueryResponse);
            break;
        case 4:
            //For Rocky – Custom query using SQL Parameters and Order By NewID() to get a Random sampling of records filtered using SQL Parameters.
            //Custom Query using SQL Parameter to Get Random License IDs for specified License Type
            //SELECT TOP 20 [Form ID] FROM [License Application] WHERE [Professional License Type] = @value1 ORDER BY NewId()
            //Query name = TestCustomQuery4
            params = {};
            queryParams = [
                {
                    parameterName: 'value1',
                    value: 'Athletic Trainer',
                },
            ];
            params.params = JSON.stringify(queryParams); //Params query string parameter
            CustomQueryResponse = JSON.parse(await vvClient.customQuery.getCustomQueryResultsByName('TestCustomQuery4', params));
            response.json(200, CustomQueryResponse);
            break;
    }
};