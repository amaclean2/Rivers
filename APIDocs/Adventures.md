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


## Object Breakdowns

### AdventureType

```javascript
enum('ski' | 'climb' | 'hike' | 'bike' | 'skiApproach')
```
