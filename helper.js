const axios = require("axios");

exports.notifyChange = async (message) => {
  const encodedParam = encodeURIComponent(message);

  const url = `https://api.telegram.org/bot${process.env.BOT_ID}/sendMessage?chat_id=${process.env.CHAT_ID}&text=${encodedParam}`;
  axios
    .get(url)
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};
