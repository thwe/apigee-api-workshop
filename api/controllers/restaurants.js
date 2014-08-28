request = require('request');
async = require('async');

module.exports = {
	getRestaurants: getRestaurants,
	getRestaurantByID: getRestaurantByID
}

function getRestaurants (req, res) {
	request('http://localhost:8080/workshop/sandbox/restaurants', function(error, response, body) {
        if (error) {
            res.send(error);
        } else {
            res.send(body);
        }
    });
}

function getRestaurantByID (req, res) {
	var restID = req.swagger.params.id.value;
	async.parallel({
            restaurant: function(callback) {
                request("http://localhost:8080/workshop/sandbox/restaurants/?ql=restID=" + restID, function(error, response, body) {
                    if (error) {
                        res.send(error);
                    } else {
                        var result = JSON.parse(body);
                        callback(null, result);
                    }
                });
            },
            reviews: function(callback) {
                async.waterfall([
                    function(callback) {
                        request("http://localhost:8080/workshop/sandbox/reviews/?ql=restID=" + restID, function(error, response, body) {
                            if (error) {
                                res.send(error);
                            } else {
                                data = JSON.parse(body);
                                callback(null, data);
                            }
                        });
                    },
                    function(data, callback) {
                        var l = data.entities.length;
                        var aggregate = 0;
                        var i;
                        for (i = 0; i < l; i++) {
                            aggregate += data.entities[i].rating;
                        }
                        aggregate = {
                            aggregate: +(aggregate / i).toFixed(2)
                        }
                        callback(null, data, aggregate);
                    }
                ], callback);
            }
        },
        function(err, results) {
            res.send(results);
        });
}