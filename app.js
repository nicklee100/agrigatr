var fs = require('fs');    //require filesystem

const thingShadow = require('../thing/');  // point to the thing directory of the aws-iot-device-sdk


var thingShadows = thingShadow({
	keyPath: '../private.pem.key',
	certPath:'../certificate.pem.crt',
	caPath: '../root-CA-root',
	clientId:'Pi_Two',
	region: 'us-east-1',
	host:'A3PMDMPZDFFLBX.iot.us-east-1.amazonaws.com'
});

//gpio helper function 

function setGpio(value){
	// fs.writeFile("/sys/class/gpio/gpio12/value", value, function(err){  // check gpio number
	// 	if(err){
	// 		return console.log(err);
	// 	}
	// 	console.log("set GPIO=" + value);   
	// });
	console.log("set GPIO=" + value);   	
} 

function getGpio(){
	// value = fs.readFileSync("/sys/clas/gpio/gpio12/value", 'utf8');
	// console.log("Read GPIO" + value);
	// if (value == 1 ){
	// 	return "ON";
	// }
	// else { 
	// 	return "OFF";
	// }
	return process.argv[2]

}

//client token value returned from thignShadows.update() opperation 

var clientTokenUpdate;
var myCallbacks = { };

//query the GPIO state, this is the state of the GPIO hardware device

var initialPumpState = getGpio();
console.log("Pump is " + initialPumpState);

//bulid the current reported state on/off as json to shadow

var pumpState = {"state":{"reported": {"pump_mode":initialPumpState}}};
console.log(JSON.stringify(pumpState));

// on connect  register thing(subscribe to shadow), then send current reported state 

thignShadows.on('connect', function(){
	var clientToken;

//after connect to aws register interest in thing shadow's name 

	thingShadows.register('Pi_Two');

//update the thing shadow with latest device state 

	setTimeout(function(){
		clientToken = thignShadows.update('Pi_Two', pumpState);
	}, 2000);	

});



//action to take when a shadow accepted or rejects message 

thingShadows.on('status',
	function(thingName, state, clientToken, stateObject) {
		console.log('received ' + state + ' on ' + thingName': ' + JSON.stringify(stateObject));
	});

//acion to taket when a shadow delta messsage is received 
//Messages are sent to all subscribers with the difference between reported and desired state (delta). 

thingShadows.on('delta', 
	function(thingName, stateObject){
		console.log('received delta '+' on '+thignName+': ' + JSON.stringify(stateObject));
		if(stateObject.state.pump_mode === "ON"){
			console.log(" CHANGING MODE -> ON ");
			// set gpio to on
			setGpio(1);
			// then update shadow to on
			setTimeout(function(){
				clientToken = thingShadows.update('Pi_Two',{"state":{"reported":{"pump_mode":"ON"}}});
			},1000)
		} else if ( stateObject.state.pump_mode === "OFF" ){
			console.log(" chaning mode to off ");
			setGpio(0);
			setTimeout(function( ){
				clientToken = thingShadows.update('Pi_Two',{"state"::{"reported":{"pump_mode":"OFF"}}});
			},1000);
		}
	});


//action to  if shadow times out 

thingShadows.on('timeout', function(thignName, clientToken){
	console.log('received time out' + 'on' + thignName': ' + clientToken);
});










































 