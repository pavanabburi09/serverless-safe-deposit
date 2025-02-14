const {region, tables} = require('./config')
const AWS = require("aws-sdk");
AWS.config.update({region})
const dynamoDbClient = new AWS.DynamoDB.DocumentClient();


const getUserDetails = async (email) => {
    const params = {
        TableName: tables.users,
        Key: {
            email: email.toString(),
        },
    };
    try {
        const {Item} = await dynamoDbClient.get(params).promise();
        if (Item) {
            return {
                email: Item.email,
                accountBalance: Item.accountBalance,
                boxNumber: Item.boxNumber,
                loginStatus: Item.loginStatus,
                status: 200
            }
        } else {
            return {
                message: "No User Found for this given email address! You Can register by visiting our Sign up form! Its top left on the website!",
                status: 404
            };
        }
    } catch (error) {
        console.log(error);
        return {
            message: "No User Found for this given email address!",
            status: 404
        };
    }
}


module.exports = {getUserDetails}


