/*
* Title: Notifications Library
* Description: Important utilities for sending notifications
* Author: Rayhan Al Shorif
* Date: 30/04/2023
*/



// Dependencies
const { twilio } = require('../helpers/environment');
const client = require('twilio')(twilio.accountSid, twilio.authToken);

// module scaffolding
const notifications = {};

// send sms to user using twilio api

notifications.sendTwilioSms = (phone, msg, callback) => {
    // input validation
    const userPhone = typeof phone === 'string' && phone.trim().length === 11 ? phone.trim() : false;
    const userMsg = typeof msg === 'string' && msg.trim().length > 0 && msg.trim().length <=1600 ? msg : false;


    if(userPhone && userMsg){
    client.messages
        .create({
            body: userMsg,
            to: `+88${userPhone}`,  // Text this number
            from: twilio.fromPhone, // From a valid Twilio number
        })
        .then((message) => 
            callback(false)
            )
        .catch((err) =>
            callback(err)
        );

    }else{
        callback("Given parameters were missing or invalid!");
    }

};


module.exports = notifications;