module.exports = function (compound, Subscriber) {
  // define Subscriber here
  Subscriber.validatesPresenceOf('email');
  Subscriber.validatesFormatOf('email', {with: /^([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/i});
  Subscriber.validatesUniquenessOf('email', {message: 'email is not unique'});
};