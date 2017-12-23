var port = 3003;

var express = require('express');
var app = express();
var mongoose = require('mongoose');
var router = express.Router();

var bodyParser = require('body-parser');
var cors = require('cors');
var result = require('./result');


var request = require('request');

var http = require('http');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const env = process.env.NODE_ENV || 'development';

const mongoUrl = env == 'production' ? 'mongodb://recall_mongo:27017/results' : 'mongodb://localhost:27017/results'

mongoose.connect(mongoUrl);

router.use(function (req, res, next) {
    // do logging 
    // do authentication 
    console.log('Listening');
    next(); // make sure we go to the next routes and don't stop here
});


router.get('/stat', function(req, res) {
	console.log('getting stat');
	return request.get('http://api.pensive.cewit.stonybrook.edu/moments/api/status')
	.on('data', function(data) {
		console.log('Got response' + JSON.stringify(data));
		return res.status(200).json({moments: 'ok'});
	})
	.on('error', function(err) {
		return res.status(500).json({moments: 'errpr'});
	})
})



router.get('/recall/createexam/:moment_id/:ques_code', function (req, res) {
    // What - 16, When - 8, Who - 4, Where - 2, Why - 1
    // console.log('Inside create moments');

    const momentId = req.params.moment_id;
    var url = 'http://api.pensive.cewit.stonybrook.edu/moments/api/moments/' + momentId; 
    request.get(url)
    	.on('data', function(data) {
	    var json_data = JSON.parse(data);
            // console.log('Got response : ' + json_data['isProcessed']);
	    // return res.status(200).json({moments: 'ok'});

            var optionArray = [];
	    if (json_data == null) {
                return res.json({ message: 'Photo not found' });
            } else if (!json_data.isProcessed) { // Reverse the condition.
                return res.json({ message: 'This photo does not have enough data' });
            } else {
		optionArray.push(new Option(momentId,
					    json_data.assistantInputs.where,
					    json_data.assistantInputs.why,
					    json_data.assistantInputs.when,
					    json_data.assistantInputs.who,
					    json_data.assistantInputs.what,
					    true,
					    req.params.ques_code,
					    json_data.imageURL));

		// Change the URL to get the moments where isProcessed is true
		url = 'http://api.pensive.cewit.stonybrook.edu/moments/api/moments/getProcessedMoments/1';
        	// console.log('URL : ' + url);

        	request.get(url)
            	    .on('response', function(response) {
                	var photos = '';
                	response.on('data', function(chunk) {
                    	    photos += chunk;
                	});
               		 response.on('end', function() {
			    var photos_data = JSON.parse(photos);
			    // console.log(photos_data);
			    var momentCount = photos_data.length;
			    var noOfOptions = 3;

			    if (momentCount < noOfOptions) {
                    		return res.json({ message: 'Not enough data to create options!!' });
                	    }

			    
			    var discardedSet = []

                	    while (optionArray.length < noOfOptions) {
                    	        if (discardedSet.length > photos_data.length - noOfOptions - 1) {
                        	    return res.json({ message: 'Not enough data to create options!!' });
                    	        }

                        	var max = Math.floor(momentCount);
                        	var min = Math.ceil(0);
                        	var index = Math.floor(Math.random() * (max - min)) + min;

                    		var found = false;
                    		for (var i=0; i<discardedSet.length; i++) {
                        	    if (index == discardedSet[i])
                            		found = true;
                    		}

                    		if (found == true)
                        	    continue;

                    		//console.log("Index : " + index);
                    		//console.log("Added to the set : " + moments[index].momentid);
                    		var validQues = true;

                    		for (var i=0; i<optionArray.length && validQues; i++) {
                        	    var ques_code = req.params.ques_code
                        	    var quesCount = 0;
                        	    var matchCount = 0;
                        
				    if (ques_code >= 16) {
                            		ques_code = ques_code - 16;
                            		quesCount++;
                            		if (optionArray[i].what == photos_data[index].assistantInputs.what) {
                                	    //console.log("what false");
                                	    matchCount++;
                            		}
                        	    }
                        	    if (ques_code >= 8) {
                            		ques_code = ques_code - 8;
                            		quesCount++;
                            		if (optionArray[i].when == photos_data[index].assistantInputs.when) {
                                	    //console.log("when false");
                                	    matchCount++;
                            	 	}
                        	    }
                        	    if (ques_code >= 4) {
                            		ques_code = ques_code - 4;
                            		quesCount++;
                            		if (optionArray[i].who == photos_data[index].assistantInputs.who) {
                                	    //console.log("who false");
                                	    matchCount++;
                            		}
                        	    }
                        	    if (ques_code >= 2) {
                            		ques_code = ques_code - 2;
                            		quesCount++;
                            		if (optionArray[i].where == photos_data[index].assistantInputs.where) {
                                	    //console.log("where false");
                                	    matchCount++;
                            		}
                        	    }
                        	    if (ques_code >= 1) {
                            		ques_code = ques_code - 1;
                            		quesCount++;
                            		if (optionArray[i].why == photos_data[index].assistantInputs.why) {
                                	    //console.log("why false");
                                	    matchCount++;
                            		}		
                        	    }	

                        	    if (quesCount == matchCount) {
                            		validQues = false;
				    }
                    		}

                    		if (validQues) {
				    console.log('Question code : ' + req.params.ques_code);
				    optionArray.push(new Option(photos_data[index].momentId,
                                        photos_data[index].assistantInputs.where,
                                        photos_data[index].assistantInputs.why,
                                        photos_data[index].assistantInputs.when,
                                        photos_data[index].assistantInputs.who,
                                        photos_data[index].assistantInputs.what,
                                        false,
                                        req.params.ques_code,
					photos_data[index].imageURL));
                    		}

                    		discardedSet.push(index);
                	    }

		            //console.log("--->>>>>>>>>>>>>>> Printing final answer");

                	    max = Math.floor(4);
                	    min = Math.ceil(1);
                	    index = Math.floor(Math.random() * (max - min)) + min;

                	    var temp = optionArray[0];
                	    optionArray[0] = optionArray[index];
                	    optionArray[index] = temp;

                	    return res.json(optionArray);
                	})
            	    })
            	    .on('error', function(err) {
                	return res.status(500).json({moments: 'errpr'});
            	    })
	    }
        })
        .on('error', function(err) {
            return res.status(500).json({moments: 'errpr'});
        })
});

function Option(momentid, where, why, when, who, what, isCorrect, ques_code, url) {
    // What - 16, When - 8, Who - 4, Where - 2, Why - 1
    if (ques_code >= 16) {
        ques_code = ques_code - 16;
        this.what = what;
    }
    if (ques_code >= 8) {
        ques_code = ques_code - 8;
        this.when = when;
    }
    if (ques_code >= 4) {
        ques_code = ques_code - 4;
        this.who = who;
    }
    if (ques_code >= 2) {
        ques_code = ques_code - 2;
        this.where = where;
    }
    if (ques_code >= 1) {
        ques_code = ques_code - 1;
        this.why = why;
    }
    this.imageUrl = url;
    this.momentid = momentid;
    this.isCorrect = isCorrect;
}

router.get('/recall/examresults/', function (req, res) {
    result.find(function (err, results) {
        if (err) {
            res.send(err);
        }
        res.send(results);
    });
});

router.post('/recall/examresults/', function (req, res) {
    console.log('Posting the results');
    var r = new result();
    r.momentid = req.body.momentid;
    r.passed = req.body.passed;
    r.warmness = req.body.warmness;
    r.tenderness = req.body.tenderness;
    r.connection = req.body.connection;
    r.frontenddata = req.body.frontenddata;

    r.save()
    .then(item => {
    res.send("Results saved to database");
    })
    .catch(err => {
        console.error(err.message);
        console.error(err.stack);
        res.status(400).send({ error: err })

    });
});


router.route('/status').get((req, res) => {
    return res.status(200).json({
        success: true
    })
})


app.use(cors());
app.use('/api', router);
app.listen(port);
console.log('Baycrest API is runnning at ' + port);
