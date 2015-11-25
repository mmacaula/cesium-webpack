require('cesium/Source/Widgets/widgets.css');
var BuildModuleUrl = require('cesium/Source/Core/buildModuleUrl');
BuildModuleUrl.setBaseUrl('./');

var Viewer = require('cesium/Source/Widgets/Viewer/Viewer');

var viewer = new Viewer('cesiumContainer');
