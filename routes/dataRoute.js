/**
 * http://usejsdoc.org/
 */
var express = require('express');
var router = express.Router();
var fs = require('fs');
var mysql = require('mysql');
var randomstring = require("randomstring");
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var twilio = require('twilio');




var client1 = new twilio.RestClient('AC966326f4f539f7344caeb70364038eae', '07f7bc2e7ae7c7a6b7b178e43bb17c77');
var transporter = nodemailer.createTransport({
	service: 'Gmail',
	auth: {
		user: 'networkloggerinfrateam@gmail.com',
		pass: 'rcraakgnpxcqrflz'
	}
});

var secretKey = 'v65rr8byhrf29q8dhbci7hec67gqod';

var con = mysql.createConnection({
	host: "healthcare.cjedykpuszoe.us-west-1.rds.amazonaws.com",
	user: "healthcare",
	password: "healthcare",
	database: "healthcare"
});

var defaultpwd = "test";
console.log(crypto.createHmac("md5",secretKey) .update(defaultpwd).digest('hex'));


router.post('/sendheartdata', function(req, res) {
	console.log("here");

	var loginEmail = req.body.loginEmail;
	var loginPassword = req.body.loginPassword;

	res.send("ok");
});

router.post('/storeheartdata', function(req, res) {
	console.log("here");

	var id = req.body.id;
	var pulse = req.body.pulse;
	var activity = req.body.status;
	var latitude = req.body.lat;
	var longitude = req.body.long;
	var  d = Date.now();

	
	var max = 78;
	var min = 70;
	pulse  = Math.floor(Math.random()*(max-min+1)+min)
	
	var heartdata = { u_id: id, h_activity: activity,  h_heartrate:pulse , create_ts:d , latitude:latitude , longitude:longitude};
	
	con.query('INSERT INTO heartdata SET ?', heartdata, function(err,result){
		  if(err) {
			  console.log(err);
			  res.send("Error");
		  }
		  else{
		  console.log('Value Inserted');
		  res.send("Value Inserted.");
		  }
		});
});

var sess;

router.post('/getThreshold', function(req, res) {
	console.log("inside GetThreshold");
	var id = req.body.userId;
	console.log('Requested User Id: '+id);

	
	con.query('select * from healthcare.threshold where u_id = ?', [id], function(err,result){
		  if(err) {
			  console.log(err);
			  res.send("Error");
		  }
		  else if(result.length>0){
			  console.log('Value Fetched');
			  res.send(JSON.stringify(result));
		  }
		});
});

router.get('/', function(req, res) {
	sess = req.session;
	if(sess.email)
	{
		res.setHeader("Cache-Control","no-cache");
		res.setHeader("Cache-Control","no-store");
		res.setHeader("Pragma","no-cache"); 
		res.render("dataPage",{"fname":sess.fname, "lname":sess.lname, "email":sess.email,"id":sess.docid})
	}
	else{
		res.redirect("/");
	}

});

router.get('/getdata', function(req, res) {
	sess = req.session;
	console.log("camehere"+sess.email) ;

	var email = sess.email;
	var query  = 'SELECT * FROM userdetails';
	if(sess.email){

		con.query(query,function(err,rows){
			if(err) {
				console.log(err);
			}
			else{
				var json = '{ "data": ['
				var comma="";

				for(var i=0;i<rows.length;i++)
				{
					var source = JSON.stringify(rows[i]);
					json= json.concat(comma).concat(source);
					comma=","
				}
				json= json.concat(']}');
				var responseData = JSON.parse(json);
				res.setHeader('Content-Type', 'application/json');
				res.status(200).send(responseData.data);	
			}
		});
	}
	else
	{
		res.redirect("/");
	}

});


router.get('/getCurrentHeartRate',function(req,res){
	console.log('Inside Get Current Heart Rate');
	
	var hr;
	var activity;
	var rec;
	var heartRate={};
	
//	var userId = req.body.u_id;
	var query  = 'SELECT h_heartrate, h_activity, from_unixtime(create_ts,"%Y-%m-%d-%hHr:%iMin:%sSec") rec_date FROM heartdata ORDER BY create_ts DESC LIMIT 1;';

	
	con.query(query,function(err,rows){
		if(err) {
			console.log(err);
		}
		else{
			if(rows.length>0 && rows[0].h_heartrate!==null){	
				hr = rows[0].h_heartrate;
				activity = rows[0].h_activity;
				rec = rows[0].rec_date;
			}
			
			heartRate = {
					"hr":hr,
					"activity":activity,
					"rec":rec
			};
			
			res.send(JSON.stringify(heartRate));
//			res.send(hr+';'+activity+';'+rec);
//			res.render('dynamicGraph',{ hr, activity, rec })
		}
	});
});




router.post('/addPatient', function(req, res) {
	console.log("here");
	sess = req.session;
	if(sess.email)
	{
		var u_fname = req.body.u_fname;
		var u_lname = req.body.u_lname;
		var u_age = 27//req.body.dob;
		var u_history = req.body.u_history;
		var u_phone = req.body.u_phone;
		var u_email = req.body.u_email;
		var u_emergency_phone = req.body.u_emergency_phone;
		var u_emergency_name = req.body.u_emergency_name
		var u_password = randomstring.generate(7);
		var u_docid = sess.docid

		var  d = Date.now();


		//var hash = crypto.createHmac("md5",secretKey) .update(u_password).digest('hex');

		var patientData = { u_fname: u_fname,
				u_lname: u_lname,  
				u_age:u_age , 
				u_history:u_history , 
				u_phone:u_phone , 
				u_email:u_email , 
				u_emergency_phone:u_emergency_phone , 
				u_emergency_name:u_emergency_name , 
				u_password:u_password , 
				u_docid:u_docid , 
				create_ts:d };

		con.query('INSERT INTO userdetails SET ?', patientData, function(err,result){
			if(err) {
				if(JSON.stringify(err).indexOf("ER_DUP_ENTRY")>=0)
					res.send("Add Patient Error!! Patient with given Email id already exist.");
				else{
					res.send("User Registration Error!! Please try again later");
				}
			}
			else{
				var patientId = result.insertId;
				var thresholeData ={ u_id :patientId, t_rest_min :60, t_rest_max :89, t_active_min :109, t_active_max :159};

				//independently add threshold
				con.query('INSERT INTO threshold SET ?', thresholeData, function(err,result){
					if(err) {
						console.log(err);
					}
					else{
						console.log("added threshold");
					}
				});
				
				var mailBody = "Hi,<br><br> Thank you for registering with PulseBeat. You can download the PulseBeat app from AppStore and log in with your email id and password:"+u_password+"<br><br>Thanks,<br>PulseBeat Team "
				var toEmail = u_email;
				var mailSubject = "PulseBeat: Registration confirmation mail";
				var phoneNo = u_phone;
				var phoneMsg = "Thank you for registering with PulseBeat. Perfect app to Stay Healthy. Download the PulseBeat from AppStore and login with your email id and password:"+u_password;
				sendAlert(toEmail, mailSubject,mailBody,phoneNo,phoneMsg);
				res.send("OK");
			}
		});
	}
	else
	{
		res.redirect("/");
	}
});

router.get('/getDynamicGraph',function(req,res){
	res.render('dynamicGraph');
});


function sendAlert(toEmail, mailSubject,mailBody,phoneNo,phoneMsg)
{
	var mailOptions = {
			from: 'networkloggerinfrateam@gmail.com', // sender address
			to: toEmail, // list of receivers
			subject:mailSubject, // Subject line
			html: mailBody // html body
	};

	transporter.sendMail(mailOptions, function(error, info){
		if(error){
			console.log(error);
			console.log("Oops! There was an error in sending mail to "+toEmail);
		}
	});

	client1.sms.messages.create( {
		to: '+1'+phoneNo, 
		from: "+16692001196", 
		body:phoneMsg,   
	}, function(err, message) { 
		if (!err) {
		} else {
			console.log(err);
			console.log('Oops! There was an error in sending message '+phoneNo);
		}
	});
}

module.exports = router;