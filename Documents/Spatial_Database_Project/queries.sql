select * from map;
-- ****************************************************************************************
--1 Reterives all houses within 10km to maynooth university
SELECT * FROM map
WHERE ST_DWithin
   (wkb_geometry::geography,
    ST_SetSRID(ST_MakePoint(-6.601037, 53.384702), 4326)::geography,
    10000);
-- ****************************************************************************************
-- 2 distance from maynooth to dublin city center
SELECT 
    ST_GeomFromText('POINT(-6.59844 53.37908)', 4326) AS geom_start,
    ST_GeomFromText('POINT(-6.27062 53.34140)', 4326) AS geom_end,
    ST_MakeLine(
        ST_GeomFromText('POINT(-6.59844 53.37908)', 4326),
        ST_GeomFromText('POINT(-6.27062 53.34140)', 4326)
    ) AS geom_line,
    ST_Distance(
        ST_Transform(ST_GeomFromText('POINT(-6.59844 53.37908)', 4326), 3857),
        ST_Transform(ST_GeomFromText('POINT(-6.27062 53.34140)', 4326), 3857)
    ) AS distance_meters;
-- ****************************************************************************************
-- 3 shows nearest bus stops to the houses
DROP VIEW IF EXISTS nearest_bus_stops;
CREATE VIEW nearest_bus_stops AS 
SELECT 
    m.ogc_fid AS map_id, 
    bs.ogc_fid AS bus_stop_id,
    ST_Distance(
        ST_Transform(m.wkb_geometry, 3857),
        ST_Transform(bs.wkb_geometry, 3857)
    ) AS distance_meters,
    ST_Transform(m.wkb_geometry, 3857)::geometry(Point, 3857) AS map_geom,
    ST_Transform(bs.wkb_geometry, 3857)::geometry(Point, 3857) AS bus_stop_geom
FROM map m
CROSS JOIN LATERAL (
    SELECT ogc_fid, wkb_geometry 
    FROM highway_bus_stop_ireland
    ORDER BY m.wkb_geometry <-> wkb_geometry
    LIMIT 1
) bs;
-- ****************************************************************************************
-- 4-Generate Heat Map
SELECT ogc_fid, wkb_geometry FROM highway_bus_stop_ireland;
-- ****************************************************************************************
-- 5-Find Houses That Have No Bus Stops Within 500m
SELECT m.ogc_fid AS road_id, ST_Transform(m.wkb_geometry, 3857) AS road_geom
FROM map m
WHERE NOT EXISTS (
    SELECT 1 
    FROM highway_bus_stop_ireland bs
    WHERE ST_DWithin(
        ST_Transform(m.wkb_geometry, 3857), 
        ST_Transform(bs.wkb_geometry, 3857), 
        500
    )
);
-- ****************************************************************************************
-- 6- shows nearest 3 bus stops to every house
SELECT 
    m.ogc_fid AS road_id, 
    bs.ogc_fid AS bus_stop_id,
    ST_Distance(
        ST_Transform(m.wkb_geometry, 3857),
        ST_Transform(bs.wkb_geometry, 3857)
    ) AS distance_meters,
    ST_Transform(m.wkb_geometry, 3857) AS road_geom,
    ST_Transform(bs.wkb_geometry, 3857) AS bus_stop_geom
FROM map m
CROSS JOIN LATERAL (
    SELECT ogc_fid, wkb_geometry 
    FROM highway_bus_stop_ireland
    ORDER BY m.wkb_geometry <-> wkb_geometry
    LIMIT 3
) bs;

-- ****************************************************************************************	
-- 7- Find Bus Stops That Are More Than 2 km Away From Any Other Stop
SELECT a.ogc_fid AS isolated_stop_id, 
       ST_Transform(a.wkb_geometry, 3857) AS geom
FROM highway_bus_stop_ireland a
WHERE NOT EXISTS (
    SELECT 1
    FROM highway_bus_stop_ireland b
    WHERE a.ogc_fid <> b.ogc_fid
    AND ST_Distance(
        ST_Transform(a.wkb_geometry, 3857),
        ST_Transform(b.wkb_geometry, 3857)
    ) < 2000
);
-- ****************************************************************************************
-- 8-Query: Create a 500m Service Area Around Bus Stops
--  What areas are well-covered by public transport and where is coverage missing?
SELECT 
    ogc_fid AS stop_id,
    ST_Buffer(ST_Transform(wkb_geometry, 3857), 500)::geometry(Polygon, 3857) AS buffer_zone
FROM highway_bus_stop_ireland;

-- ****************************************************************************************










