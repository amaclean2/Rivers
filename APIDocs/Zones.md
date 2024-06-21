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
`GeoJSON-Object is a [mapping structure](https://github.com/amaclean2/Rivers/blob/main/APIDocs/Adventures.md#geojson-object)

## Get Individual Zone

An individual zone can be fetched with an id parameter. This API populates any data about a specific zone. The response will be structured as below, showing the pertinatent parameters about a zone.

This API doesn't require an auth token because it is meant to be able to be used without loggin in to either the website or the app. All data regarding any users is restricted from this call.

### Get Zone Endpoint
```bash
https://api.sundaypeak.com/zones/details?zone_id=<zone_id>

Content-Type: application/json
HTTP Method: GET
```

**Response:**  
```javascript
{
  data: {
    zone: Zone
  },
  statusCode: Int,
  timestamp: Int
}
```

## Object Breakdowns

### Zone Object
```javascript
{
  zone_name: String,
  id: Int,
  adventure_type: AdventureType,
  bio: String,
  approach: String,
  nearest_city: String,
  date_created: Int,
  creator_id: Int,
  creator_name: String,
  creator_email: String,
  creator_picture_url: String,
  coordinates: CoordinatesObject,
  public: Boolean,
  adventures: SubAdventure[],
  zones: SubZone[],
  breadcrumb: BreadcrumbObject[],
  images: String[]
}
```

|Key|Type|Description|
|--|--|--|
|`adventure_type`|[AdventureType](https://github.com/amaclean2/Rivers/blob/main/APIDocs/Adventures.md#adventuretype)|Zone adventure type|
|`approach`|String|A description of the approach path to the given zone|  
|`date_created`|Int|An js timestamp denoting when the zone was created|    
|`creator_id`|Int|Maps to a user id that created the adventure|
|`creator_name`|String|Formatted as `first_name last_name` of the user that created this adventure|
|`creator_email`|String|The email from the user account that created the adventure|
|`creator_picture_url`|String|A url string of the user that created this adventure|
|`coordinates`|[CoordinatesObject](https://github.com/amaclean2/Rivers/blob/main/APIDocs/Adventures.md#coordinates-object)| |  
|`public`|Boolean|A boolean describing if the zone is public or private|
|`adventures`|[AdventureObject](#sub-adventure-object)[]|Describing each sub adventure|
|`zones`|[AoneObject](#sub-zone-object)[]|describing each sub zone|
|`breadcrumb`|[BreadcrumbObject](#breadcrumb-object)[]| |
|`images`|String[]|An array of image urls|

### Sub-adventure Object
```javascript
{
  adventure_type: AdventureType,
  adventure_name: String,
  adventure_id: Int,
  public: Boolean,
  path: GeoJSONCoordinateObject[],
  coordinates: CoordinatesObject
}
```

**Description:**  
`adventure_type`: Enum [AdventureType](https://github.com/amaclean2/Rivers/blob/main/APIDocs/Adventures.md#adventuretype)  
`adventure_id`: Coorelates to the id of the adventure  
`public`: Right now this is a int value denoting true or false in the SQL table. *TODO: Convert this to a boolean value*  
`path`: An array of [GeoJSON Coordinates](https://github.com/amaclean2/Rivers/blob/main/APIDocs/Adventures.md#geojson-coordinates-object)  
`coordinates`: An individual pair of [coordinates](https://github.com/amaclean2/Rivers/blob/main/APIDocs/Adventures.md#coordinates-object)  

### Sub-zone Object
```javascript
{
  adventure_type: AdventureType,
  zone_name: String,
  zone_id: Int,
  public: Boolean,
  coordinates: CoordinatesObject
}
```

**Description:**  
`adventure_type`: Enum [AdventureType](https://github.com/amaclean2/Rivers/blob/main/APIDocs/Adventures.md#adventuretype)  
`zone_id`: Coorelates to the id of the zone  
`public`: Right now this is a int value denoting true or false in the SQL table. *TODO: Convert this to a boolean value*  
`coordinates`: An individual pair of [coordinates](https://github.com/amaclean2/Rivers/blob/main/APIDocs/Adventures.md#coordinates-object)  
*TODO: Remove `zone_child_id` from this object.*  

### Breadcrumb Object
```javascript
{
  adventure_type: AdventureType,
  name: String,
  id: Int,
  category_type: CategoryType
}
```

**Description:**  
`adventure_type`: Enum [AdventureType](https://github.com/amaclean2/Rivers/blob/main/APIDocs/Adventures.md#adventuretype)  
`id`: Coorelates to the id of the zone or adventure 
`name`: The name of the zone or adventure  
`category_type`: An enum of type [CategoryType](#category-type) that describes an adventure or zone

### Category Type
```javascript
enum('adventure' | 'zone')
```

**Description:**  
Discriminating between an adventure and a zone
