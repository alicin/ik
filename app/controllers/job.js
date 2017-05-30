var Job = require('../models/job.js');

module.exports = {

  list: function (req, res) {
    Job.list(req._user, true)
    .then(function (jobs) {
      res.json(jobs);
    })
    .catch(function (error) {
      res.json({error: error});
    });
    
  },

  listByCategory: function (req, res) {

    Job.listByCategory(req._user, req.params.category, true)
    .then(function (jobs) {
      res.json({jobs: jobs});
    })
    .catch(function (error) {
      res.json({error: error});
    });

  },

  create: function (req, res) {

    Job.create(req.body)
    .then(function (response) {
      res.json(response);
    })
    .catch(function (error) {
      res.json({error: error})
    })
    
  },

  update: function (req, res) {
    Job.update(req.params.id, req.body)
    .then(function (response) {
      res.json(response);
    })
    .catch(function (error) {
      res.json({error: error})
    })
  },

  toggle: function (req, res) {
    Job.toggle(req.params.id)
    .then(function (response) {
      res.json(response);
    })
    .catch(function (error) {
      res.json({error: error})
    })
  },

  destroy: function (req, res) {
    Job.destroy(req.params.id)
    .then(function (data) {
      res.json(data)
    })
    .catch(function (error) {
      res.json({error: error})
    })
  }

}