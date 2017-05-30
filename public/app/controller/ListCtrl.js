app.controller('ListCtrl', ['$scope', 'Job',
  function (                 $scope,   Job ) {

    Job.list()
    .then(function (data) {
      if ( data.error ) return console.log(data.error);
      $scope.jobs = data;
    })
    .catch(function (error) {
      console.log(data);
    });

    $scope.getTimeInWords = function (timestamp) {
      return moment(timestamp).format('DD MMMM');
    };

    // Admin Action

    $scope.approve = function (job) {
      if ( confirm('Are you sure?') ) {
        var self = this;

        Job.update(job, true)
        .then(function (data) {
          if ( data.error ) return console.log(data.error);
          self.job = data;
        })
        .catch(function (error) {
          console.log(error);
        })
      }
    };

    $scope.toggleState = function (id) {
      if ( confirm('Are you sure?') ) {
        var self = this;

        Job.toggle(id)
        .then(function (data) {
          if ( data.error ) return console.log(data.error);
          self.job.active = data.active;
        })
        .catch(function (error) {
          console.log(error);
        })
      }
    };

    $scope.delete = function (id) {
      if ( confirm('Are you sure?') ) {
        Job.destroy(id)
        .then(function (data) {
          if ( data.error ) return console.log(data.error);
          delete self;
        })
        .catch(function (error) {
          console.log(error);
        })
      }
    };
  
}])