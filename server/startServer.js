var port = 3030;
var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {}

handle["/save"] = requestHandlers.saveCitizenData;
handle["/mapping"] = requestHandlers.mappingSuitability;


server.start(router.route, handle, port);