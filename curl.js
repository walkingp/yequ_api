var https = require("https");

// Utility function that downloads a URL and invokes
// callback with the data.
function download(url, callback) {
  var options = {
    url,
    headers: {
      "Content-Type": "text/html",
      "Content-Encoding": "identity",
      Charset: "utf-8",
    },
  };
  https
    .get(options, function (res) {
      var data = "";
      res.on("data", function (chunk) {
        data += chunk;
      });
      res.on("end", function () {
        callback(data);
      });
    })
    .on("error", function () {
      callback(null);
    });
}

exports.download = download;
