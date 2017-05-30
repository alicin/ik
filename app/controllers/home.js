var Job = require('../models/job');

module.exports = {
  show: function (req, res) {
    if ( req.query.r ) {

      if ( req.query.r.indexOf('http') > -1 ) return res.redirect(req.query.r);

      Job.findById(req.query.r, function (err, job) {
        Job.incrementAction(req.query.r);
        res.redirect(job.source);
      })
      return;
    };
    res.render('index');
  }
}
