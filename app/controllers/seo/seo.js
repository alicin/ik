var Job    = require('../../models/job');
var moment = require('moment');

module.exports = {

  home: function (req, res, next) {
    if ( req.query['_escaped_fragment_'] !== '' ) return next();

    Job.list(null, true)
    .then(function (data) {
      res.render('seo/index', {
        jobs: data,
        getTimeInWords: function (timestamp) {
          return moment(timestamp).locale('tr').format('DD MMMM');
        }
      });
    })
    .catch(function (error) {
      res.json({error: error});
    })

  }

}