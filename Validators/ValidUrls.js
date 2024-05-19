// api endpoints exempt from token verification
module.exports = [
  'GET:/services',
  'GET:favicon',
  // adventures
  'GET:/adventures/all',
  'GET:/adventures/search',
  'GET:/adventures/adventureTypes',
  'GET:/adventures/details',
  'GET:/adventures/distance',
  // zones
  'GET:/adventures/zones/all',
  'GET:/adventures/zones/details',
  'GET:/adventures/zones/distance',
  'GET:/adventures/zones/search',
  // users
  'GET:/users/emailOptOut',
  'POST:/savePasswordReset',
  'POST:/resetPassword',
  'GET:/verify',
  'POST:/users/login',
  'POST:/users',
  'POST:/users/passwordResetLink',
  'POST:/users/newPassword',
  'GET:/images'
]
