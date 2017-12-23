var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var mongoose = require('mongoose');
var moment = require('./moment');
var NodeGeocoder = require('node-geocoder');
var app = express();
//app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var port = process.env.PORT || 3002;
var router = express.Router();
var fetch = require('node-fetch');

var imageList = []
var momentList = []

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*,localhost:3000");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


    
//mongoose.connect('mongodb://mongo:27017/photos');
const env = process.env.NODE_ENV || 'development';

const mongoUrl = env == 'production' ? 'mongodb://moments_mongo:27017/photos' : 'mongodb://localhost:27017/photos'

mongoose.connect(mongoUrl);

router.route('/moments').get(function (req, res) {
    moment.find(function (err, moments) {
        if (err) {
            res.send(err);
        }
        res.json(moments);
    });
});

// Return moment based on moment id
router.route('/moments/:momentId').get(function (req, res) {

    moment.findOne({momentId: req.params.momentId}, function (err, moment) {
        if (err)
            res.send(err);
        res.json(moment);
    });
});

// Return all processed moments
router.route('/moments/getProcessedMoments/:processed').get(function(req,res){
       
    moment.find({isProcessed: true},function(err, moments){
	if(err)
		res.send(err);
	res.json(moments);
     });

});

// Return selected metadata for moment
router.route('/moments/:momentId/getSelectedData').get(function (req, res) {

    moment.findOne({momentId: req.params.momentId}, function (err, moment) {
        if (err)
            res.send(err);
        res.json(moment.chosenMetadata);
    });
});


// Return 5W assistant input data for moment
router.route('/moments/:momentId/getWData').get(function (req, res) {

    moment.findOne({momentId: req.params.momentId}, function (err, moment) {
        if (err)
            res.send(err);
        res.json(moment.assistantInputs);
    });
});


// Return image url for moment
router.route('/moments/:momentId/getImageURL').get(function (req, res) {

    moment.findOne({momentId: req.params.momentId}, function (err, moment) {
        if (err)
            res.send(err);
        res.json(moment.imageURL);
    });
});


function getPhotoId(metadata){
    var photoid = metadata.body.id;
    return photoid

}

function getPhotoSource(metadata){

    var photoSrc = metadata.body.service_type;
    return photoSrc
}

function checkProcessed(assistantInputs){

   /*
    var what = assistantInputs.what;
    var who = assistantInputs.who;
    var where = assistantInputs.where;
    var why = assistantInputs.why;
    var when = assistantInputs.when;
    return (what!=null && who!=null && where!=null && why!=null && when!=null && what.length>0 && who.length>0 && why.length>0); 
    */
    return true;
}

function checkAccessible(metadata){
    return true
}

function checkTrashed(metadata, source){
    if(source == "google")
        return metadata.body.trashed;
    else
        return !metadata.body.link;
}

function getImageURL(metadata, source){
    if(source == "google")
        return metadata.body.webViewLink;
    else
        return metadata.body.link;
}

function getWDataFacebook(metadata){

    var location = metadata.body.place.location;
    if(location!=null){
        var city = location.city;
        var country = location.country;
        var state = location.state;
    }
    var time = metadata.body.created_time;
    var whereobj = {"city": city, "state" : state, "country": country};
    var lastModified = new Date();
    return {"who" : ["abc"], "what": ["celebration"], "why": ["birthday"], "when": time, "where": whereobj, "lastModified" : lastModified};
}

function getWDataGoogle(metadata){

    var location = metadata.body.imageMediaMetadata.location;
    if(location!=null){
        var lat = location.latitude;
        var long = location.longitude;
    }
    var time = metadata.body.imageMediaMetadata.time;
    var whereobj = {"latitude": lat, "longitude": long};
    var lastModified = new Date();
    return {"who" : ["abc"], "what": ["celebration"], "why": ["bday"], "when": time, "where": whereobj, "lastModified" : lastModified};
}

function getSelectedDataGoogle(metadata){
    var metadataObject = {"canDownload": null, "thumbnail_image" : null, "thumbnail_mimetype" : null, "createdTime" : null, "description" : null,
    "fullFileExtension" : null, "hasThumbnail" : null, "id" : null, "height" : null, "time": null, "width" : null, "location_altitude" : null, 
    "location_latitude" : null, "location_longitude" : null, "md5Checksum" : null, "mimeType" : null, "name" : null, "originalFilename" : null,
    "owners" : null, "properties" : null, "sharedWithMeTime" : null, "size" : null,  "webContentLink" : null, 
    "webViewLink" : null};

     if(metadata.body.capabilities!=null)
        metadataObject.canDownload = metadata.body.capabilities.canDownload;

     if(metadata.body.contentHints!=null){
        metadata.thumbnail_image = metadata.body.contentHints.Thumbnail.image;
        metadata.thumbnail_mimetype = metadata.body.contentHints.Thumbnail.mimeType;
    }

    metadataObject.createdTime = metadata.body.createdTime;
    metadataObject.description = metadata.body.description;
    metadataObject.fullFileExtension = metadata.body.fullFileExtension;
    metadataObject.hasThumbnail = metadata.body.hasThumbnail;
    metadataObject.id = metadata.body.id;
    metadataObject.height = metadata.body.imageMediaMetadata.height;
    metadataObject.width = metadata.body.imageMediaMetadata.width;
    metadataObject.time = metadata.body.imageMediaMetadata.time;
    if(metadata.body.imageMediaMetadata.location!=null){
        metadataObject.location_altitude = metadata.body.imageMediaMetadata.location.altitude;
        metadataObject.location_longitude = metadata.body.imageMediaMetadata.location.longitude;
        metadataObject.location_latitude = metadata.body.imageMediaMetadata.location.latitude;
    }
    metadataObject.md5Checksum = metadata.body.md5Checksum;
    metadataObject.mimeType = metadata.body.mimeType;
    metadataObject.name = metadata.body.name;
    metadataObject.originalFilename = metadata.body.originalFilename;
    metadataObject.webViewLink = metadata.body.webViewLink;
    metadataObject.webContentLink = metadata.body.webContentLink;
    metadataObject.size = metadata.body.size;
    metadataObject.sharedWithMeTime = metadata.body.sharedWithMeTime;
    metadataObject.properties = metadata.body.properties;
    if(metadata.body.owners!=null){
        var owners_num = metadata.body.owners.length;
        var owners = [];
        for(i=0;i<owners_num;i++)
        {
            var name = metadata.body.owners[i].displayName;
            var addr = metadata.body.owners[i].emailAddress;
            owners.push({"displayName" : name, "emailAddress":addr});
        }
    }
    metadataObject.owners = owners;

    return metadataObject;

}

function getSelectedDataFacebook(metadata){
    var metadataObject = {"canDelete": null, "canTag" : null, "createdTime" : null,"icon" : null, "id" : null, "height" : null,
    "width" : null, "location_latitude" : null, "location_longitude" : null, "name" : null, "tags" : null, "link" : null};

    metadataObject.canDelete = metadata.body.can_delete;
    metadataObject.canTag = metadata.body.can_tag
    metadataObject.createdTime = metadata.body.created_time;
    metadataObject.icon = metadata.body.icon;
    metadataObject.id = metadata.body.id;
    metadataObject.height = metadata.body.height;
    metadataObject.width = metadata.body.width;
    if(metadata.body.place.location!=null){
        metadataObject.location_longitude = metadata.body.place.location.longitude;
        metadataObject.location_latitude = metadata.body.place.location.latitude;
    }
    metadataObject.name = metadata.body.name;
    metadataObject.tags = metadata.body.tags;
    metadataObject.link = metadata.body.link;
    return metadataObject;
}

function getWData(metadata, src){

    if(src == "google")
        return getWDataGoogle(metadata)
    else if(src=="facebook")
        return getWDataFacebook(metadata)
}

function getSelectedData(metadata, src){

    if(src == "google")
        return getSelectedDataGoogle(metadata)
    else if(src == "facebook")
        return getSelectedDataFacebook(metadata)
}

function getMLDataGoogle(metadata){
    var location = metadata.body.imageMediaMetadata.location;
    if(location!=null){
        var lat = location.latitude;
        var long = location.longitude;
    }
    var time = metadata.body.imageMediaMetadata.time;
    var whereobj = {"latitude": lat, "longitude": long};
    var lastModified = new Date();
    return {"who" : [], "what": [], "why": [],"when": time, "where": whereobj, "lastModified": lastModified};
    // TODO : Call ML apis to fetch tags for who

}

function getMLDataFacebook(metadata){
    var location = metadata.body.place.location;
    if(location!=null){
        var city = location.city;
        var country = location.country;
        var state = location.state;
    }
    var time = metadata.body.created_time;
    var whereobj = {"city": city, "state" : state, "country": country};
    var lastModified = new Date();
    return {"who" : [], "what": [], "why": [], "when": time, "where": whereobj, "lastModified" : lastModified};
}

function getMLData(metadata, src){

    if(src == "google")
        return getMLDataGoogle(metadata)
    else if(src == "facebook")
        return getMLDataFacebook(metadata)

}

function trainModel(momentList, imageList){
    console.log(momentList);
    console.log(imageList);
    /*
    var json = {"imageURL" : imageList, "momentId" : momentList};
    console.log("Calling ML API to train model");
    const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
        },
    body: JSON.stringify({
        imageURL: imageList,
        momentId: momentList
    }),
    };
    fetch('http://localhost:9001/train_model', options)
    .then(function(res) {
        return res.json();
    }).then(function(json) {
        console.log(json);
    }).catch(console.log);
    */
}

router.route('/moments').post(function (req, res) {
    var newMoment = new moment();
    var source = getPhotoSource(req);
    if(source==null){
        res.status(400).send({ error: "Bad Request : Image source missing"});
        return;
    }
    newMoment.momentIndex = req.body.id;
    newMoment.momentId = source+"_"+req.body.id;
    newMoment.assistantInputs = getWData(req, source);
    newMoment.MLInputs = getMLData(req, source);
    newMoment.chosenMetadata = getSelectedData(req, source);
    newMoment.rawMetadata = req.body;
    newMoment.photoSource = source;
    newMoment.isProcessed = checkProcessed(newMoment.assistantInputs);
    newMoment.isAccessible = checkAccessible(req);
    newMoment.isTrashed = checkTrashed(req, source);
    newMoment.imageURL = getImageURL(req, source);
    newMoment.userName = req.body.userName;

    // Check if image URL is present
    if(newMoment.imageURL == null){
        res.status(400).send({ error: "Bad Request : Image URL missing"});
        return;
    }
    newMoment.initialTimeStamp = new Date();
    
    // Add to the lists
    momentList.push(newMoment.momentId);
    imageList.push(newMoment.imageURL);
    newMoment.isLastMoment = req.body.lastPhoto;
    if(newMoment.isLastMoment == true){
        // CALL ML API TO TRAIN MODEL
        trainModel(momentList, imageList);
        momentList = [];
        imageList = [];
    }

    newMoment.save()
    .then(item => {
      res.send("item saved to database");
    })
    .catch(err => {
        console.error(err.message);
        console.error(err.stack);
        res.status(400).send({ error: err })
        
    });
});



router.route('/MLUpdate/:momentId').put(function (req, res) {
    moment.findOne(req.params.momentId, function (err, updatedMoment) {
        if (err) {
            res.send(err);
        }
		
		updatedMoment.MLInputs = req.body.MLInputs;
		updatedMoment.save()
			.then(item => {
			  res.send("moment updated in database");
			})
			.catch(err => {
				console.error(err.message);
				console.error(err.stack);
				res.status(400).send({ error: err})
			});
});

});




router.route('/moments/:momentId').put(function (req, res) {
    moment.findOne(req.params.momentId, function (err, updatedMoment) {
        if (err) {
            res.send(err);
        }
		var nameList=[];
		//Take the names from the assistant Inputs
                for(var i=0;i<req.body.assistantInputs.who.length;i++){
			var obj = req.body.assistantInputs.who;
			nameList.push(obj[i].faceName);
		}

		//trigger ML call with momentID and list of names
		
		updatedMoment.assistantInputs = req.body.assistantInputs;
		updatedMoment.isProcessed = checkProcessed(req.body.assistantInputs);
		updatedMoment.save()
			.then(item => {
			  res.send("moment updated in database");
			})
			.catch(err => {
				console.error(err.message);
				console.error(err.stack);
				res.status(400).send({ error: err})
			});
});

});


//get Moment ID and Image URL list
router.route('/getMomentIDImageURLList').get(function (req, res) {
    moment.find({}, {momentId : 1,imageURL:1},function(err,moments){
        if (err) {
            res.send(err);
        }
        res.json(moments);
    })
});

//get place from lat and long using reverse geo coding
router.route('/getPlaceFromLatLong/:lati/:long').get(function (req, res) {
	var finalData;
	var options = {
		  provider: 'google',
		 
		  // Optional depending on the providers
		  httpAdapter: 'https', // Default
		  apiKey: 'AIzaSyAIItWpoo76O75_qOcQJ5cLYMh0wMabs2s',
		  formatter: null
		};
		 
	var geocoder = NodeGeocoder(options);
	geocoder.reverse({lat:req.params.lati, lon:req.params.long}, function(err, res1) {
  	res.json(res1);
});

});

//     moment.find({}, {momentId : 1,imageURL:1},function(err,moments){
//         if (err) {
//             res.send(err);
//         }

//         res.json(moments);
//     })
// });

    /*
    moment.find(function (err, moments) {
        if (err) {
            res.send(err);
        }
	var item = {};
	
	for(var i=0;i< moments.length;i++){
		item[moments[i]._id]=moments[i].imageURL;
	}
        res.json(item);
    });
});
    */
// Deletes a momment based on momnent id
router.route('/moments/:momentId').delete(function (req, res) {

    moment.remove({momentId: req.params.momentId}, function (err, prod) {
        if (err) {
            res.send(err);
        }
        res.json({ message: 'Moment successfully deleted' });
    })

});

router.route('/status').get((req, res) => {
    return res.status(200).json({
        success: true
    })
})

app.use('/api', router);

// app.get('/status', (req, res) => {
//     return res.status(200).json({
//         success: true
//     })
// })
app.listen(port);
console.log('Moments API is runnning at ' + port);
