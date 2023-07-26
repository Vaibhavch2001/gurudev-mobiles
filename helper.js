exports.notifyChange = async (message) => {
  twilio = require("twilio");
  const client = new twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
  client.messages.create({
    from: process.env.TWILIO_PHONE_NUMBER,
    to: "+91" + process.env.TARGET_PHONE_NUMBER,
    body: message,
  });
};
