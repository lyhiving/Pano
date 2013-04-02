var map;


function initialize()
{
  initializeMap();
	initializeAction();
}
function initializeMap(){
	var defaultLocation=new google.maps.LatLng(22.42189192,114.21211519999997);
	var mapOptions={
		zoom:15,
		center:defaultLocation,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	}
	map=new google.maps.Map(document.getElementById("map_canvas"),mapOptions);
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
addLoadEvent(loadScript);
