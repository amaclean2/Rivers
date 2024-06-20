# Using the Sunday Peak Zones API

This section describes the actions you can take on Zones with the Sunday Peak API.

## Get Top Level Zones

Top Level Zones are any zones that do not have a parent zone. This API is meant to fetch all the zones that will display on the map when no other zones are selected. The response will be a GeoJSON object with a list of zones as features that fall into this category.

