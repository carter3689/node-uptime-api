/*
 * Primary File for API
 * 
 * 
 * 
*/

// Dependencies

let http = require('http');
let https = require('https');
let url = require('url');
let stringDecoder = require('string_decoder').StringDecoder;
let config = require('./config')

let fs = require('fs');
/*
    The Server should respond to all requests with a string
    Start the server and listen on port 3000
*/

// Instantiate the HTTP server
let httpServer = http.createServer(function (req,res) {
    unifiedServer(req,res)

});

httpServer.listen(config.httpPort,function(){
    console.log(`The server is listening on port ${config.httpPort} in ${config.envName} mode `)
})

//Instantiate the HTTPS server

let httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert':fs.readFileSync('./https/cert.pem')
}
let httpsServer = https.createServer(httpsServerOptions,(req,res) => {
    unifiedServer(req,res)
})
//Start the HTTPS Server
httpsServer.listen(config.httpsPort, () => {
    console.log(`The server is listening on port ${config.httpsPort} in ${config.envName} mode`)
})


//All the server logic for both the http and https servers
let unifiedServer = function(req,res){
    //GET url and parse it
    let parsedURL = url.parse(req.url, true)
    //Get path from url
    let path = parsedURL.pathname;
    let trimmedPath = path.replace(/^\/+|\/+$/g,'');

    // Get querystring as an object
    let querystringObject = parsedURL.query;

    //Get the HTTP method
    let method = req.method.toLowerCase();

    //Get the headers as an object
    let headers = req.headers;

    // Get payload, if any
    let decoder = new stringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data)
    })

    req.on('end', () => {
        buffer += decoder.end();

        // Choose handler this request should go to
        // If not found, use the not found handler

        let choosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound

        // Construct the data object to send to the handler
        let data = {
            'trimmedPath':trimmedPath,
            'queryStringObject': querystringObject,
            'method':method,
            'headers': headers,
            'payload': buffer
        }

        // Route the request to the handler specified in the router
        choosenHandler(data,(statusCode,payload) => {
            //Use the status code called back by the handler, or default to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode: 200;
            // Use the payload calledback by the handler, or default to an empty object
            payload = typeof(payload) == 'object' ? payload : {};

            //Convert the payload to a string
            let payloadString = JSON.stringify(payload);



            //Return the reponse
            res.setHeader('Content-type','application/json')
            res.writeHead(statusCode);
            //Send the reponse
            res.end(payloadString);

            //Log the request path
            console.log("Returning this response: ",statusCode,payloadString )
        })
  
    })
};

//Defining Handlers
let handlers = {}

handlers.sample = function(data, callback){
    //Callback HTTP status code, and a payload object
    callback(406,{'name': 'sample handler'})
}

//Ping Handler
handlers.ping = function(data,callback){
    callback(200)
}
//Not found handler 
handlers.notFound = function(data,callback){
    callback(404)
}
//Defining a request router
let router = {
    'sample': handlers.sample,
    'ping':handlers.ping
}