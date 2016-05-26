
var express = require('express');
var router = express.Router();
var path = require('path');
var ejs=require("ejs");
var mysql = require('mysql');




var con = mysql.createConnection({
	  host: "healthcare.cjedykpuszoe.us-west-1.rds.amazonaws.com",
	  user: "healthcare",
	  password: "healthcare",
	  database: "healthcare"
});

router.get('/regressionGraph',function(req,res){
	
	var userId = req.body.userId;
	var lock = 4;
	
//    con.connect();
    var query0_result = [];
    var query1_result = [];
    var query2_result = [];
    var query3_result = [];
	
	var query0  = 'select round(avg(h_heartrate)) heart_rate, from_unixtime(create_ts,"%Y-%m-%d")recorded_Date from heartdata '+
		'where u_id = 1 and h_activity = 0 '+
		'group by Recorded_Date '+
		'ORDER BY RAND(), Recorded_Date;';
	
	var query1  = 'select round(avg(h_heartrate)) heart_rate, from_unixtime(create_ts,"%Y-%m-%d")recorded_Date from heartdata '+
		'where u_id = 1 and h_activity = 1 '+
		'group by Recorded_Date '+
		'ORDER BY RAND(), Recorded_Date;';
	
	var query2 = 'select upper(u_fname)fname from healthcare.userdetails where u_id=1;';
	
	
	var query3 = 'select round(t_rest_min)rest_min, round(t_rest_max)rest_max, round(t_active_min)active_min, '+
				 'round(t_active_max)active_max from healthcare.threshold where u_id = 1;';
		

	
    
    var yData0 = [];
    var yData1 = [];
    var xLabels0 = [];
    var xLabels1 = [];
    var dataLower0, dataUpper0;
    var dataLower1, dataUpper1;
    var heartRateLowerLimit0, heartRateUpperLimit0;
    var heartRateLowerLimit1, heartRateUpperLimit1;
    var user_Id = 1;
	
	
    var finishRequest = function() {

    	console.log('final query');
    	
//    	res.send('Fetching Query:\n' + query0_result);
        console.log(query0_result.length);
        
        for(var i=0;i<query0_result.length;i++){
        	yData0.push(query0_result[i].heart_rate);
        	xLabels0.push(query0_result[i].recorded_Date);
        }
        
        for(i=0;i<query1_result.length;i++){
        	yData1.push(query1_result[i].heart_rate);
        	xLabels1.push(query1_result[i].recorded_Date);
        }
        
        dataUpper0 = query0_result.length - 1;
        dataUpper1 = query1_result.length - 1;
        var fName = query2_result[0].fname;
        heartRateLowerLimit0 = query3_result[0].rest_min; 
        heartRateUpperLimit0 = query3_result[0].rest_max;
        heartRateLowerLimit1 = query3_result[0].active_min; 
        heartRateUpperLimit1 = query3_result[0].active_max;
        	
        
//        res.render('regressionGraph', {layout: false, locals: { activity0: query0_result, activity1: query1_result }});
        res.render('regressionGraph', {dataUpper0: dataUpper0, dataUpper1: dataUpper1, fName: fName,  
        	heartRateLowerLimit0: heartRateLowerLimit0, heartRateUpperLimit0: heartRateUpperLimit0,
        	yData0: yData0, yData1: yData1, xLabels0: xLabels0, xLabels1: xLabels1,
        	heartRateLowerLimit1:heartRateLowerLimit1, heartRateUpperLimit1:heartRateUpperLimit1});
    };



    function doQuery1(){

        con.query(query0, function(err, rows) {
    		if(err){
    			console.log("Error in Query0: " + err.message);
    		}
    		else 
    		{	
    			for (var i in rows) {
    				var newjson = {"heart_rate":rows[i].heart_rate,"recorded_Date":rows[i].recorded_Date};
    				query0_result.push(newjson);
    		    }
    			
    			console.log('inside function doQuery1:\n\n\n\n');
    			console.log(query0_result);
    			lock -= 1;
    			if (lock === 0) {
    	              finishRequest();
    	            }
    		}
    	});
    }
    
    function doQuery2(){
  	
      con.query(query1, function(err, rows){
  		if(err){
  			console.log("Error in Query1: " + err.message);
  		}
  		else 
  		{	
  			for (var i in rows) {
  				var newjson = {"heart_rate":rows[i].heart_rate,"recorded_Date":rows[i].recorded_Date};
  				query1_result.push(newjson);
  		    }
  			console.log('inside function doQuery2:\n\n\n\n');
  			console.log(query1_result);

  			lock -= 1;
            if (lock === 0) {
              finishRequest();
            }
  		}
  		
//  	    con.end();
      });
    }
    
    function doQuery3(){

        con.query(query2, function(err, rows) {
    		if(err){
    			console.log("Error in Query2: " + err.message);
    		}
    		else 
    		{	
    			for (var i in rows) {
    				var newjson = {"fname":rows[i].fname};
    				query2_result.push(newjson);
    		    }
    			
    			console.log('inside function doQuery3:\n\n\n\n');
    			console.log(query2_result);
    			lock -= 1;
    			if (lock === 0) {
    	              finishRequest();
    	            }
    		}
    	});
    }
    
    function doQuery4(){

        con.query(query3, function(err, rows) {
    		if(err){
    			console.log("Error in Query3: " + err.message);
    		}
    		else 
    		{	
    			for (var i in rows) {
    				var newjson = {"rest_min":rows[i].rest_min,"rest_max":rows[i].rest_max,"active_min":rows[i].active_min,"active_max":rows[i].active_max};
    				query3_result.push(newjson);
    		    }
    			console.log('inside function doQuery4:\n\n\n\n');
    			console.log(query3_result);
    			lock -= 1;
    			if (lock === 0) {
    	              finishRequest();
    	            }
    		}
    	});
    }
    
    doQuery1(); 
    doQuery2();
    doQuery3();
    doQuery4();
	
});


router.get('/getDynamicGraph',function(req,res){
	res.render('dynamicGraph');
});



/*router.get('/regressionGraph',function(req,res){
	
	var userId = req.body.userId;
	
	var query0  = 'select round(avg(h_heartrate)) heart_rate, from_unixtime(create_ts,"%Y-%m-%d")recorded_Date from heartdata '+
		'where u_id = 1 and h_activity = 0 '+
		'group by Recorded_Date '+
		'ORDER BY RAND(), Recorded_Date;';
	
	var query1  = 'select round(avg(h_heartrate)) heart_rate, from_unixtime(create_ts,"%Y-%m-%d")recorded_Date from heartdata '+
		'where u_id = 1 and h_activity = 1 '+
		'group by Recorded_Date '+
		'ORDER BY RAND(), Recorded_Date;';
	

    con.connect();
    var query0_result = [];
    var query1_result = [];

    function doQuery1(){
        var defered = Q.defer();
        
        con.query(query0, function(err, rows) {
    		if(err){
    			console.log("Error in Query0: " + err.message);
    		}
    		else 
    		{	
    			for (var i in rows) {
    				var newjson = {"heart_rate":rows[i].heart_rate,"recorded_Date":rows[i].recorded_Date};
    				query0_result.push(newjson);
    		    }
    			
    			console.log('inside function doQuery1:\n\n\n\n');
    			console.log(query0_result);
    		}
    	});
//        con.query(query0,defered.makeNodeResolver());
//        console.log("inside query1: "+JSON.stringify(defered.promise));
        return defered.promise;
    }
    
    

    function doQuery2(){
//        var defered = Q.defer();
//        con.query('SELECT 1 AS solution',defered.makeNodeResolver());
//        console.log("inside query2: "+JSON.stringify(defered.promise));
//        return defered.promise;
    	
        var defered = Q.defer();
        
        con.query(query1, function(err, rows) {
    		if(err){
    			console.log("Error in Query1: " + err.message);
    		}
    		else 
    		{	
    			for (var i in rows) {
    				var newjson = {"heart_rate":rows[i].heart_rate,"recorded_Date":rows[i].recorded_Date};
    				query1_result.push(newjson);
    		    }
    			
    			console.log('inside function doQuery2:\n\n\n\n');
    			console.log(query0_result);
    		}
    	});
        return defered.promise;
    	
    }

    Q.all([doQuery1(),doQuery2()]).then(function(){
//    	console.log('Before Stringify results');
//    	console.log(JSON.stringify('results: '+results));
//    	console.log('After Stringify results');
//    	console.log(results[0][0][0]);
//        res.send(JSON.stringify(results[0][0][0].solution+results[1][0][0].solution));
//    	res.send(JSON.stringify(results[0]));
        // Hint : your third query would go here
    	
    	console.log('final query');
    	
    	res.send('Fetching Query:\n' + query0_result);
        console.log(query0_result.length);
    });
   

	var noActivity = con.query(query0, function(err, rows) {
		if(err){
			console.log("Error in Query0: " + err.message);
		}
		else 
		{	
			for (var i in rows) {
				var newjson = {"heart_rate":rows[i].heart_rate,"recorded_Date":rows[i].recorded_Date};
				query0_result.push(newjson);
		    }
			
			console.log('inside function:\n\n\n\n');
			console.log(query0_result);
		}
	});
    
    
	
//	console.log(noActivity.results);
	res.send('Fetching Query:\n' + query0_result);
    console.log(query0_result.length);
    
    
    

    con.end();
	
	
	
	
	
	//res.render('regressionGraph.ejs');
});*/



module.exports = router;