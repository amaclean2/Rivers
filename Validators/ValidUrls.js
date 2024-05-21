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
  'GET:/zones/all',
  'GET:/zones/details',
  'GET:/zones/distance',
  'GET:/zones/search',
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
