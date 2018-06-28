var express=require('express');

/*var Cloudant = require('cloudant');
var me = 'usha123';
var password = 'kiran@123';
var cloudant = Cloudant({account:me, password:password});
var db=cloudant.db.use('interface');*/
var app1=express();
var cfEnv=require('cfenv');
var path=require('path');
var bodyParser = require('body-parser');
var unirest=require('unirest');
var http = require('http').Server(app1);
var io = require('socket.io')(http);
app1.use(bodyParser.urlencoded({
    extended: true
}));
app1.use(bodyParser.json())
var appEnv=cfEnv.getAppEnv();
var ConversationV1 = require('watson-developer-cloud/conversation/v1');
 app1.use('/', express.static('public'))
var contextw={}; 

app1.get('/',function(req,res){
res.sendFile(path.join(__dirname + '/public/chatui.html'));
});
 
 
io.on('connection',function(socket){
	socket.on("chat message", function(msg){
		console.log('--------------------------------------------')
		console.log(msg)
		console.log('--------------------------------------------')
		console.log('chat message',msg);
		var Msg=msg;
sendToWatson(contextw, Msg, function(response) {
	console.log(response);
	
	if(response.intents[0].intent=="Goodbye"){
	console.log(response);
	 response.context.orderID=undefined;
	 response.context.invoiceID=undefined;
	 response.context.claimID=undefined;
	var response={
		"result":response.output.text[0]
	}
	
	 io.emit('cf',response)
	
}
else if(response.context.action =="forward"){
	console.log("inside forward");
	if(response.intents[0].intent=="GoodBye"){
		console.log("inside goodbye");
		response.context.orderID=undefined;
		response.context.invoiceID=undefined;
	 response.context.claimID=undefined;
		var response={
			"result":response.output.text[0]
		}
		
		io.emit('cf',response);
		
	}
	else if(response.intents[0].intent=="Greetings"){
		console.log("----------------------------")
		console.log("inside goodbye");
		var response={
			"result":response.output.text[0]
		}
		io.emit('cf',response);
	}
	else if(response.intents[0].intent=="Capabilities"){
		console.log("inside goodbye");
		var response={
			"result":response.output.text[0]
		}
		io.emit('cf',response);
	}
	
	
	else if(response.context.cmd=="claimID"){
		
						console.log("inside claim");
			if(response.context.orderID){			
						
				function user(){
					
		return new Promise(function(resolve,reject) {
		unirest.get('http://mss1dealerportal.mybluemix.net/orders/orderId?orderId='+response.context.orderID)
		.end(function(response,err){
			
			if(response.body.output){
				
			var str=response.body.output;
				console.log(str);
			if(str.match("is Valid Order")){
				
				var numberPattern = /\d+/g;
				var sample=response.body.output.match( numberPattern )
				
				console.log(JSON.parse(sample));
				resolve(JSON.parse(sample))
				response = {
				"result":"valid order "
				}
				console.log(response);
				
				}
				
			else{
				response = {
				"result":"I was not able to find any orders with that number, please try again."
		
				
			}
		//console.log(response)
		
		/*send(req.body.From,response.result,function(response){
			console.log(response);
		})*/
		io.emit('cf',response);
			}
			}
			else{
			response={
				"result":err
			}
			console.log(err)
			var response={
				"result":"Problem In the API"
			}
			
		/* send(req.body.From,response,function(response){
			console.log(response);
		}) */
		io.emit('cf',response);
		}
			
		});
		});
		}
		var a=[]
		
		function user1(args1){
			console.log("inside claim status");
			console.log(args1);
			return new Promise(function(resolve,reject) {
					
	unirest.get('http://mss1dealerportal.mybluemix.net/orders/order/claims?orderId='+args1)
		.end(function(response,err){
			if(response){
				console.log(response.status);
				if(response.body.output){
					a.push({
					"OrderID":response.body.output[0].orderId,
					"Date":response.body.output[0].DateUpdated,
					"Status":response.body.output[0].CaseStatus
					
				})
				
				resolve(a)
				
		
			}
			else{
			response = {
				"result":"err"
				}
				var response={
					"result":"Problem In the API"
				}
				io.emit('cf',response)
		//res.json(response);	
				
			}
				
			}
			else{
				response = {
				"result":"err"
				}
		var response={
			"result":"Problem In the API"
		}
		io.emit('cf',response)
		/* send(req.body.From,response,function(response){
			console.log(response);
		}) */
		io.emit('cf',response);
			}
			
		
		})
			})
}
function user2(args2){
	
	console.log(args2[0].Status);
	console.log(args2[0].OrderID)
	unirest.get('http://mss1dealerportal.mybluemix.net/claims/code?code='+args2[0].Status)
	.end(function(response,err){
			if(response){
				
				console.log(response.body.output);
				if(response){
					var response={
						"result":"Claim #"+args2[0].OrderID+" is for "+args2[0].Date+ " and is currently  "+(response.body.output.Description).toLowerCase()
					}
					
					io.emit('cf',response);
				
				
	 	
		/* var document = cloudant.db.use('interface')
                      data.context=response1.context;
                      var rev=data.rev_id;
                      id=data._id;


				document.insert(data, req.body.From, rev, id, function(err, body, header) {
           if (err) {
                  return console.log('[alice.insert] ', err.message);
            }
             });
                send(req.body.From,response,function(response){
					res.send(response.body)
	
                    });		 */
			 }
			else{
			response = {
				"result":"err"
				}
				var response={
			"result":"Problem In the API"
		}
		io.emit('cf',response)
		//res.json(response);	
				
			}
				
			}
			else{
				response = {
				"result":"err"
				}
		res.json(response);
		var response={
			"result":"Problem In the API"
		}
		
		/* send(req.body.From,response,function(response){
			console.log(response);
		}) */
		io.emit('cf',response);
			}
			
		
		})
	 
		
	
	
	
}

user().then(function(data) {
        console.log(data);
        user1(data).then(function(data1){
			console.log(data1);
			user2(data1);
		});
    });
	}
	else{
		console.log(response);
		var response={
			"result":response.output.text[0]
		}
		io.emit('cf',response);
	}
		
	}
	else if(response.context.cmd=="invoiceID"){
		if(response.context.orderID){
			function user(){
		return new Promise(function(resolve,reject) {
		unirest.get('http://mss1dealerportal.mybluemix.net/orders/orderId?orderId='+response.context.orderID)
		.end(function(response,err){
			console.log("INSIDE API");
			console.log(err);
			if(response.body.output){
				
			var str=response.body.output;
				console.log(str);
			if(str.match("is Valid Order")){
				
				var numberPattern = /\d+/g;
var sample=response.body.output.match(numberPattern )
				
			
				console.log(JSON.parse(sample));
				resolve(JSON.parse(sample))
				response = {
				"result":"valid order "
				}
				console.log(response);
				
				}
				
			else{
				response = {
				"result":"I was not able to find any orders with that number, please try again."
				
			}
		//console.log(response)
		/* send(req.body.From,response.result,function(response){
			console.log(response);
		}) */
		io.emit('cf',response);
			}
			}
			else{
			response={
				"result":err
			}
			console.log(err)
		}
			
		});
		});
		}
			
			function user1(args1){
				return new Promise(function(resolve,reject) {
					
		unirest.get('http://mss1dealerportal.mybluemix.net/orders/order/invoices?orderId='+args1)
		.end(function(response,err){
			if(response.body){
				
				console.log(response.body.output[0].invoiceNo);
			
			var sample=response.body.output[0].invoiceNo;
			resolve(sample);
				}
			
			else{
				response = {
				"result":err
				}
		res.json(response);
				
			}
			
		});
			});
		}
		
		function user2(args2){
			//console.log("argu",args2)
		unirest.get('http://mss1dealerportal.mybluemix.net/invoices/invoice?invoiceNo='+args2)
		.end(function(response,err){
			console.log(response.body)
			if(response.body){
				if(response.body.output){
					var response={
						"result":"Invoice #"+response.body.output.invoiceData[0].invoiceNo+" "+response.body.output.invoiceData[0].invoiceType+" is for "+response.body.output.product_response[0].totalPrice+"$, and has "+response.body.output.product_response[0].quantity+" items to be shipped ."

					}
					io.emit('cf',response);
			//response="Invoice #"+response.body.output.invoiceData[0].invoiceNo+" "+response.body.output.invoiceData[0].invoiceType+" is for "+response.body.output.product_response[0].totalPrice+"$, and has "+response.body.output.product_response[0].quantity+" items to be shipped on "+response.body.output.product_response[0].shipDate
			/* var document = cloudant.db.use('interface')
                      data.context=response.context;
                      var rev=data.rev_id;
                      id=data._id;


				document.insert(data, req.body.From, rev, id, function(err, body, header) {
           if (err) {
                  return console.log('[alice.insert] ', err.message);
            }
             }); */
                /* send(req.body.From,response,function(response){
					res.send(response.body)
	
                    }); */	
		
			}
			else{
				response = {
				"result":"err"
				}
		res.json(response);
			}
				
			}
			else{
				response = {
				"result":"err"
				}
		//res.json(response);
		var response={
			"result":"Problem In the API"
		}
		
		/* send(req.body.From,response,function(response){
			console.log(response);
		}) */
		io.emit('cf',response);
			}
			
		
		})
		}
		user().then(function(data) {
			console.log("inside promise")
        console.log(data);
        user1(data).then(function(data1){
			console.log(data1);
			user2(data1)
		})
    });
	}
else{
	console.log(response);
	var response={
		"result":response.output.text[0]
	}
	io.emit('cf',response);
}	
		
	}
	else if(response.context.cmd=="orderID"){
		if(response.context.orderID){
			function user(){
								return new Promise(function(resolve,reject) {
								unirest.get('http://mss1dealerportal.mybluemix.net/orders/orderId?orderId='+response.context.orderID)
		.end(function(response,err){
			console.log(response.body);
			if(response.body.output){
				var str=response.body.output;
				console.log(str);
			if(str.match("is Valid Order")){
				
				var numberPattern = /\d+/g;
var sample=response.body.output.match( numberPattern )
				
				
				console.log(JSON.parse(sample));
				resolve(JSON.parse(sample))
				response = {
				"result":"valid order "
				}
				console.log(response);
				
				}
				
			else{
				response = {
				"result":"I was not able to find any orders with that number, please try again."
		
				
			}
		console.log(response)
		var response={
			"result":response.result
		}
		io.emit('cf',response);
		/*send(req.body.From,response.result,function(response){
			console.log(response);
		})*/
			}
		}
		else{
			response={
				"result":err
			}
			//console.log(err)
			var response={
				"result":"Problem In the API"
			}
			io.emit('cf',response);
			//response="Problem In the API"
		/*send(req.body.From,response,function(response){
			console.log(response);
		})*/
		}
			
		});
		});
					}
					function user1(args1){
						console.log(args1);
						unirest.get('http://mss1dealerportal.mybluemix.net/orders/order?orderId='+args1)
		.end(function(response,err){
			console.log(response.body);
			if(response.body.output){
				if(response.body.output){

		 var response={
			 "result":"Order #"+response.body.output[0].orderId +" was placed on "+response.body.output[0].orderDate+" for "+response.body.output[0].projectName+" and is curretly "+(response.body.output[0].status).toLowerCase()
		 }
		 io.emit('cf',response);	
		/*var document = cloudant.db.use('interface')
                      data.context=response1.context;
                      var rev=data.rev_id;
                      id=data._id;


				document.insert(data, req.body.From, rev, id, function(err, body, header) {
           if (err) {
                  return console.log('[alice.insert] ', err.message);
            }
			else{
				
			}
             });*/
                //send(req.body.From,response,function(response){
					//console.log(response.body);
	//res.send(response.body);
                    //});	
					
						
		
		
			}
			else{
				response = {
				"result":err
				}
		res.json(response);
			}
				
			}
			else{
				response = {
				"result":err
				}
		res.json(response);
		var response={
			"result":"Problem In the API"
		}
		io.emit('cf',response);
		//response="Problem In the API"
		/*send(req.body.From,response,function(response){
			console.log(response);
		})*/
			}
			
		
		})
					
					
			
							
						}
					user().then(function(data) {
        console.log(data);
        user1(data);
    });	
		
		
		
		
			
		}
		else
		{
			console.log(response);
			var response={
				"result":response.output.text[0]
			}
			io.emit('cf',response);
		}
	
		
		
	}
	/*else{
		console.log(response);
		io.emit('cf',response);
	}*/
	/* else if(response.intents[0].intent=="GoodBye"){
		console.log("inside goodbye")
		var response={
			"result":response.output.text[0]
		}
		io.emit('cf',response);
	} */
	
		
}
else if(response.context.action =="process"){
	console.log("inside process")
	console.log(response);
	
	/* if(response.context.cmd=="orderID"){
		console.log(response.context.orderID); */
		/// code
		
		
								if(response.intents[0].intent =="Claim" ){
									console.log("enter claim");
									if(response.context.claimID){
										console.log("having claim id");
									response.context.orderID=response.context.claimID
									
										function user(){
			
		return new Promise(function(resolve,reject) {
		unirest.get('http://mss1dealerportal.mybluemix.net/orders/orderId?orderId='+response.context.orderID)
		.end(function(response,err){
			
			if(response.body.output){
				var str=response.body.output;
				console.log(str);
			if(str.match("is Valid Order"))
			{
				
				var numberPattern = /\d+/g;
var sample=response.body.output.match( numberPattern )
				
				
				console.log(JSON.parse(sample));
				resolve(JSON.parse(sample))
				response = {
				"result":"valid order "
				}
				console.log(response);
				
				}
				
			else{
				response = {
				"result":"I was not able to find any orders with that number, please try again."
			}
		console.log(response)
		/* send(req.body.From,response.result,function(response){
			console.log(response);
		}) */
		io.emit('cf',response)
			}
			}
			else{
			response={
				"result":err
			}
			console.log(err)
			var response={
				"result":"Problem in the API"
			}
			
			/* send(req.body.From,response,function(response){
			console.log(response);
		}) */
		io.emit('cf',response)
		}
			
		});
		});
		}
		var a=[]
		
		function user1(args1){
			return new Promise(function(resolve,reject) {
					
	unirest.get('http://mss1dealerportal.mybluemix.net/orders/order/claims?orderId='+args1)
		.end(function(response,err){
			if(response){
				
				if(response.body.output.length>0){
					a.push({
					"OrderID":response.body.output[0].orderId,
					"Date":response.body.output[0].DateUpdated,
					"Status":response.body.output[0].CaseStatus
					
				})
				
				resolve(a)
				
		
			}
			else{
			response = {
				"result":"err"
				}
		
				
			}
				
			}
			else{
				response = {
				"result":"err"
				}
		var response={
			"result":"Problem In the API"
		}
		
		
		/* send(req.body.From,response,function(response){
			console.log(response);
		}) */
		io.emit('cf',response)
			}
			
		
		})
			})
}
function user2(args2){
	
	console.log(args2[0].Status);
	console.log(args2[0].OrderID)
	unirest.get('http://mss1dealerportal.mybluemix.net/claims/code?code='+args2[0].Status)
	.end(function(response,err){
			if(response){
				
				console.log(response.body.output);
				if(response){
					var response={
						"result":"Claim #"+args2[0].OrderID+" is for "+args2[0].Date+ " and is currently  "+(response.body.output.Description).toLowerCase()	
					}
					
				io.emit('cf',response);
	 			
		
		/* var document = cloudant.db.use('interface')
                      data.context=response1.context;
                      var rev=data.rev_id;
                      id=data._id;


				document.insert(data, req.body.From, rev, id, function(err, body, header) {
           if (err) {
                  return console.log('[alice.insert] ', err.message);
            }
             });
                send(req.body.From,response,function(response){
	res.send(response.body) 
                    });*/		
			 }
			else{
			response = {
				"result":"err"
				}
		//res.json(response);	
				
			}
				
			}
			else{
				response = {
				"result":"err"
				}
		var response={
			"result":"Problem In the API"
		}
		
		/* send(req.body.From,response,function(response){
			console.log(response);
		}) */
		io.emit('cf',response)
			}
			
		
		})
	 
		
	
	
	
}

user().then(function(data) {
        console.log(data);
        user1(data).then(function(data1){
			console.log(data1);
			user2(data1);
		});
    });
	
								}
								else{
															
															
	function user(){
			
		return new Promise(function(resolve,reject) {
		unirest.get('http://mss1dealerportal.mybluemix.net/orders/orderId?orderId='+response.context.orderID)
		.end(function(response,err){
			
			if(response.body.output){
				var str=response.body.output;
				console.log(str);
			if(str.match("is Valid Order"))
			{
				
				var numberPattern = /\d+/g;
var sample=response.body.output.match( numberPattern )
				
				
				console.log(JSON.parse(sample));
				resolve(JSON.parse(sample))
				response = {
				"result":"valid order "
				}
				console.log(response);
				
				}
				
			else{
				response = {
				"result":"I was not able to find any orders with that number, please try again."
			}
		console.log(response)
		/* send(req.body.From,response.result,function(response){
			console.log(response);
		}) */
		io.emit('cf',response)
			}
			}
			else{
			response={
				"result":err
			}
			console.log(err)
			var response={
				"result":"Problem in the API"
			}
			
			/* send(req.body.From,response,function(response){
			console.log(response);
		}) */
		io.emit('cf',response)
		}
			
		});
		});
		}
		var a=[]
		
		function user1(args1){
			console.log("-------------------------")
			console.log(args1)
			return new Promise(function(resolve,reject) {
					
	unirest.get('http://mss1dealerportal.mybluemix.net/orders/order/claims?orderId='+args1)
		.end(function(response,err){
			if(response){
				console.log("-------------");
				console.log(response.body)
				if(response.body.output.length>0){
					a.push({
					"OrderID":response.body.output[0].orderId,
					"Date":response.body.output[0].DateUpdated,
					"Status":response.body.output[0].CaseStatus
					
				})
				
				resolve(a)
				
		
			}
			else{
			response = {
				"result":"err"
				}
		
				
			}
				
			}
			else{
				response = {
				"result":"err"
				}
		var response={
			"result":"Problem In the API"
		}
		
		
		/* send(req.body.From,response,function(response){
			console.log(response);
		}) */
		io.emit('cf',response)
			}
			
		
		})
			})
}
function user2(args2){
	
	console.log(args2[0].Status);
	console.log(args2[0].OrderID)
	unirest.get('http://mss1dealerportal.mybluemix.net/claims/code?code='+args2[0].Status)
	.end(function(response,err){
			if(response){
				
				console.log(response.body.output);
				if(response){
					var response={
						"result":"Claim #"+args2[0].OrderID+" is for "+args2[0].Date+ " and is currently  "+(response.body.output.Description).toLowerCase()	
					}
					
				io.emit('cf',response);
	 			
		
		/* var document = cloudant.db.use('interface')
                      data.context=response1.context;
                      var rev=data.rev_id;
                      id=data._id;


				document.insert(data, req.body.From, rev, id, function(err, body, header) {
           if (err) {
                  return console.log('[alice.insert] ', err.message);
            }
             });
                send(req.body.From,response,function(response){
	res.send(response.body) 
                    });*/		
			 }
			else{
			response = {
				"result":"err"
				}
		//res.json(response);	
				
			}
				
			}
			else{
				response = {
				"result":"err"
				}
		var response={
			"result":"Problem In the API"
		}
		
		/* send(req.body.From,response,function(response){
			console.log(response);
		}) */
		io.emit('cf',response)
			}
			
		
		})
	 
		
	
	
	
}

user().then(function(data) {
        console.log(data);
        user1(data).then(function(data1){
			console.log(data1);
			user2(data1);
		});
    });
									
								}
								}
								else if(response.intents[0].intent=="Invoice"){
									console.log("This is invoice forward action");
									//response1.context.OrderID=response1.entities[0].value
									console.log("invoice")
									if(response.context.invoiceID){
									response.context.orderID=response.context.invoiceID;
									console.log(response.context.orderID)
									function user(){
			
		return new Promise(function(resolve,reject) {
		unirest.get('http://mss1dealerportal.mybluemix.net/orders/orderId?orderId='+response.context.orderID)
		.end(function(response,err){
			console.log(response.body.output);
			if(response.body.output){
			var str=response.body.output;
				console.log(str);
			if(str.match("is Valid Order")){
				
				var numberPattern = /\d+/g;
var sample=response.body.output.match(numberPattern )
				
			
				console.log(JSON.parse(sample));
				resolve(JSON.parse(sample))
				response = {
				"result":"valid order "
				}
				console.log(response);
				
				}
				
			else{
				response = {
				"result":"I was not able to find any orders with that number, please try again."
		
				
			}
		console.log(response)
		/* send(req.body.From,response.result,function(response){
			console.log(response);
		}) */
		io.emit('cf',response);
			}
			}
			else{
			response={
				"result":err
			}
			console.log(err)
			var response={
				"result":"Problem In the API"
			}
			io.emit('cf',response);
		/* send(req.body.From,response,function(response){
			console.log(response);
		}) */
		}
			
		});
		});
		}
			
			function user1(args1){
				return new Promise(function(resolve,reject) {
					
		unirest.get('http://mss1dealerportal.mybluemix.net/orders/order/invoices?orderId='+args1)
		.end(function(response,err){
			if(response.body){
				
				console.log(response.body.output[0].invoiceNo);
			
			var sample=response.body.output[0].invoiceNo;
			resolve(sample);
				}
			
			else{
				response = {
				"result":err
				}
		res.json(response);
		var response={
			"result":"Problem In the API"
		}
		io.emit('cf',response);
		/* send(req.body.From,response,function(response){
			console.log(response);
		}) */
				
			}
			
		});
			});
		}
		
		function user2(args2){
			console.log("argu",args2)
		unirest.get('http://mss1dealerportal.mybluemix.net/invoices/invoice?invoiceNo='+args2)
		.end(function(response,err){
			console.log(response.body)
			if(response.body){
				if(response.body.output){
					var response={
						"result":"Invoice #"+response.body.output.invoiceData[0].invoiceNo+" "+response.body.output.invoiceData[0].invoiceType+" is for "+response.body.output.product_response[0].totalPrice+"$, and has "+response.body.output.product_response[0].quantity+" items to be shipped"
					}
			io.emit('cf',response);
			/* var document = cloudant.db.use('interface')
                      data.context=response1.context;
                      var rev=data.rev_id;
                      id=data._id;


				document.insert(data, req.body.From, rev, id, function(err, body, header) {
           if (err) {
                  return console.log('[alice.insert] ', err.message);
            }
             }); */
                /* send(req.body.From,response,function(response){
	res.send(response.body);
                    });	
		 */
		 
			}
			else{
				response = {
				"result":"err"
				}
		
			}
				
			}
			else{
				response = {
				"result":"err"
				}
		
		var response={
			"result":"Problem In the API"
		}
		io.emit('cf',reponse)
		/* send(req.body.From,response,function(response){
			console.log(response);
		}) */
			}
			
		
		})
		}
		user().then(function(data) {
        console.log(data);
        user1(data).then(function(data1){
			console.log(data1);
			user2(data1)
		})
    });
								}
								else{
														function user(){
			
		return new Promise(function(resolve,reject) {
		unirest.get('http://mss1dealerportal.mybluemix.net/orders/orderId?orderId='+response.context.orderID)
		.end(function(response,err){
			console.log(response.body.output);
			if(response.body.output){
			var str=response.body.output;
				console.log(str);
			if(str.match("is Valid Order")){
				
				var numberPattern = /\d+/g;
var sample=response.body.output.match(numberPattern )
				
			
				console.log(JSON.parse(sample));
				resolve(JSON.parse(sample))
				response = {
				"result":"valid order "
				}
				console.log(response);
				
				}
				
			else{
				response = {
				"result":"I was not able to find any orders with that number, please try again."
		
				
			}
		console.log(response)
		/* send(req.body.From,response.result,function(response){
			console.log(response);
		}) */
		io.emit('cf',response);
			}
			}
			else{
			response={
				"result":err
			}
			console.log(err)
			var response={
				"result":"Problem In the API"
			}
			io.emit('cf',response);
		/* send(req.body.From,response,function(response){
			console.log(response);
		}) */
		}
			
		});
		});
		}
			
			function user1(args1){
				return new Promise(function(resolve,reject) {
					
		unirest.get('http://mss1dealerportal.mybluemix.net/orders/order/invoices?orderId='+args1)
		.end(function(response,err){
			if(response.body){
				
				console.log(response.body.output[0].invoiceNo);
			
			var sample=response.body.output[0].invoiceNo;
			resolve(sample);
				}
			
			else{
				response = {
				"result":err
				}
		res.json(response);
		var response={
			"result":"Problem In the API"
		}
		io.emit('cf',response);
		/* send(req.body.From,response,function(response){
			console.log(response);
		}) */
				
			}
			
		});
			});
		}
		
		function user2(args2){
			console.log("argu",args2)
		unirest.get('http://mss1dealerportal.mybluemix.net/invoices/invoice?invoiceNo='+args2)
		.end(function(response,err){
			console.log(response.body)
			if(response.body){
				if(response.body.output){
					var response={
						"result":"Invoice #"+response.body.output.invoiceData[0].invoiceNo+" "+response.body.output.invoiceData[0].invoiceType+" is for "+response.body.output.product_response[0].totalPrice+"$, and has "+response.body.output.product_response[0].quantity+" items to be shipped"
					}
			io.emit('cf',response);
			/* var document = cloudant.db.use('interface')
                      data.context=response1.context;
                      var rev=data.rev_id;
                      id=data._id;


				document.insert(data, req.body.From, rev, id, function(err, body, header) {
           if (err) {
                  return console.log('[alice.insert] ', err.message);
            }
             }); */
                /* send(req.body.From,response,function(response){
	res.send(response.body);
                    });	
		 */
		 
			}
			else{
				response = {
				"result":"err"
				}
		
			}
				
			}
			else{
				response = {
				"result":"err"
				}
		
		var response={
			"result":"Problem In the API"
		}
		io.emit('cf',reponse)
		/* send(req.body.From,response,function(response){
			console.log(response);
		}) */
			}
			
		
		})
		}
		user().then(function(data) {
        console.log(data);
        user1(data).then(function(data1){
			console.log(data1);
			user2(data1)
		})
    });
									
								}
									
								}
								else if(response.intents[0].intent=="Order"){
									console.log(response.intents[0].intent);
									console.log(response.context.orderID);
									
								function user(){
								return new Promise(function(resolve,reject) {
								unirest.get('http://mss1dealerportal.mybluemix.net/orders/orderId?orderId='+response.context.orderID)
		.end(function(response,err){
			console.log(response.body);
			if(response.body.output){
				var str=response.body.output;
				console.log(str);
			if(str.match("is Valid Order")){
				
				var numberPattern = /\d+/g;
var sample=response.body.output.match( numberPattern )
				
				
				console.log(JSON.parse(sample));
				resolve(JSON.parse(sample))
				response = {
				"result":"valid order "
				}
				console.log(response);
				
				}
				
			else{
				response = {
				"result":"I was not able to find any orders with that number, please try again."
		
				
			}
		console.log(response)
		var response={
			"result":response.result
		}
		io.emit('cf',response);
		/*send(req.body.From,response.result,function(response){
			console.log(response);
		})*/
			}
		}
		else{
			response={
				"result":err
			}
			//console.log(err)
			var response={
				"result":"Problem In the API"
			}
			io.emit('cf',response);
			//response="Problem In the API"
		/*send(req.body.From,response,function(response){
			console.log(response);
		})*/
		}
			
		});
		});
					}
					function user1(args1){
						console.log(args1);
						unirest.get('http://mss1dealerportal.mybluemix.net/orders/order?orderId='+args1)
		.end(function(response,err){
			console.log(response.body);
			if(response.body.output){
				if(response.body.output){

		 var response={
			 "result":"Order #"+response.body.output[0].orderId +" was placed on "+response.body.output[0].orderDate+" for "+response.body.output[0].projectName+" and is curretly "+(response.body.output[0].status).toLowerCase()
		 }
		 io.emit('cf',response);	
		/*var document = cloudant.db.use('interface')
                      data.context=response1.context;
                      var rev=data.rev_id;
                      id=data._id;


				document.insert(data, req.body.From, rev, id, function(err, body, header) {
           if (err) {
                  return console.log('[alice.insert] ', err.message);
            }
			else{
				
			}
             });*/
                //send(req.body.From,response,function(response){
					//console.log(response.body);
	//res.send(response.body);
                    //});	
					
						
		
		
			}
			else{
				response = {
				"result":err
				}
		res.json(response);
			}
				
			}
			else{
				response = {
				"result":err
				}
		res.json(response);
		var response={
			"result":"Problem In the API"
		}
		io.emit('cf',response);
		//response="Problem In the API"
		/*send(req.body.From,response,function(response){
			console.log(response);
		})*/
			}
			
		
		})
					
					
			
							
						}
					user().then(function(data) {
        console.log(data);
        user1(data);
    });	
		
		
		
		
		
		/*var response={
			"result":response.output.text[0]
		}
		io.emit('cf',response);*/
	}
	else if(response.intents[0].intent=="GoodBye"){
		console.log("inside goodbye");
		response.context.orderID=undefined;
		response.context.invoiceID=undefined;
	 response.context.claimID=undefined;
		var response={
			"result":response.output.text[0]
		}
		io.emit('cf',response);
		
	}
	else if(response.intents[0].intent=="Greetings"){
		console.log("inside greetings");
		var response={
			"result":response.output.text[0]
		}
		io.emit('cf',response);
	}
	
	//Claim Status
	
		

//}
}
else if(response.context.action =="Invoice"){
	//Invoice Status
	
	var a=[];
	var b=[];
		
		if(response.entities==""){
			console.log(response.context.OrderID)
			function user(){
				return new Promise(function(resolve,reject) {
		unirest.get('http://interfacepocnew1.mybluemix.net/orders/order/invoices?orderId='+response.context.OrderID)
		.end(function(response,err){
			if(response.body){
				
			
			var sample=response.body.output[0].invoiceNo;
			resolve(sample);
				}
			
			else{
				response = {
				"result":err
				}
		res.json(response);
				
			}
			
		});
			});
		}
		function user1(args1){
		unirest.get('http://interfacepocnew1.mybluemix.net/invoices/invoice?invoiceNo='+args1)
		.end(function(response,err){
			if(response.body){
				if(response.body.output){
					var response={
						"result":"Invoice #"+response.body.output.invoiceData[0].invoiceNo+" "+response.body.output.invoiceData[0].invoiceType+" is for "+response.body.output.product_response[0].totalPrice+"$, and has "+response.body.output.product_response[0].quantity+" items to be shipped"
					}
			io.emit('cf',response)
			
		
			}
			else{
				response = {
				"result":"err"
				}
		io.emit('cf',response);
			}
				
			}
			else{
				response = {
				"result":"err"
				}
		io.emit('cf',response);
			}
			
		
		})
		}
		user().then(function(data) {
        console.log(data);
        user1(data);
    });

		
		}
		else{
				function user(){
			
		return new Promise(function(resolve,reject) {
		unirest.get('http://interfacepocnew1.mybluemix.net/orders/orderId?orderId='+response.entities[0].value)
		.end(function(response,err){
			console.log(response.body.output);
			if(response.body.output){
			if(response.body.output.match("is Valid Order")){
				console.log("harshit")
				var numberPattern = /\d+/g;
var sample=response.body.output.match(numberPattern )
				
			
				console.log(JSON.parse(sample));
				resolve(JSON.parse(sample))
				response = {
				"result":"valid order "
				}
				console.log(response);
				
				}
				
			else{
				response = {
				"result":"I was not able to find any orders with that number, please try again."
		
				
			}
		console.log(response)
			}
			}
			else{
			response={
				"result":err
			}
			console.log(err)
		}
			
		});
		});
		}
			
			function user1(args1){
				return new Promise(function(resolve,reject) {
					
		unirest.get('http://interfacepocnew1.mybluemix.net/orders/order/invoices?orderId='+args1)
		.end(function(response,err){
			if(response.body){
				
				console.log(response.body.output[0].invoiceNo);
			
			var sample=response.body.output[0].invoiceNo;
			resolve(sample);
				}
			
			else{
				response = {
				"result":err
				}
		io.emit('cf',response);
				
			}
			
		});
			});
		}
		
		function user2(args2){
		unirest.get('http://interfacepocnew1.mybluemix.net/invoices/invoice?invoiceNo='+args2)
		.end(function(response,err){
			if(response.body){
				if(response.body.output){
					var response={
						"result":"Invoice #"+response.body.output.invoiceData[0].invoiceNo+" "+response.body.output.invoiceData[0].invoiceType+" is for "+response.body.output.product_response[0].totalPrice+"$, and has "+response.body.output.product_response[0].quantity+" items to be shipped" 
					}
					io.emit('cf',response);
			
			
	
			}
			else{
				response = {
				"result":"err"
				}
		io.emit('cf',response);
			}
				
			}
			else{
				response = {
				"result":"err"
				}
		io.emit('cf',response);
			}
			
		
		})
		}
		user().then(function(data) {
        console.log(data);
        user1(data).then(function(data1){
			console.log(data1);
			user2(data1)
		})
    });

		}
		
		
		
		
}
else{
	//Normal 
	console.log("action is nope");
	console.log(response.output.text[0])
	
	var response={
		"result":response.output.text[0]
	}
	console.log(response);
	 io.emit('cf',response);
	}		 

	
	
	
	
	
	});
		
	// function to create a watson

		 function sendToWatson(cont, inp, callback) {
			var payload = {
				workspace_id:'0a56c12b-af85-490c-8e1c-eabee681c572',
				context: cont,
				input: {
				"text": inp
					}
		};
 // Conversation credentials
		var conversation = new ConversationV1({
			username:'dba0c5be-3d44-4477-aa27-7bd047d03f58',
			password: 'bTWZpnpyVonp',
		version_date: '2017-06-01'
	});
//Conversation Starts
		conversation.message(payload, function(err, data1) {
			if (err) {
				console.log("err during conversation payload" + err)
			}
			else{
			contextw = data1.context;  //Updating Context Variable
			var data = JSON.stringify(data1)
			console.log("Data is: \n "+JSON.stringify(data1.output));
			var node = data1.output.nodes_visited[0];
				callback(data1);
	
     }


  })
}
//watson context
	
	
	
});//socket
		
});//io.on

 //Server
 
http.listen(process.env.PORT|| 8000, function(){
	console.log("server is running at 8000");	
});
require("cf-deployment-tracker-client").track();