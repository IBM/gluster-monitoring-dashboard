var Slack = require('slack-node');

class SlackNotify {
    constructor (webhook, channel, username){
        this.webhook = webhook
        this.channel = channel
        this.username = username
        this.slack = new Slack();
        this.slack.setWebhook(webhook)
    }

    updateWebhook (webhook) {
        this.slack.setWebhook(webhook)
    }

    sendNotification (message) {
        this.slack.webhook({
            channel: this.channel,
            username: this.username,
            text: message
        }, function(err, response) {
            console.log(response)
            if (err) {
                console.log(err)
            }
        });
    }
}

class Notify {
    constructor (rules) {
        this.rules = rules;
        if (rules) {
            this.updateIntegrations(rules)
        }
        this.options = [ { name: "Slack", settings: { username: "", channel: "", message: "", webhook: "" } } ]
    }

    updateIntegrations (settings) {
        for (var i = 0; i < settings.length; i++) {
            switch (settings[i].name) {
                case 'Slack':
                  this.slack = new SlackNotify(settings[i].settings.webhook, settings[i].settings.channel, settings[i].settings.username)
            }
        }
    }

    updateSettings (settings) {
        this.settings = settings
        this.updateIntegrations(settings)
    }

    getRules () {
        return this.settings
    }

    getOptions () {
        return this.options
    }

    ingest (event) {
        for (var i = 0; i < this.settings.length; i++) {
            if(this.settings[i].events.includes(event.event)) {
                switch (this.settings[i].name) {
                    case 'Slack':
                      this.slack.sendNotification("Event: " + event.event + " triggered.\n\nEvent Details:\n\tNodeID: " + event.nodeid + "\n\tTime Stamp: " + event.created_at + "\n\tDetails: " + JSON.stringify(event.message) + "\n\n" + this.settings[i].settings.message)
                }
            }
        }
    }
}

module.exports.Notify = Notify