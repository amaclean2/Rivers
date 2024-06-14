# Using the Sunday Peak Adventures API

This section describes the actions you can take on Adventures with the Sunday Peak API.

## Get Top Level Adventures

Top Level Adventures are any adventures that do not have a parent zone. This API is meant to fetch all the adventures to display on the map when no zone is selected.
The response will be a geoJSON object with a list of adventures that fall into this category.

This API doesn't require an auth token because it is meant to be able to be used without loggin in to either the website or the app. All data regarding any users is restricted from this call.

### Adventures Endpoint
```bash
https://api.sundaypeak.com/adventures/all?type=<adventure_type>

Content-Type: application/json
HTTP Method: GET
```

The `<adventure_type>` variable is one of `enum` [Adventure Type](#adventuretype) below.  

**Response:**
```javascript
{
  data: {
    adventures: {
      <adventure_type>: {
        lines: GeoJSON-Object
        points: GeoJSON-Object
      }
    }
  },
  statusCode: Number
  timestamp: Number
}
```

**Description:**  
`lines:` are all the features in the adventures collection who's geo data consists of a path  
`points:` are all the features who's geo data are just a coordinate pair  

## Object Breakdowns

### GeoJSON Object
```javascript
{
  type: 'FeatureCollection,
  features: GeoJSONFeature[]
}
```

**Description:**
Each feature in a GeoJSON object is a [GeoJSON Feature](#geojson-feature)  

### GeoJSON Feature
```javascript
{
  type: 'Feature,
  geometry: {
    type: 'Point' | 'LineString'
    coordinates: [lng, lat] | [lng, lat][]
  },
  id: Number
  properties: {
    adventureType: adventureType
    adventureName: String
    color: String
  }
}
```

**Description:**
`id` is the feature id, used to call the feature individually  
`adventureName` is the name of the feature  
`color` denotes the path color on the map  

### AdventureType
```javascript
enum('ski' | 'climb' | 'hike' | 'bike' | 'skiApproach')
```

**Description:**
The available adventure types to choose from
