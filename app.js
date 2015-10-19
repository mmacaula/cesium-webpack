console.log('requiring cesium');
window.CESIUM_BASE_URL = './';
require('script!./lib/CesiumUnminified/Cesium.js');
require('./lib/Cesium/Widgets/widgets.css');
var Cesium = window.Cesium;

var div = document.createElement('div')
div.setAttribute('id','cesiumContainer');
document.body.appendChild(div);

var viewer = new Cesium.Viewer('cesiumContainer');
