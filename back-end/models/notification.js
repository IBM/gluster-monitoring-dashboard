var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var NotificationSchema = new Schema({
    name: String,
    settings: JSON,
    events: Array
});

var Notification = mongoose.model("Notification", NotificationSchema);
module.exports = Notification;