module.exports.lexApp = async (event, context) => {

    const {getUserDetails} = require('./logicManager')

    console.log(event);
    const intent = event['currentIntent']['name'];
    const email = event['currentIntent']['slots']['email'];
    let returnResponse = {
        "dialogAction": {
            "type": "Close",
            "fulfillmentState": "Fulfilled",
            "message": {
                "contentType": "PlainText",
                "content": "No content"
            },
        }
    };

    if (email) {
        try {
            const response = await getUserDetails(email);
            if (response.status === 404) {
                returnResponse['dialogAction']['message']['content'] = response.message;
                return returnResponse;
            }
            const {
                email: userEmail,
                accountBalance,
                boxNumber,
                loginStatus
            } = response;

            if (intent !== "checkUserStatus" && loginStatus !== "YES") {
                returnResponse['dialogAction']['message']['content'] = 'Hey You are not logged in to our systems! Please login and try'
                return returnResponse;
            }
            switch (intent) {
                case 'checkUserStatus':
                    returnResponse['dialogAction']['message']['content'] = `Hey User, We found your email ${userEmail} and you are a registered User..!`
                    break;
                case 'accountEnquiry':
                    const bal = accountBalance === undefined ? "Not found" : accountBalance
                    returnResponse['dialogAction']['message']['content'] = `Hey User, The Balance in your account is ${bal}`
                    break;
                case 'getDepositBoxNumber':
                    returnResponse['dialogAction']['message']['content'] = `Hey User, The Box Number is ${boxNumber} `
                    break;
                default:
                    returnResponse['dialogAction']['message']['content'] = `Hey User,No requested details found in our systems! Please try again`
            }
        } catch (e) {
            console.log("Error Message: " + e.message)
            returnResponse['dialogAction']['message']['content'] = `Hey User,Our systems are facing some issues. Please try again`
        }
    }

    return returnResponse;
};
