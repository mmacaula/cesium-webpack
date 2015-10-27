window.CESIUM_BASE_URL = './';
require('./lib/CesiumUnminified/Cesium.js');
require('./lib/Cesium/Widgets/widgets.css');
var Cesium = window.Cesium;

var viewer = new Cesium.Viewer('cesiumContainer');
