var config = {}

config.name = "[company]";

config.social ={};
config.social.title = "Join [company]!";
config.social.link = "http://company.com";
config.social.description = "Join [company]";
config.social.twitter = "company";

config.email = {};
config.email.smtp = "smtp.gmail.com";
config.email.port = 465;
config.email.ssl = true;
config.email.username = "username@gmail.com";
config.email.password = "password";

config.email.from = "[company] <no-reply@company.com>";
config.email.support = "support@company.com";

config.analytics = {};
config.analytics.username = "username";
config.analytics.password = "password";
config.analytics.tracking_id = " UA-AAAAAAA-A";
config.analytics.profile_id = "ga:profile_id";

module.exports = config;