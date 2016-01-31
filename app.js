// heavily based on https://github.com/lmammino/norrisbot

var express = require('express');
var bodyParser = require('body-parser');
var util = require('util');
//var path = require('path');
//var fs = require('fs');
//var SQLite = require('sqlite3').verbose();
var Bot = require('slackbots');

var hello = require('./hello');

var app = express();
var port = process.env.PORT || 3000;

// body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// test route
app.get('/', function (req, res) { res.status(200).send('Hello world!') });

// hello world
app.post('/hello', hello);

// error handler
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(400).send(err.message);
});

// start listening
app.listen(port, function () {
  console.log('Stranger listening on port ' + port);
});

var Stranger = function Constructor(settings) {
    this.settings = settings;
    this.settings.name = this.settings.name || 'stranger';
    this.settings.defaultChannel = this.settings.defaultChannel

    // TODO: this.settings.defaultChannel = this.settings.defaultChannel || this.channels[0].name;

    //this.dbPath = settings.dbPath || path.resolve(__dirname, '..', 'data', 'stranger.db');
    this.user = null;
    //this.db = null;
};

// inherits methods and properties from the Bot constructor
util.inherits(Stranger, Bot);

// run the bot
Stranger.prototype.run = function () {
    Stranger.super_.call(this, this.settings);
    this.on('start', this._onStart);
    this.on('message', this._onMessage);
    console.log('Stranger: Running.');
};

// on start
Stranger.prototype._onStart = function () {
    this._loadBotUser();
    //this._connectDb();
    this._helloWorld();
};

Stranger.prototype._helloWorld = function () {
    //this.postMessageToChannel(this.channels[0].name, 'Hello World!\nSay `' + this.name + '` to invoke me!', {as_user: true});
    console.log('Stranger: _helloWorld called.');
    this.postMessageToChannel(this.settings.defaultChannel, self._getQuote(), {as_user: true});
    //console.log(this.postMessageToChannel(this.settings.defaultChannel, 'Hello Secret World!\nSay `' + this.name + '` to summon me.', {as_user: true}));

};

// on message
Stranger.prototype._onMessage = function (message) {
    console.log('Stranger: _onMessage called.');
    if (this._isChatMessage(message) && !this._isFromStranger(message) && this._isMentioningStranger(message)) {
        var self = this;
        if (this._isChannelConversation(message)) {
            var channel = self._getChannelById(message.channel);
            self.postMessageToChannel(channel.name, self._getQuote(), {as_user: true});
            console.log("Stranger: Catched - Channel conversation.");
        }
        else if (this._isGroupConversation(message)) {
            var group = self._getGroupById(message.channel);
            self.postMessageToGroup(group.name, self._getQuote(), {as_user: true});
            console.log("Stranger: Catched - Group conversation.");
        }
        else if (this._isDirectConversation(message)) {
            console.log(message.channel)
            var direct = self._getDirectById(message.channel);
            self.postMessageToUser(direct.name, self._getQuote(), {as_user: true});
            console.log("Stranger: Catched - Direct conversation.");
        }
    }
    console.log(message);
};

// load the user object representing the bot
Stranger.prototype._loadBotUser = function () {
    var self = this;
    this.user = this.users.filter(function (user) {
        return user.name === self.name;
    })[0];
    console.log('Stranger: Bot\'s user found: ' + this.user.name + '.');
};

// get the channel name from its id
Stranger.prototype._getChannelById = function (channelId) {
    return this.channels.filter(function (item) {
        return item.id === channelId;
    })[0];
};

// get the group name from its id
Stranger.prototype._getGroupById = function (groupId) {
    return this.groups.filter(function (item) {
        return item.id === groupId;
    })[0];
};

// get the user name from its id
Stranger.prototype._getDirectById = function (userId) {
    return this.users.filter(function (item) {
        console.log('Stranger: item.id = ' + item.id + ', userId = ' + userId);
        return item.id === userId;
    })[0];
};

// check if the message is a chat message
Stranger.prototype._isChatMessage = function (message) {
    return message.type === 'message' && Boolean(message.text);
};

// check if the message is a channel conversation
Stranger.prototype._isChannelConversation = function (message) {
    return typeof message.channel === 'string' && message.channel[0] === 'C';
};

// check if the message is a group conversation
Stranger.prototype._isGroupConversation = function (message) {
    return typeof message.channel === 'string' && message.channel[0] === 'G';
};

// check if the message is a direct conversation
Stranger.prototype._isDirectConversation = function (message) {
    return typeof message.channel === 'string' && message.channel[0] === 'D';
};

// check if the message is mentioning Stranger
Stranger.prototype._isMentioningStranger = function (message) {
    return message.text.toLowerCase().indexOf('stranger') > -1 || message.text.toLowerCase().indexOf(this.name) > -1;
};

// check if the message is from Stranger themselves
Stranger.prototype._isFromStranger = function (message) {
    return message.user === this.user.id;
};

// helper function to get a random integer from a given range
Stranger.prototype._getRandomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// utility function to get some random sample quote
Stranger.prototype._getQuote = function () {
    var self = this;
    // some more here: http://writing.upenn.edu/wh/archival/documents/sixwords/
    var messages = [
        "Why whisper what you can shout?",
        "Pluto is still a planet!",
        "Sour candy makes my face twitch.",
        "I stand up for what's right.",
        "I am terrified of tall people.",
        "Yeah I'm that kind of girl.",
        "Insomnia gives me time to think.",
        "Make it up as you go.",
        "I make mistakes because I'm human",
        "Home alone. Hears noise. Calls mom.",
        "The sky is not the limit.",
        "Live and die by your words.",
        "I love being indoctrinated by you.",
        "Rarely lives up to her name.",
        "The hits just keep on coming.",
        "I still do not regret anything.",
        "Please, Time, I am not ready.",
        "A decision was made, I complied.",
        "My life, lived inside my head.",
        "Oh is it really time to.",
        "This time, I actually hit send.",
        "Wait, where did the weekend go?",
        "Maybe art school was a mistake."
    ];
    return messages[self._getRandomInt(0, messages.length - 1)]
}

// export Stranger
module.exports = Stranger

// bot config
var stranger = new Stranger({
    token: process.env.BOT_API_KEY,
    //dbPath: process.env.BOT_DB_PATH, // the env config not yet set: heroku config:add BOT_DB_PATH=thePath
    name: process.env.BOT_NAME,
    defaultChannel: process.env.BOT_DEFAULT_CHANNEL
});

// run stranger
stranger.run();
