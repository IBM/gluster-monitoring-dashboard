var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var EventSchema = new Schema({
  nodeid: String,
  ts: String,
  event: String,
  message: JSON,
  created_at: String
});

var Event = mongoose.model("Event", EventSchema);
module.exports = Event;