# Using the Sunday Peak Zones API

This section describes the actions you can take on Zones with the Sunday Peak API.

## Get Top Level Zones

Top Level Zones are any zones that do not have a parent zone. This API is meant to fetch all the zones that will display on the map when no other zones are selected. The response will be a GeoJSON object with a list of zones as features that fall into this category.

This API doesn't requre an auth token because it is meant to be able to be used without logging in to either the website or the app. All data regarding any users is restricted from this call.

### Zones Endpoint
```bash
https://api.sundaypeak.com/zones/all?type=<adventure_type>

Content-Type: application/json
HTTP Method: GET
```

The `adventure_type` variable is one of `enum` [Adventure Type](https://github.com/amaclean2/Rivers/blob/main/APIDocs/Adventures.md#adventuretype)

**Response:**
```javascript
{
  data: {
    zones: {
      <adventure_type>: GeoJSON-Object
    }
  },
  statusCode: Number
  timestamp: Number
}
```

**Description:**
`GeoJSON-Object is a [mapping structure](https://github.com/amaclean2/Rivers/blob/main/APIDocs/Adventures.md#adventuretype)

