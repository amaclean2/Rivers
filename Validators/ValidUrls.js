// api endpoints exempt from token verification
module.exports = [
  'GET:/services',
  'GET:favicon',
  'GET:/adventures/all',
  'GET:/adventures/search',
  'GET:/adventures/adventureTypes',
  'GET:/adventures/details',
  'GET:/adventures/distance',
  'POST:/savePasswordReset',
  'POST:/resetPassword',
  'GET:/verify',
  'POST:/users/login',
  'POST:/users',
  'POST:/users/passwordResetLink',
  'POST:/users/newPassword',
  'GET:/images'
]
