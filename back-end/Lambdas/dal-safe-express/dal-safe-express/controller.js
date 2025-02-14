const USERS_TABLE = process.env.USERS_TABLE;
const AWS = require("aws-sdk");
const dynamoDbClient = new AWS.DynamoDB.DocumentClient();
const {v4: uuid} = require('uuid');
const ATTR = require("dynamodb-data-types").AttributeValue
const db = new AWS.DynamoDB();
const transactionsTable = "user-transactions-dal-safe"


exports.welcomeUser = (req, res) => {
    res.status(200).send("Hello User! Welcome to Dal Safe Express!")
}

exports.getUserByEmail = async (req, res, next, id) => {
    const params = {
        TableName: USERS_TABLE,
        Key: {
            email: id.toString(),
        },
    };

    if (!id) {
        return res.status(404).json({
            message: "No Id found in the request",
            operation: "failure"
        })
    }
    try {
        const {Item} = await dynamoDbClient.get(params).promise();
        if (Item) {
            req.user = Item;
            next(); //pass the baton to express!
        } else {
            res.status(404).json(
                {
                    message: 'Invalid User ID',
                    error: 'Could not find user for given email',
                    operation: 'failure'
                }
            );
        }
    } catch (error) {
        console.log(error);
        res.status(500).json(
            {
                message: "Failed to get the user due to some error",
                error,
                operation: 'failure'
            }
        );
    }
}

exports.getUserDetails = async (req, res) => {
    if (!req.user) {
        res.status(500).json(
            {
                message: "No User found",
                error: "Failed to get the user due to some error",
                operation: 'failure'
            }
        );
    } else {
        const {email, boxNumber} = req.user;
        let accountBalance = req.user.accountBalance;
        if (!accountBalance) {
            accountBalance = "0";
        }
        res.status(200).json({email, boxNumber, accountBalance});
    }
}

exports.loginUser = async (req, res) => {
    const {email} = req.body;
    const currentLocaleString = new Date().toLocaleString();
    const params = {
        TableName: USERS_TABLE,
        Key: {
            email: email
        },
        UpdateExpression: 'set loginStatus = :loginStatusValue, lastLoginTime = :lastLoginTimeValue',
        ExpressionAttributeValues: {
            ':loginStatusValue': "YES",
            ':lastLoginTimeValue': currentLocaleString.toString()
        }
    }
    // Run the db command.
    try {
        const response = await dynamoDbClient.update(params).promise();
        res.status(200).json({
            message: "Successfully logged in the user!!!",
            response,
            operation: 'success'
        })
    } catch (error) {
        console.log("Error updating the login time")
        res.status(500).json({
            message: "Internal Server Error: Failed to logout the user",
            error,
            operation: 'failure'
        })
    }
}

exports.logoutUser = async (req, res) => {
    const {email} = req.body;
    const currentLocaleString = new Date().toLocaleString();
    const params = {
        TableName: USERS_TABLE,
        Key: {
            email: email
        },
        UpdateExpression: 'set loginStatus = :loginStatusValue, lastLogoutTime = :lastLogoutTimeValue',
        ExpressionAttributeValues: {
            ':loginStatusValue': "NO",
            ':lastLogoutTimeValue': currentLocaleString.toString()
        }
    }
    // Run the db command.
    try {
        await dynamoDbClient.update(params).promise();
        res.status(200).json({
            message: "Successfully logged out the user!!!",
            operation: 'success'
        })
    } catch (error) {
        console.log("Error updating the login time")
        res.status(500).json({
            message: "Internal Server Error: Failed to logout the user",
            error,
            operation: 'failure'
        })
    }
}

/*Transactions Controllers!*/
const unwrapItems = (data) => {

    if (Array.isArray(data)) {
        return data.map(item => (ATTR.unwrap(item)))
    } else {
        return null;
    }
}

exports.getAllTransactions = async (req, res) => {

    const params = {TableName: transactionsTable };

    db.scan(params, (err, data) => {
        if (err) {
            console.log(err);
            return res.status(400).json({
                message: "Failed to get all the transactions details",
                error: err,
                operation: "failure"
            })
        } else {
            const dataUpdated = unwrapItems(data.Items);
            return res.status(200).json({
                message: "Found the list of the transactions details",
                data: dataUpdated,
                operation: "success"
            })
        }
    })

}

exports.getTransactionsForAUser = async  (req, res) => {
    const {email} = req.params;
    const params = {
        TableName: transactionsTable,
        FilterExpression: 'email = :emailValue',
        ExpressionAttributeValues: {
            ':emailValue': email
        },
    };
    try {

        const result = await dynamoDbClient.scan(params).promise();
        return res.status(200).json({
            message: "Found the list of the transactions for the user with email " + email,
            data: result.Items,
            operation: "success"
        })

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            message: "Failed to get all the transactions of the user with email " + email,
            error: error,
            operation: "failure"
        })
    }
}

async function updateTransactions(user, currentAccountBalance, newBalance, type, actionAmount) {

    const {email, boxNumber} = user;
    const currentLocaleString = new Date().toLocaleString();
    const currentBalanceInt = parseInt(currentAccountBalance)
    const newBalanceInt = parseInt(newBalance);
    const transactionAmount = parseInt(actionAmount);
    const params = {
        TableName: transactionsTable,
        Item: {
            transactionId: {S: uuid()},
            email: {S: email.toString()},
            boxNumber: {S: boxNumber || "null"},
            timeStamp: {S: currentLocaleString || "null"},
            balanceBefore: {N: currentBalanceInt.toString()},
            balanceAfter: {N: newBalanceInt.toString()},
            transactionType: {S: type},
            transactionAmount: {N: transactionAmount.toString()}
        }
    }

    try {
        console.log("In Creating new Transaction" + params)
        const response = await db.putItem(params).promise();

    } catch (e) {
        console.log(e)
    }

}

exports.updateBalance = async (req, res) => {

    if (!req.user) {
        res.status(500).json(
            {
                message: "No User found",
                error: "Failed to get the user due to some error",
                operation: 'failure'
            })
    }
    const {email, accountBalance: currentAccountBalance} = req.user;
    const {type, newBalance, actionAmount} = req.body;
    const params = {
        TableName: USERS_TABLE,
        Key: {
            email: email
        },
        UpdateExpression: 'set accountBalance = :accountBalanceValue',
        ExpressionAttributeValues: {
            ':accountBalanceValue': newBalance
        }
    }

    // Run the db commands
    try {
        const response = await dynamoDbClient.update(params).promise();
        const transactionResponse = await updateTransactions(req.user, currentAccountBalance, newBalance, type, actionAmount);
        res.status(200).json({
            message: `Successfully ${type}ed the account!`,
            operation: 'success'
        })

    } catch (error) {
        console.log("Error" + error);
        console.log(JSON.stringify(error));
        res.status(500).json({
            message: "Internal Server Error: Failed to update the account balance for the user",
            error,
            operation: 'failure'
        })
    }
}
