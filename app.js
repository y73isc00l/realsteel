/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/
var http = require('http');
var restify = require('restify');
var builder = require('botbuilder');
// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    stateEndpoint: process.env.BotStateEndpoint,
    openIdMetadata: process.env.BotOpenIdMetadata 
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

// Create your bot with a function to receive messages from the user
var bot = new builder.UniversalBot(connector);

// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';
var getUrl = 'http://52.168.139.241:5000/magic';
const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;

// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
var intents = new builder.IntentDialog({ recognizers: [recognizer] })
/*
.matches('<yourIntent>')... See details at http://docs.botframework.com/builder/node/guides/understanding-natural-language/
*/
// .onDefault((session) => {
//     session.send('Sorry, I did not understand \'%s\'.', session.message.text);
// });

// bot.dialog('/', intents);    
bot.dialog('/', [
    function (session) {
        //Trigger /askName dialog
        session.beginDialog('/askName');
    },
    function (session, results) {
        //Return hello + user's input (name)
        session.send('Hello %s!', results.response);
        builder.Prompts.text(session,'I would like to show you something cool,just enter some text in English ');
    },
    function(session,results){
        var request = http.get(getUrl+"?str="+results.response,function(response){
           var body = "";
    //Read the data
    response.on('data', function(chunk) {
      body += chunk;
    });
    response.on('end',function(){
        if(response.statusCode == 200){
                 var e = JSON.parse(body); 
                 console.dir(e);
    var msg = new builder.Message(session).addAttachment(    
    new builder.VideoCard(session)
        .title('Smack')
        .subtitle('by the Blender Institute')
        .text('')
        .image(builder.CardImage.create(session, 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/220px-Big_buck_bunny_poster_big.jpg'))
        .media([
            { url: e.url }
        ])
        .buttons([
            builder.CardAction.openUrl(session, 'https://peach.blender.org/', 'Learn More')
        ]));
        session.send(msg);
        } else {
            console.log("There is  so much shit");
        }
    });
    });
    }    
]);
bot.dialog('/askName', [
    function (session) {
        //Prompt for user input
        builder.Prompts.text(session, 'Hi! What is your name?');
    }
]);

