const FormData = require("form-data");
const fs = require("fs");
const axios = require("axios");

const data = new FormData();
data.append(
  "image",
  fs.createReadStream("21737-cystic-acne-694069284.jpg")
);
data.append("max_face_num", "8");
data.append("face_field", "color,smooth,acnespotmole");

const options = {
  method: "POST",
  url: "https://skin-analysis.p.rapidapi.com/face/effect/skin_analyze",
  headers: {
    "X-RapidAPI-Key": "28ea89173amshbd47bbc1b2e04d9p155d8ajsnc8c90f2458a9",
    "X-RapidAPI-Host": "skin-analysis.p.rapidapi.com",
    ...data.getHeaders(),
  },
  data: data,
};

axios
  .request(options)
  .then(function (response) {
    console.log(response.data);
  })
  .catch(function (error) {
    console.error(error);
  });
