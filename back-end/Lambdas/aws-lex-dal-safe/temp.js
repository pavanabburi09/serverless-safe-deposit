const {PubSub} = require('@google-cloud/pubsub');
const fs = require('fs')
const {Storage} = require('@google-cloud/storage');
const pubSubClient = new PubSub();
var AWS = require('aws-sdk');
const storage = new Storage();



function createTopic(topicName) {
    pubSubClient.createTopic(topicName);
    console.log(`Topic ${topicName} created.`);
}



async function createPushSubscription(subscriptionName) {
    let topicName ='chat';
    const options = {
        pushConfig: {
            pushEndpoint: `https://${pubSubClient.projectId}.appspot.com/push`,
        },
    };



    await pubSubClient
        .topic(topicName)
        .createSubscription(subscriptionName, options);
    console.log(`Subscription ${subscriptionName} created.`);
}



exports.handler = (event) => {
    try{

        createPushSubscription().catch(console.error);
        createTopic('mueed')
    }catch(ex){
        console.log(ex)
    }
};