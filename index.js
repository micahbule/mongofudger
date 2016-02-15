var config = {
	db: {
		server: 'localhost',
		name: 'beautify-demo'
	}
};
var mongoose = require('mongoose');
var async = require('async');

initiate();

function initiate() {
	mongoose.connect('mongodb://' + config.db.server + '/' + config.db.name);
	var db = mongoose.connection;

	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function() {
		console.log('Connected to DB');
		startProcess(function (err) {
			if (err) console.log(err);

			console.log('Process done!');

			process.exit();
		});
	});
}

function startProcess(done) {
	var models = loadModels();

	models.tag.find(function (err, tags) {
		if (err) return done(err);

		async.each(tags, attachFilters, function (err) {
			return done(err);
		});
	});

	function attachFilters(tag, callback) {
		var filters = [];

		models.tagFilter.find({ tagId: tag._id }, function (err, tagFilters) {
			tagFilters.forEach(function (filter) {
				filters.push({ filterName: filter.name, filterValues: filter.values });
			});

			tag.filter = filters;
			tag.save(function (err) {
				return callback(err);
			});
		});
	}
}

function loadModels() {
	var tagFilterSchema = mongoose.Schema({
		name: String,
		tagId: mongoose.Schema.ObjectId,
		values: [String]
	});

	var tagSchema = mongoose.Schema({
		name: String,
		parentId: mongoose.Schema.ObjectId,
		filter: [{
			filterName: String,
			filterValues: [String]
		}]
	});

	var tagFilterModel = mongoose.model('tagfilters', tagFilterSchema);
	var tagModel = mongoose.model('tag', tagSchema);

	return { tagFilter: tagFilterModel, tag: tagModel };
}
