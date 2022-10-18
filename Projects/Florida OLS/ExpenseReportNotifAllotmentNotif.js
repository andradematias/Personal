var logger = require('../log');
var Q = require('q');
var moment = require('moment');

module.exports.getCredentials = function () {
    var options = {};
    options.customerAlias = "FloridaOLS";
    options.databaseAlias = "Main";
    options.userId = "FLOLS.Api";
    options.password = "wj5ElsuSNdy9EMU";
    options.clientId = "9633a162-4d0f-4752-8c03-096fbe71bc97";
    options.clientSecret = "JgLW78Q2AlBr5HXJs9Xqfog1eKd+i/C0szcCZLokN38=";
    return options;
};

module.exports.main = function (vvClient, response, token) {
    /* Script Name:   ExpenseReportNotifAllotmentNotif
       Customer:      Florida OLS
       Purpose:       Purpose of this script is to send an allotment notification to members who should receive an allotment memo on the last business day of the quarter.
       Parameters:    The following represent variables passed into the function: None
  
       Return Array:  The following represents the array of information returned to the calling function.  This is a standardized response.
                      - Message will be sent back to VV as part of the ending of this scheduled process.
       Pseudocode:    The following documents the pseudo code for this process.
                    1. Figure out if today is a weekday. Only continue if it is.
                    2. Calculate the current quarter's last day. 
                        i. Is today 1-14 days (configurable) before the EOQ? 
                        ii. If yes, continue. 
                        iii. If no, end the process with the appropriate response. 
                    3. Find all members with an active allotment this quarter.
                    4. Query Communication Logs to determine which members haven't received this notification.
                    5. Loop through each member who hasn't received this notification and post a Communication Log for each one in turn.
                    6. If no errors were logged until now, log a message that the process completed successfully.
                    7. If any non-process-stopping errors occurred during the process, or if the process completed successfully, post a digest communication log.
                        i. If any stopping errors occurred, a digest communication log will not be posted but the error will be returned as a messsage to VV.
             
       Date of Dev:   06/03/2019
       Last Rev Date: 05/01/2021
  
       Revision Notes:
       06/03/2019 - Kendra Austin:  Initial creation of the business process.
       05/01/2021 - Michael Rainey: Update to call the LibEmailGenerateAndCreateCommunicationLog process.
  
       */

    logger.info('Start of the process ExpenseReportNotifAllotmentNotif at ' + Date());

    response.json('200', 'Process started, please check back in this log for more information as the process completes.');

    //CONFIGURABLE VARIABLES
    //var dateToday = new Date('06/24/2019');                                     //VARIABLE USED FOR TESTING. Comment this variable out and remove as an argument from today below in order to use today's actual date. 
    var today = moment();                                                       //Holds the date this script is running. Pass in dateToday as an argument to run on a day other than today. 

    var daysBeforeEOQStart = 14;                                                 //Minimum number of days before quarter end that notifications will be sent
    var daysBeforeEOQEnd = 1;                                                   //Maximum number of days before quarter end that notifications will be sent                                        
    var useTestEmail = 0;                                               //If 1, uses the test email list. If 0, uses the actual email addresses for groups below and vvsupport.
    // var testEmailList = 'kendra.austin@visualvault.com';                //Test email list for development purposes. PRODUCTION
    var testEmailList = 'patricio.rodriguez@visualvault.com';                //Test email list for development purposes.
    var groupsParamObj = [
        {
            name: 'groups',
            value: ['OLS Staff']                    //Groups that will receive an error log via email if one was generated.
        }
    ];

    var emailStandardTemplateName = 'Expense Report Allotment Notification Standard';
    var emailERRORTemplateName = 'Expense Report Allotment Notification Error';

    let ReportQuarterToken = '[Report Quarter]'
    let ReportYearToken = '[Report Year]'
    let DateToken = '[Date]'
    let ErrorToken = '[Errors]'

    //Declare variables to hold the quarter and year we want to find allotments in
    var currentQuarter = moment(today).quarter();                        //Get the current quarter. Returns a number 1-4
    var reportYear = moment(today).year();                        //Get the current year. Returns a 4-digit number
    var reportQuarter = '';                                 //This goes in the email subject line, so needs to be formatted as a readable string, done below.

    if (currentQuarter == 4) {
        reportQuarter = '4th Quarter';
    }
    else if (currentQuarter == 1) {
        reportQuarter = '1st Quarter';
    }
    else if (currentQuarter == 2) {
        reportQuarter = '2nd Quarter';
    }
    else if (currentQuarter == 3) {
        reportQuarter = '3rd Quarter';
    }


    let DateTokenValue = moment().format('LL')
    let ReportQuarterTokenValue = reportQuarter
    let ReportYearTokenValue = reportYear

    //var emailSubjectStart = 'Quarterly Allotment for ';             //Important that the subject line is the same for both types of communication logs sent from this process.
    //var emailSubject = emailSubjectStart + reportQuarter + ' ' + reportYear;
    //var emailBody = moment().format('LL') + '<br><br>Based on our records of current active allotments, you will receive an official allotment memo on the last business day of this quarter. ';
    //emailBody += 'That memo will include allotment amounts for each month of the quarter and a total for the entire quarter. Please ensure that you have started your expense report and that it is submitted by the deadline.';
    //emailBody += '<br><br>While our office will assist you with the reporting requirements of these federal regulations, we recommend that you consult your personal tax preparer for recommendations regarding the application of these regulations.';

    //END OF CONFIGURABLE VALUES


    //Other globally used variables.
    var errorLog = [];              //Array for capturing error messages that may occur.
    var membersWithAllotmentsThisQuarter = [];          //Used the hold the array of active members with allotments this quarter, to check that all have received this notification via Communication Log
    var membersWithoutRemindersThisQuarter = [];       //Used to hold the array of active members with allotments last quarter, where a Communication Log was not found.

    //Function to get email recipients based on Member ID, then create the communication log
    var createCommunicationLog = function (memberId) {
        //reportId will not be passed in if it does not exist.

        //initialize the return object
        var commLogResults = [];
        var emails = '';                        //This will hold the email list as it is built out. 
        var siteId = '';                        //This will be used to hold the site ID of the member site. 
        var commFormID = '';                 //This will be used to hold the form ID  of the created communiation log after posting

        //Set up the query to get the site ID and users
        var siteParams = {};
        siteParams.q = "name eq '" + memberId + "'";
        siteParams.fields = 'id, name, enabled';

        //Get the site ID for the member site
        return vvClient.sites.getSites(siteParams).then(function (siteResp) {
            var sitesRes = JSON.parse(siteResp);
            if (sitesRes.meta.status === 200) {
                if (sitesRes.data.length == 1) {
                    siteId = sitesRes.data[0].id;
                }
                else if (sitesRes.data.length == 0) {
                    throw new Error('The site could not be found for ' + memberId + ".");
                }
                else {
                    throw new Error('Mulitple sites found for ' + memberId + ". This is an invalid state. Please contact support.");
                }
            }
            else {
                throw new Error('An error occurred when trying to get the site ID for ' + memberId + ".");
            }
        }).then(function () {
            //Get all users assigned to the member site. 
            var userParams = {};

            return vvClient.users.getUsers(userParams, siteId).then(function (userResp) {
                var usersRes = JSON.parse(userResp);
                if (usersRes.meta.status === 200) {
                    if (usersRes.data.length > 0) {
                        usersRes.data.forEach(function (user) {
                            //Only build the email list from enabled users.
                            if (user.enabled == true) {
                                if (emails == '') {
                                    emails = user.emailAddress;
                                }
                                else {
                                    emails = emails + ',' + user.emailAddress;
                                }
                            }
                        });
                    }
                    else {
                        throw new Error('The call to get users from the site ' + memberId + " returned with no active users.");
                    }
                }
                else {
                    throw new Error('The call to get users from the site ' + memberId + " returned with an error.");
                }
            });
        }).then(function () {
            //Post the communication log

            let tokenArr = [
                { name: ReportQuarterToken, value: ReportQuarterTokenValue },
                { name: ReportYearToken, value: ReportYearTokenValue },
                { name: DateToken, value: DateTokenValue }
            ];

            //{ name: 'Email Address', value: emailList.join(',') },
            let emailRequestArr = [
                { name: 'Email Name', value: emailStandardTemplateName },
                { name: 'Tokens', value: tokenArr },
                { name: 'Email Address', value: emails },
                { name: 'Email AddressCC', value: '' },
                { name: 'SendDateTime', value: '' },
                { name: 'RELATETORECORD', value: [memberId] },
                {
                    name: 'OTHERFIELDSTOUPDATE', value:
                    {
                        'MemberID': memberId,
                        'RecordID': memberId
                    }
                }
            ];

            logger.info("Calling LibEmailGenerateAndCreateCommunicationLog service");
            return vvClient.scripts.runWebService('LibEmailGenerateAndCreateCommunicationLog', emailRequestArr).then(function (emailResp) {
                if (emailResp.meta['status'] === 201) {
                    logger.info("Email listing errors that occurred during the UserManagementJoin process was sent successfully.");
                    commFormID = emailResp.data[2];
                }
                else {
                    throw new Error("Email could not be sent to " + memberId + ". This process returned with an error.");
                }
            });
        }).then(function () {
            commLogResults[0] = 'Success';
            commLogResults[1] = commFormID;
            return commLogResults;
        }).catch(function (err) {
            logger.info(JSON.stringify(err));

            commLogResults[0] = 'Error';

            if (err && err.message) {
                commLogResults[1] = err.message;
            } else {
                commLogResults[1] = "An unhandled error has occurred. The message returned was: " + err;
            }
            return commLogResults;
        });
    }

    //Function to get email addresses of OLS users and post a daily digest comm log with a process completion report.
    var postCompletionReport = function () {
        var errorEmailList = '';        //Holds the list of email addresses to notify of any errors that occur during this process.
        var errorLogResults = [];          //Initialize the return array
        var errorEmailBody = '';
        var errorEmailRecipients = testEmailList;        //Initialize this to the test email list. Will replace it with errorEmailList later if needed.

        //First get the email addresses of users in the groups defined in configurable variables above. 
        return vvClient.scripts.runWebService('LibGroupGetGroupUserEmails', groupsParamObj).then(function (userInfoResponse) {
            if (userInfoResponse.meta.status === 200) {
                if (userInfoResponse.hasOwnProperty('data')) {
                    if (userInfoResponse.data[2] != 'undefined') {
                        var userInfo = userInfoResponse.data[2];
                        //Extract email information for use to send an email.  Place in a comma separated variable.
                        userInfo.forEach(function (user) {
                            if (user.hasOwnProperty('emailAddress')) {
                                if (errorEmailList != '') {
                                    errorEmailList += ',';
                                }
                                errorEmailList += user['emailAddress'];
                            }
                        });
                    }
                    else {
                        throw new Error("The call to Get Group User Emails returned successfully, but the data could not be accessed.");
                    }
                }
                else {
                    throw new Error("The call to Get Group User Emails returned successfully, but the data was not returned.");
                }
            }
            else {
                throw new Error("An error was encountered when calling the Get Group User Emails process. The status returned was: " + userInfoResponse.meta.status +
                    ". The status message returned was: " + userInfoResponse.meta.statusMsg);
            }
        }).then(function () {
            //Send an email to OLS Staff group members and VV Support. 
            errorLog.forEach(function (error) {
                errorEmailBody += '<br>' + error;
            });

            if (useTestEmail == 0) {
                errorEmailRecipients = errorEmailList;
            }

            let ErrortokenArr = [
                { name: ErrorToken, value: errorEmailBody }
            ];

            //{ name: 'Email Address', value: emailList.join(',') },
            let ErroremailRequestArr = [
                { name: 'Email Name', value: emailERRORTemplateName },
                { name: 'Tokens', value: ErrortokenArr },
                { name: 'Email Address', value: errorEmailRecipients },
                { name: 'Email AddressCC', value: '' },
                { name: 'SendDateTime', value: '' },
                { name: 'RELATETORECORD', value: [] },
                { name: 'OTHERFIELDSTOUPDATE', value: { 'MemberID': '','RecordID': ''}}
            ];

            logger.info("Calling LibEmailGenerateAndCreateCommunicationLog service");
            return vvClient.scripts.runWebService('LibEmailGenerateAndCreateCommunicationLog', ErroremailRequestArr).then(function (emailErrorResp) {
                if (emailErrorResp.meta['status'] === 201) {
                    logger.info("Email listing errors that occurred during the UserManagementJoin process was sent successfully.");
                    commFormID = emailErrorResp.data[2];
                }
                else {
                    throw new Error("Email could not be sent to " + memberId + ". This process returned with an error.");
                }
            });
        }).then(function () {
            errorLogResults[0] = 'Success';
            return errorLogResults;
        }).catch(function (err) {
            logger.info(JSON.stringify(err));

            errorLogResults[0] = 'Error';

            if (err && err.message) {
                errorLogResults[1] = err.message;
            } else {
                errorLogResults[1] = "An unhandled error has occurred. The message returned was: " + err;
            }
            return errorLogResults;
        });
    }


    //START OF MAIN CODE

    //Start the promise chain
    var result = Q.resolve();

    return result.then(function () {
        //Figure out if today is a weekday.
        var dayOfWeek = moment(today).day();                 //returns a number 0-6, where 0 is Sunday and 6 is Saturday

        if (dayOfWeek > 0 && dayOfWeek < 6) {
            //Today is a weekday.
            logger.info('Today is a weekday. Continuing the process by finding active members with an active allotment this quarter.');
        }
        else {
            //Stop the process and throw an error if it's not a weekday. No need to continue the process.
            throw new Error('Today is not a weekday. This process only runs on business days.');
        }
    }).then(function () {
        //Calculate the current quarter's last day. Is today 1-14 days (configurable) before the EOQ? If yes, continue. If no, end the process with the appropriate response. 
        var endOfQuarter = moment(today).endOf('quarter');
        var daysBeforeEOQ = endOfQuarter.diff(today, 'days') + 1;       //How many days before EOQ is today?

        if (daysBeforeEOQ > daysBeforeEOQStart || daysBeforeEOQ < daysBeforeEOQEnd) {
            //Throw an error because it's not time for this process to run.
            throw new Error('The current date is not between ' + daysBeforeEOQEnd + ' and ' + daysBeforeEOQStart + ' days before the end of the quarter.');
        }
    }).then(function () {
        //If an error was not thrown in the previous step, then continue the process by finding members with an active allotment
        var quarterStart = moment(today).startOf('quarter');        //Set a date to the beginning of the quarter
        var quarterStartFormatted = moment(quarterStart).format('L');   //Format as a string for the query
        var quarterEnd = moment(today).endOf('quarter');          //Set a date to the end of the quarter
        var quarterEndFormatted = moment(quarterEnd).format('L');       //Format as a string for the query


        //Run a query to get all active members with allotments this quarter.
        var allotmentQueryFilter = {
            filter: "(([Term End Date] >= '" + quarterStartFormatted + "' AND [Term End Date] <= '" + quarterEndFormatted + "')" +
                " OR ([Elected Date] >= '" + quarterStartFormatted + "' AND [Elected Date] <= '" + quarterEndFormatted + "')" +
                " OR ([Elected Date] <= '" + quarterStartFormatted + "' AND [Term End Date] >= '" + quarterEndFormatted + "'))"
        };

        //Add to the filter only allotments that were active this quarter.
        allotmentQueryFilter.filter += " AND (([End Date] >= '" + quarterStartFormatted + "' AND [End Date] <= '" + quarterEndFormatted + "')" +
            " OR ([Start Date] >= '" + quarterStartFormatted + "' AND [Start Date] <= '" + quarterEndFormatted + "')" +
            " OR ([Start Date] <= '" + quarterStartFormatted + "' AND [End Date] >= '" + quarterEndFormatted + "'))";


        return vvClient.customQuery.getCustomQueryResultsByName('Expense Report Not Received Members', allotmentQueryFilter).then(function (queryResp) {
            var memberResp = JSON.parse(queryResp);
            if (memberResp.meta.status === 200) {
                if (memberResp.data.length > 0) {
                    logger.info('Found ' + memberResp.data.length + ' active member allotments this quarter.');
                    //Build a list of distinct member IDs with this info.
                    memberResp.data.forEach(function (member) {
                        var memberFound = false;

                        if (membersWithAllotmentsThisQuarter.length == 0) {
                            membersWithAllotmentsThisQuarter.push(member);
                        }
                        else {
                            membersWithAllotmentsThisQuarter.forEach(function (id) {
                                if (id['member ID'] == member['member ID']) {
                                    memberFound = true;
                                }
                            });

                            if (memberFound == false) {
                                membersWithAllotmentsThisQuarter.push(member);
                            }
                        }

                    });
                }
                else {
                    throw new Error("No active members with allotments were found during this quarter.");
                }
            }
            else {
                throw new Error("An error occurred while querying for active members with allotments.");
            }
        });
    }).then(function () {
        //Take the array membersWithAllotmentsThisQuarter, get a query on Comm Logs, and determine which members haven't received this notification
        //Filter into membersWithoutRemindersThisQuarter
        var commLogQueryFilter = {
            filter: "[Subject] = '" + emailSubject + "'"
        };

        return vvClient.customQuery.getCustomQueryResultsByName('Expense Report Not Received Communication Logs', commLogQueryFilter).then(function (formQueryResp) {
            var commLogResp = JSON.parse(formQueryResp);
            if (commLogResp.meta.status === 200) {
                if (typeof commLogResp.data != 'undefined') {
                    //Loop through membersWithAllotmentsThisQuarter and find each one's reminder in commLogResp.data
                    //If a notification wasn't found, add the member to membersWithoutRemindersThisQuarter
                    membersWithAllotmentsThisQuarter.forEach(function (unRemindedMember) {
                        var notifFound = false;        //Assume the notif won't be found

                        commLogResp.data.forEach(function (commLog) {
                            if (commLog['memberID'] == unRemindedMember['member ID']) {
                                notifFound = true;
                            }
                        });

                        //If, after looping through all the query results, the member is found not to have a Comm Log reminder, add them to membersWithoutRemindersThisQuarter
                        if (notifFound == false) {
                            membersWithoutRemindersThisQuarter.push(unRemindedMember);
                        }
                    });
                }
                else {
                    throw new Error("The call to find communication logs regarding this quarter's allotment memo reminders returned successfully, but the data could not be accessed.");
                }
            }
            else {
                throw new Error("An error occurred while querying for communication logs.");
            }
        });
    }).then(function () {
        //At this point, membersWithoutRemindersThisQuarter should be a list of all unique members who need a comm log posted. 
        //Loop through and process each one in turn.
        if (membersWithoutRemindersThisQuarter.length > 0) {

            var processLateNotifs = Q.resolve();

            membersWithoutRemindersThisQuarter.forEach(function (memberToRemind) {
                processLateNotifs = processLateNotifs.then(function () {
                    return createCommunicationLog(memberToRemind['member ID']).then(function (notifSent) {
                        if (notifSent[0] == 'Success') {
                            //Good things
                            logger.info('Member ' + memberToRemind['member ID'] + ' was sent a reminder that they will receive an allotment memo at the end of this quarter.');
                        }
                        else if (notifSent[0] == 'Error') {
                            errorLog.push('An error occurred when processing the allotment memo reminder for ' + memberToRemind['member ID'] + '. The error returned was: ' + notifSent[1]);
                        }
                    });
                });
            });

            return processLateNotifs;
        }
        else {
            errorLog.push('No allotment memo reminders need to be sent to members who have not yet received one.');
        }
    }).then(function () {
        //If no errors were logged during the process, then push a message that everything went well.
        if (errorLog.length == 0) {
            errorLog.push('This process completed successfully with no errors.');
        }

        return postCompletionReport().then(function (reportResp) {
            if (reportResp[0] == 'Success') {
                logger.info('The process has completed, and a digest report has been generted in the form of a communication log.');
            }
            else if (reportResp[0] == 'Error') {
                throw new Error('The process completed, but a digest report was not generated. The error returned was: ' + reportResp[1]);
            }
            else {
                throw new Error('The process completed, but a digest report was not generated. An unhandled error was returned.');
            }
        });
    }).then(function () {
        //If the process reaches this step, then a digest communication log was posted with a completion report, so return success.
        return vvClient.scheduledProcess.postCompletion(token, 'complete', true, 'Process completed successfully');
    }).catch(function (err) {
        //If any other errors were returned along the way, note those using logger.info. Can't send them all back with the response to VV b/c of length.
        if (errorLog.length > 0) {
            errorLog.forEach(function (issue) {
                logger.info(issue);
            });

            if (errorLog.length == 1) {
                //If only one error was logged, it's probably a general message. Include it in the response.
                return vvClient.scheduledProcess.postCompletion(token, 'complete', true, 'Error encountered during processing.  Error was ' + err + ' ' + errorLog[0]);
            }
            else {
                //Otherwise send back the single stopping error that was encountered, with a note that other errors were logged.
                return vvClient.scheduledProcess.postCompletion(token, 'complete', true, 'Error encountered during processing.  Error was ' + err + ' Additional errors were encountered and logged.');
            }

        }
        else {
            //Send back the single stopping error that was encountered.
            return vvClient.scheduledProcess.postCompletion(token, 'complete', true, 'Error encountered during processing.  Error was ' + err);
        }
    });
};
