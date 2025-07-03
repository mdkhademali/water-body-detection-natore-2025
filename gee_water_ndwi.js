// 🔹 STEP 1: Define AOI - Natore District
var natore = ee.FeatureCollection("FAO/GAUL/2015/level2")
                .filter(ee.Filter.eq('ADM2_NAME', 'Natore'))
                .filter(ee.Filter.eq('ADM0_NAME', 'Bangladesh'));

// 🔹 STEP 2: Filter Sentinel-2 imagery (April–May 2025, Cloud < 10%)
var s2 = ee.ImageCollection("COPERNICUS/S2_SR")
  .filterDate('2025-04-01', '2025-05-31')
  .filterBounds(natore)
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10));

// 🔹 STEP 3: Create median composite and clip to AOI
var composite = s2.median().clip(natore);

// 🔹 STEP 4: Calculate NDWI = (Green - NIR) / (Green + NIR)
var ndwi = composite.normalizedDifference(['B3', 'B8']).rename('NDWI');

// 🔹 STEP 5: Extract water (NDWI > 0.3)
var waterMask = ndwi.gt(0.3).selfMask(); // Removes 0 pixels

// 🔹 STEP 6: Select RGB bands for Composite image
var rgb = composite.select(['B4', 'B3', 'B2']);  // Red, Green, Blue

// 🔹 STEP 7: Visualization (Optional)
Map.centerObject(natore, 10);
Map.addLayer(rgb, {min: 0, max: 3000}, 'RGB Composite');
Map.addLayer(ndwi, {min: -1, max: 1, palette: ['white', 'blue']}, 'NDWI');
Map.addLayer(waterMask, {palette: ['0000FF']}, 'Water Bodies');
Map.addLayer(natore.style({color: 'black', fillColor: '00000000'}), {}, 'Natore Boundary');

// 🔹 STEP 8: Export NDWI
Export.image.toDrive({
  image: ndwi,
  description: 'Natore_NDWI_AprMay2025',
  folder: 'EarthEngine',
  fileNamePrefix: 'Natore_NDWI_2025',
  region: natore.geometry(),
  scale: 10,
  crs: 'EPSG:32646',
  maxPixels: 1e13
});

// 🔹 STEP 9: Export Water Body Mask
Export.image.toDrive({
  image: waterMask,
  description: 'Natore_WaterBody_AprMay2025',
  folder: 'EarthEngine',
  fileNamePrefix: 'Natore_WaterBody_2025',
  region: natore.geometry(),
  scale: 10,
  crs: 'EPSG:32646',
  maxPixels: 1e13
});

// 🔹 STEP 10: Export RGB Composite
Export.image.toDrive({
  image: rgb,
  description: 'Natore_Composite_432',
  folder: 'EarthEngine',
  fileNamePrefix: 'Natore_Composite_432',
  region: natore.geometry(),
  scale: 10,
  crs: 'EPSG:32646',
  maxPixels: 1e13
});