var Twitter = require('twitter');
 
var client = new Twitter({
  consumer_key: 'Hpw5i2tdsg6jQeyI0bd0XF4pn',
  consumer_secret: 'Pmsg6t1J7A9E1id9fOzBeVKKQjXyY21sQEm32i3KgLVFIVnjAb',
  access_token_key: '4015552259-JPKgQyhfZc7mTvDLmrhiv5yVjt7XqT20c70wK8w',
  access_token_secret: '5FOJokOYhePekTCCYzKKMmDgp6ZUHtmVgwRQxbXPlb8gl'
});

module.exports = function (message) {
  
  client.post('statuses/update', {status: message},  function(error, tweet, response){
    if(error) console.log(error);
  });

};