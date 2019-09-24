var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var BearerSchema = new Schema({
  token: String,
});

var BearerToken = mongoose.model("BearerToken", BearerSchema);
module.exports = BearerToken;