
var nodemailer = require('nodemailer');
var randomstring = require("randomstring");
var express = require('express');
var index = express.Router();
var crypto = require('crypto');

var mysql = require('mysql');

var transporter = nodemailer.createTransport({
	service: 'Gmail',
	auth: {
		user: 'networkloggerinfrateam@gmail.com',
		pass: 'rcraakgnpxcqrflz'
	}
});

var sess;


var con = mysql.createConnection({
	host: "healthcare.cjedykpuszoe.us-west-1.rds.amazonaws.com",
	user: "healthcare",
	password: "healthcare",
	database: "healthcare"
});

var secretKey = 'v65rr8byhrf29q8dhbci7hec67gqod';


index.get('/logout', function(req, res) {
	//destroy session when logout
	req.session.destroy(function(err) {
		if(err) {
			console.log(err);
		} else {
			res.redirect('/');
		}
	});
});



index.get('/', function(req, res) {
	res.render("loginPage");
});


index.post('/login', function(req, res) {	
	console.log("came here" +JSON.stringify(req.body));
	var loginEmail = req.body.loginEmail;
	var loginPassword = req.body.loginPassword;

	//create sesino when login
	sess = req.session;

	console.log(req.session);

	var query  = 'SELECT d_password,d_fname,d_lname,d_email,d_id FROM docdetails WHERE d_email=?';

	con.query(query,[loginEmail],function(err,rows){
		console.log(rows);
		if(err) {
			res.render("loginPage",{"LoginMessage":"Data Server Error. Please try again later."});
		}
		else{
			if(rows.length>0){
				var hash = crypto.createHmac("md5",secretKey) .update(loginPassword).digest('hex');
				if(hash!=rows[0].d_password)
					res.render("loginPage",{"LoginMessage":"Email and Password did not match."});
				else{
					console.log(loginEmail);
					sess.docid = rows[0].d_id;
					sess.email =  rows[0].d_email;
					sess.fname= rows[0].d_fname;
					sess.lname = rows[0].d_lname;
					res.redirect("/dataPage/");
				}

			}
			else{
				res.render("loginPage",{"LoginMessage":"Email is not registered to CNMM. Do you want to Register?"});
			}

		}
	});
});


index.post('/loginMobile', function(req,res){
	console.log("into mobile Login: " +JSON.stringify(req.body));
	
	var id = req.body.pid;
	var password = req.body.password;
	console.log("user id: "+id);
	console.log("Pass: "+password);
	


	var query  = 'SELECT * FROM userdetails WHERE u_id=? and u_password=?';

		con.query(query,[id, password],function(err,rows){
			console.log(query);
			console.log(rows);
			if(err) {
				res.send('Server Error...!');
//				res.render("loginPage",{"LoginMessage":"CNMM Server Error. Please try again later."});
			}
			else{
				if(rows.length>0){
					var name= rows[0].u_fname + " " + rows[0].u_lname;
					res.json({name: name, status: "OK"});
				}
				else{
					res.json({status:"ERROR"});
				}
			}
		});
	
});



index.post('/register', function(req, res) {
	console.log("came here" +JSON.stringify(req.body));
	var firstName = req.body.firstname;
	var lastName = req.body.lastName;
	//var dob = req.body.date;
	var phone = req.body.phone;
	var email = req.body.email;
	var password = req.body.password;

	var hash = crypto.createHmac("md5",secretKey) .update(password).digest('hex');

	var employee = { d_fname: firstName, d_lname: lastName,  d_email:email , d_password:hash, d_phone: phone};

	con.query('INSERT INTO docdetails SET ?', employee, function(err,result){
		if(err) {
			console.log(err);
			if(JSON.stringify(err).indexOf("ER_DUP_ENTRY")>=0)
				res.render("loginPage",{"pagemessage":'User Registration Error!! Account already exist with given Email id.'});
			else{
				res.render("loginPage",{"pagemessage":'User Registration Error!! Please try again later'});
			}
				
		}else{
			console.log('Last insert ID:', result.insertId);
			res.render("loginPage",{"pagemessage":'User Registration Completed!! Please Login.'});
		}
	});

});


index.post('/emailTempPassword', function(req, res) {
	var statusMessage;
	var emailId = req.body.email;
	var query  = 'SELECT count(*) as count FROM userdetails WHERE email=?';
	var updateRecord = 'UPDATE userdetails SET password = ? WHERE email=?';

	con.query(query,[emailId],function(err,rows){
		console.log("hereererwer");
		if(err) {
			status="INTERNAL_SERVER_ERROR";
			res.send(status);
		}
		else{
			if(rows[0].count>0){
				var tempPassword = randomstring.generate(7);
				var hash = crypto.createHmac("md5",secretKey) .update(tempPassword).digest('hex');

				con.query(updateRecord,[hash,emailId], function(err, rows){
					if(err)  {
						status="INTERNAL_SERVER_ERROR";
						res.send(status);
					}
					else {
						console.log('Temp password updated');
						var mailOptions = {
								from: 'networkloggerinfrateam@gmail.com', // sender address
								to: emailId, // list of receivers
								subject: 'Network Logger Infra Team: Password Reset', // Subject line
								html: 'Hi,<br><br> Please use this temporary password to login:'+tempPassword+'<br><br>Thanks,<br>Network Logger Infra Team '// html body
						};

						transporter.sendMail(mailOptions, function(error, info){
							if(error){
								status="INTERNAL_SERVER_ERROR";
								res.send("INTERNAL_SERVER_ERROR");
							}
							res.status(200).send("OK");
						});
					}
				});
			}else
			{
				status="NOT_FOUND";
				res.send(status);
			}
		}
	});
});


index.post('/changePassword', function(req, res) {
	console.log("came here");
	var newpassword = req.body.newpassword;
	var email = sess.email;
	var hash = crypto.createHmac("md5",secretKey) .update(newpassword).digest('hex');
	var updateRecord = 'UPDATE userdetails SET password = ? WHERE email=?';
	con.query(updateRecord,[hash,email], function(err, rows){
		if(err) {
			status="INTERNAL_SERVER_ERROR";
			res.send(status);
		}
		else {
			res.status(200).send("OK");
		}
	});
});



module.exports = index;
