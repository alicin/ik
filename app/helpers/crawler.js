var jsdom       = require("jsdom");
var request     = require('request');
var Job         = require('../models/job');
var env         = require('express')().get('env');

// Mail any malfunction in the crawlers
var nodemailer  = require('nodemailer');
var transporter = nodemailer.createTransport();

module.exports.init = function () {
  if ( env === 'test' ) {
    ['ui-design', 'arayuz', 'arayuz-tasarim', 'front-end', 'frontend', 'front end', 'back-end', 'backend', 'back end', 'ios', 'android', 'ux-design', 'software-project-manager', 'dev-ops', 'devops', 'linux', 'linux-admin', 'system-admin', 'photoshop', 'sketch'].forEach(function (query) {
      crawlers.linkedin(query);
    });
    // crawlers.bigumigu();
    // crawlers.webrazzi();
    // crawlers.mediaCat();
    // crawlers.dijitalAjanslar();
    setInterval(function () {
      ['ui-design', 'arayuz', 'arayuz-tasarim', 'front-end', 'frontend', 'front end', 'back-end', 'backend', 'back end', 'ios', 'android', 'ux-design', 'software-project-manager', 'dev-ops', 'devops', 'linux', 'linux-admin', 'system-admin', 'photoshop', 'sketch'].forEach(function (query) {
      crawlers.linkedin(query);
    });
      // crawlers.linkedin(query);
      // crawlers.bigumigu();
      // crawlers.webrazzi();
      // crawlers.mediaCat();
      // crawlers.dijitalAjanslar();
    }, 1000 * 60 * 60);
  };
};


var crawlers = {

  linkedin: function (query) {
    var base = 'https://www.linkedin.com/job/' + query + '-istanbul-jobs-istanbul/?sort=date';

    jsdom.env({
      url: base,
      scripts: ['http://code.jquery.com/jquery.js'],
      done: function (error, window) {
        if ( error ) return sendMail(error);
        var $ = window.$;

        try {
          
          $('.jobs > .job').each(function (index) {
            
            var obj = {
              source: $(this).find('a:eq(0)').attr('href').replace('?trk=jserp_job_details_company_logo', ''),
              logo: $(this).find('a:eq(0) img').attr('src'),
              title: $.trim($(this).find('.content > span').text()),
              organization: $.trim($(this).find('.content .company').text()),
              location: $.trim($(this).find('.details span:eq(0)').text()),
              jobTitle: $.trim($(this).find('.content > span').text()),
              posted_at: new Date($(this).find('.details > span:eq(1)').text())
            };

            console.log(obj);

            setTimeout(function () {
              Job.create(obj)
              .catch(function (error) {
                
              });
            }, index * 1000);

          });

        } catch ( error ) {
          sendMail(error);
        }
      }
    });
    
  },

  bigumigu: function () {
      var base = 'http://bigumigu.com/is-ilanlari'

      jsdom.env({
        url: base,
        scripts: ['http://code.jquery.com/jquery.js'],
        done: function (error, window) {
          if ( error ) return sendMail(error);
          var $ = window.$;
          try {
            
            $('.primary-job--item').each(function (index) {
              if ( !$(this).attr('id') ) return;
              var obj = {
                source: base.replace('/is-ilanlari', '') + $(this).find('a:eq(0)').attr('href'),
                logo: $(this).find('img').attr('src'),
                title: $(this).find('a:eq(3)').text(),
                organization: $(this).find('a:eq(1)').text(),
                location: $(this).find('.location').text(),
                jobTitle: $(this).find('a:eq(3)').text()
              };

              setTimeout(function () {
                Job.create(obj)
                .catch(function (error) {
                  
                });
              }, index * 1000);
            });

          } catch ( error ) {
            sendMail(error);
          }
        }
      });

  },

  mediaCat: function () {

    var base = 'http://www.mediacatonline.com/kariyer-merkezi/'

    jsdom.env({
      url: base,
      scripts: ['http://code.jquery.com/jquery.js'],
      done: function (error, window) {
        if ( error ) return sendMail(error);
        var $ = window.$;
        try {
          
          for (var i = 0; i < 3; i++) {
            
            $this = $('#content article').eq(i);
            var obj = {
              source: $this.find('.ilanTitle').attr('href'),
              logo: $this.find('.attachment-kariyerIlanlarWidget').attr('src'),
              title: $.trim($this.find('.ilanTitle').html().split('<br>')[0]),
              organization: $.trim($this.find('.ilanVeren').text()).split(' -')[0],
              location: $.trim($this.find('.ilanVeren').text()).split('- ')[1].replace('\n', ' '),
              jobTitle: $.trim($this.find('.ilanTitle').html().split('<br>')[0])
            };
            setTimeout(function () {
              Job.create(obj)
              .catch(function (error) {
                
              });
            }, i * 1000);
          };

        } catch ( error ) {
          sendMail(error);
        }
      }
    });
    
  },

  webrazzi: function () {
    
    var base = 'http://webrazzi.kariyer.net/?sayfa=1';

    jsdom.env({
      url: base,
      scripts: ['http://code.jquery.com/jquery.js'],
      done: function (error, window) {
        if ( error ) return sendMail(error);
        var $ = window.$;
        try {
          
          $('.ilan-list-item').each(function (index) {
            
            var obj = {
              source: base.replace('/?sayfa=1', '') + $(this).find('a:eq(0)').attr('href'),
              logo: $(this).find('a:eq(0) img').attr('src'),
              title: $(this).find('.ilan-title').text(),
              organization: $(this).find('.firm-name').text(),
              location: $(this).find('.ilan-cities').text(),
              jobTitle: $(this).find('.ilan-title').text()
            };


            setTimeout(function () {
              Job.create(obj)
              .catch(function (error) {
                
              });
            }, index * 1000);

          });

        } catch ( error ) {
          sendMail(error);
        }
      }
    });

  },

  dijitalAjanslar: function () {
    
    var base = 'http://www.dijitalajanslar.com/kariyer/';

    jsdom.env({
      url: base,
      scripts: ['http://code.jquery.com/jquery.js'],
      done: function (error, window) {
        if ( error ) return sendMail(error);
        var $ = window.$;
        try {
          
          $('.content-area > h4').each(function (index) {
            
            var obj = {
              source: $(this).find('a:eq(0)').attr('href'),
              logo: $(this).find('a:eq(0) img').attr('src'),
              title: $(this).find('a:eq(0)').text(),
              organization: $(this).next().html().split('<br>')[0],
              location: $(this).next().html().split('<br>')[1].replace('\n', ''),
              jobTitle: $(this).find('a:eq(0)').text()
            };

            setTimeout(function () {
              Job.create(obj)
              .catch(function (error) {
                
              });
            }, index * 1000);

          });

        } catch ( error ) {
          sendMail(error);
        }
      }
    });

  }

}

var sendMail = function (error) {
  console.log(error);
  transporter.sendMail({
      from: 'crawler@isguc.co',
      to: 'alicanbardakci@gmail.com',
      subject: 'Malfunction in the crawler',
      text: 'bigumigu crawler not working because of :\n\n' + error
  });
}