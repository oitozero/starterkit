var config = require('./config');

before('protect from forgery', function () {
  protectFromForgery('92e859ae9f1e7a7014c43526b00b3c2d1a57d7f4');
});

action(function index() {
    render({ 
        page_title: config.name,
        header_title: config.name,
        footer_title: config.name,
        social: config.social,
        tracking_id: config.analytics.tracking_id
    });
});

action(function subscribe() {

    Subscriber.create(req.body, function (err) {
        if (err) {
            send({error: 'Something went wrong!'});
        } else {
            send({output: 'Thank you!'});
            setTimeout(function(){ 
                send_email(req.body.email, function(token){
                    // save token
                    Subscriber.findOne({where: {email: req.body.email}}, function (err, subscriber) {
                        if (err || !subscriber) {
                            console.log("error: " + err);    
                        } else {
                            subscriber.confirmation_token = token;
                            subscriber.save();
                        }
                    });

                });
                //send_email_via_mailchimp();
            }, 500);
        }
    });
});

action(function confirm() {
    Subscriber.findOne({where: {confirmation_token: params.id}}, function (err, subscriber) {
        if (err || !subscriber) {
            render({ 
                page_title: config.name,
                header_title: config.name,
                footer_title: config.name,
                message: "Something went wrong!"
            }); 
        } else {
            subscriber.confirmed_at = new Date();
            subscriber.save();
            render({ 
                page_title: config.name,
                header_title: config.name,
                footer_title: config.name,
                message: "Thank you!"
            });
        }
    }); 

});

action(function new_admin() {
    render({
        page_title: config.name,
        header_title: config.name + " - new",
        footer_title: config.name
    });
});
action(function save_admin() {
    
    var is_valid = false;

    if(!isEmail(req.body.admin_email)){
        flash('error', 'Insert a valid email');
    }
    else if(isEmpty(req.body.admin_password) || isEmpty(req.body.admin_repeat_password)){
        flash('error', 'Insert a valid password');
    }
    else if(req.body.admin_password !== req.body.admin_repeat_password){
        flash('error', 'Passwords dont match');
    } else{
        is_valid = true;
    }

    if(is_valid === true){
        createAdmin(req.body.admin_email, req.body.admin_password, function (){
            redirect("/admin");   
        });
    } else{
        render('new_admin', {
            page_title: config.name,
            header_title: config.name + " - admin",
            footer_title: config.name
        });
    }
});

function isEmail(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
} 
function isEmpty(str) {
    return (!str || 0 === str.length);
}
function createAdmin(email, password, cb){
    admin = new compound.models.Admin;
    admin.email = email;
    admin.password = password;

    compound.models.Admin.create(admin, function (err, admin) {
        cb(admin);
    });
}

action(function login() {
    compound.models.Admin.count({}, function (err, count) {
        
        if(err || count === 0){
            redirect("/admin/new");
        } else{

            render({
                page_title: config.name,
                header_title: config.name + " - login",
                footer_title: config.name
            });
        }
    });
});
action(function validate_login() {
    compound.models.Admin.find(1, function (err, admin) {
        if(req.body.admin_email === admin.email && req.body.admin_password === admin.password){
            req.session.is_auth = true;
            redirect("/admin");
        } else{
            flash('error', 'Invalid Login');
            render("login",{
                page_title: config.name,
                header_title: config.name + " - login",
                footer_title: config.name
            });
        }
    });
});

action(function admin() {
    compound.models.Admin.count({}, function (err, count) {
        
        if(err || count === 0){
            redirect("/admin/new");
        } else{
            if(!req.session.is_auth){
                redirect("/admin/login");   
            } else{

                load_pageviews(function (pv_counter){
                    Subscriber.all(function (err, subscribers) {
                        switch (params.format) {
                            case "json":
                                send({code: 200, data: subscribers});
                                break;
                            default:
                                render({
                                    page_title: config.name,
                                    header_title: config.name + " - admin",
                                    footer_title: config.name,
                                    subscribers: subscribers,
                                    pageviews: pv_counter
                                });
                        }
                    });    
                });
            }
        }
    });
});

function send_email(to, cb){

    var __cwd = process.cwd();

    var path           = require('path')
      , templatesDir   = path.resolve(__cwd, 'app/templates')
      , emailTemplates = require('email-templates')
      , nodemailer     = require('nodemailer');

    
    emailTemplates(templatesDir, function(err, template) {

      if (err) {
        console.log(err);
      } else {

        var config = require('./config');

        // Prepare nodemailer transport object
        var transport = nodemailer.createTransport("SMTP", {
            host: config.email.smtp,
            secureConnection: config.email.ssl, // use SSL
            port: config.email.port, // port for secure SMTP
            auth: {
                user: config.email.username,
                pass: config.email.password
            }
        });

        // 
        var confirmation_token = generate_token();
        
        var locals = {
          email: to,
          confirm_link: config.social.link+"/confirm/" + confirmation_token,
          support_email: config.email.support
        };

        // Send a single email
        template('invite', locals, function(err, html, text) {
          if (err) {
            console.log(err);
          } else {
            transport.sendMail({
              from: config.email.from,
              to: locals.email,
              subject: config.name + ' - ' + 'Please Confirm Subscription',
              html: html,
              // generateTextFromHTML: true,
              text: text
            }, function(err, responseStatus) {
              if (err) {
                console.log(err);
              } else {
                console.log(responseStatus.message);
                cb(confirmation_token);
              }
            });
          }
        });
    }
    });
}

function generate_token(cb){
    return require('node-uuid').v1();
}

function load_pageviews (cb) {

    var config = require('./config');

    var GA_USER = config.analytics.username;
    var GA_PASSWORD = config.analytics.password;
    var GA_PROFILE_ID = config.analytics.profile_id;
    var GA_START_DATE = "2012-01-01";
    var GA_END_DATE = format_date(new Date());

    var GA = require('googleanalytics'),
        util = require('util'),
        config = {
            "user": GA_USER,
            "password": GA_PASSWORD
        }

    var pv_counter = 0;
    
    try{
        ga = new GA.GA(config);
        ga.login(function(err, token) {
            var options = {
                'ids': GA_PROFILE_ID,
                'start-date': GA_START_DATE,
                'end-date': GA_END_DATE,
                'dimensions': 'ga:date',
                'metrics': 'ga:pageviews',
                'sort': 'ga:date'
            };

            ga.get(options, function(err, entries) {
                if(entries && entries.length > 0){
                    for( var i = 0 ; i < entries.length ; i ++ ){
                        entry = entries[i];
                        
                        pv_counter += entry["metrics"][0]["ga:pageviews"];
                    }
                }
                cb(pv_counter);
            });
        });
    } catch(err){
        cb(pv_counter);
    }
}

function format_date(date){
    var curr_date = date.getDate();
    var curr_month = date.getMonth() + 1;
    var curr_year = date.getFullYear();
    return curr_year + "-" + (curr_month < 10 ? "0" + curr_month : curr_month) + "-" + (curr_date < 10 ? "0" + curr_date : curr_date);
}