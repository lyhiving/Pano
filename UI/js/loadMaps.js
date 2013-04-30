var map;
var scenes=new Array();
//var markers=new Array();
var titles=new Array("龙潭1","龙潭2","龙潭3");
var panoIds=new Array("longtan1","longtan2","longtan3");
//var panoramas=new Array();
function initialize()
{
  initializeMap();
	initializeAction();
}
function initializeMap(){
	/*景区位置 */
	scenes[0]=new google.maps.LatLng(26.5862820834394,114.141924977303);	
	scenes[1]=new google.maps.LatLng(26.5874717808881,114.141973257065);
	scenes[2]=new google.maps.LatLng(26.5824442654713,114.145642518997);
	
	var defaultLocation=scenes[0];
	var mapOptions={
		zoom:15,
		center:defaultLocation,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	}
	map=new google.maps.Map(document.getElementById("map_canvas"),mapOptions);
	
	/* 显示景区标记*/
	var i=0;
	
	for(i in scenes)
	{
		
		var marker=new google.maps.Marker({
				position: scenes[i],
				map:map,
				title:titles[i]
		});
	
		/* 初始化标记事件 */
		//alert(i);
		updateMarker(marker,i);
		
	}

	
}
function updateMarker(marker,i)
{
	//	alert(i);
		google.maps.event.addListener(marker,'click',function(){
			var mp=document.getElementById("map_canvas");
			
			var panoOptions={
				pano:panoIds[i],
				visible:true,
				panoProvider:getCustomPanorama
			}
		var	panoramas=new google.maps.StreetViewPanorama(
			mp,panoOptions);
		});
}
function getCustomPanoramaTileUrl(pano,zoom,tileX,tileY)
{

	switch(pano){
		case 'longtan1':
			return 'images\\img'+'-'+zoom+'.jpg';
		case 'longtan2':
			return 'images\\img02.jpg';
		case 'longtan3':
			return 'images\\img03.jpg';
		break;
	}
		
	
}
function getCustomPanorama(pano,zoom,tileX,tileY)
{
	alert("zoom:"+zoom);
	switch(pano){
		case 'longtan1':
			return {
				location: {
					pano: 'longtan1',
					description: "Made In China",
					latLng:scenes[0]
				},
				copyright:'YYOUTH',
				tiles: {
					tileSize:new google.maps.Size(1024,512),
					worldSize:new google.maps.Size(1025,512),
					centerHeading:105,
					getTileUrl:getCustomPanoramaTileUrl
				},
				links:[
					{
					description:"龙潭2",
					heading:105,
					pano:"longtan2",
					},
					{
					description:"龙潭3",
					heading:75,
					pano:"longtan3",
					}
				],
				
			};
		case 'longtan2':
			return {
				location: {
					pano: 'longtan2',
					description: "Made In China",
					latLng:scenes[1]
				},
				copuright:'YYOUTH',
				tiles: {
					tileSize:new google.maps.Size(1024,512),
					worldSize:new google.maps.Size(1025,512),
					centerHeading:105,
					getTileUrl:getCustomPanoramaTileUrl
				},
				links:[
				{
					description:"龙潭1",
					heading:75,
					pano:"longtan1",
				},
				{
					description:"龙潭3",
					heading:105,
					pano:"longtan3",
				}
				]
			};
		case 'longtan3':
			return {
				location: {
					pano: 'longtan3',
					description: "Made In China",
					latLng:scenes[2]
				},
				copuright:'YYOUTH',
				tiles: {
					tileSize:new google.maps.Size(1024,512),
					worldSize:new google.maps.Size(1025,512),
					centerHeading:105,
					getTileUrl:getCustomPanoramaTileUrl
				},
				links:[
				{
					description:"龙潭1",
					heading:105,
					pano:"longtan1",
				},
				{
					description:"龙潭2",
					heading:75,
					pano:"longtan2",
				}
				]
			};
		break;
	}
}
function loadScript(){
	var script=document.createElement("script");
	script.type="text/javascript";
	script.src="http://maps.googleapis.com/maps/api/js?region=hk&sensor=false&callback=initialize";
	document.body.appendChild(script);
}
function findRoute()
{
	var start=new google.maps.LatLng(22.4189192,114.21211519999997);
	var dst=new google.maps.LatLng(22.4147983,114.21031450000007);
	//mark A 和 B
	var marker=new google.maps.Marker({
		position:start,
		map:map,
		title:"你在这里",
		draggable:true
	});
	var marker=new google.maps.Marker({
		position:dst,
		map:map,
		title:"目的地",
		draggable:true
	});
	var PathArray=[
	new google.maps.LatLng(22.4189192,114.21211519999997),
	new google.maps.LatLng(22.4147983,114.21031450000007)
	];
	var path=new google.maps.Polyline(
	{
	path:PathArray,
	strokeColor:"#FF0000",
	strokeOpacity:1.0,
	strokeWeight:2
	});
	path.setMap(map);
}
function showRoute()
	{
	var directionsService=new google.maps.DirectionsService();
	var directionsDisplay=new google.maps.DirectionsRenderer();
	directionsDisplay.setMap(map);
		var start=document.getElementById("start-position").value;
		var dst=document.getElementById("end-position").value;
		var request={
		origin:start,
		destination:dst,
		travelMode:google.maps.TravelMode.DRIVING
		};
		
		directionsService.route(request,function(result,status)
		{
			alert(status);
			if(status==google.maps.DirectionsStatus.OK){
				directionsDisplay.setDirections(result);
			}
		});
	}
function initializeAction()
{
	var bd=document.getElementsByTagName("body")[0];
	var bt=bd.getElementsByTagName("button")[0];
	
	bt.onclick=showRoute;
	
}
/************************************************************************************
 * 添加景区地图
 ************************************************************************************/
 function addScenes()
 {
	
	
	var panoOption1={
		pano:'scene1',
		visible:true,
		panoProvider:getCustomPanorama
	}
	var panoOption2={
		pano:'scene2',
		visible:true,
		panoProvider:getCustomPanorama
	}
	var panoOption3={
		pano:'scene3',
		visible:true,
		panoProvider:getCustomPanorama
	}
 }
 
addLoadEvent(loadScript);
