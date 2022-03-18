
// vvClient.users.postUsers(userParams, newUserObject, SiteGUID) 
// The postUsers function allows you to create new users.
// The Param item is a null object that you pass to the function. 
// The DataObject includes an object that has items representing the items required to create a user.
// The SiteGUID is the GUID of the site where you want to create the user.The SiteGUID can be acquired using the getSites function. 

//Load the GUID for the site. This can be acquired from getSites function. 
var siteID;

//Add this variables in Configurable Variables
const passwordChars = "ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789!@#%^&*()_+";
const passwordLength = 8;

//Add this function in Helper Functions
function randomPassword(passwordLength) {
    let text = "";

    for (let i = 0; i < passwordLength; i++)
        text += passwordChars.charAt(Math.floor(Math.random() * passwordChars.length));

    return text;
};

//Empty Object
let userParams = {};

//Random password is generated
let pass = randomPassword(passwordLength);

const newUserObject = {
    userid: "test123456",
    firstName: "test",
    middleInitial: "test",
    lastName: "test",
    emailaddress: "test@onetree.com",
    password: pass,
    mustChangePassword: "false"
};

const userResp = await vvClient.users
    .postUsers(userParams, newUserObject, siteID)
    .then((res) => parseRes(res))
    .then((res) => checkMetaAndStatus(res, shortDescription))
    .then((res) => checkDataPropertyExists(res, shortDescription))
    .then((res) => checkDataIsNotEmpty(res, shortDescription));

const userID = userResp.data.id;
