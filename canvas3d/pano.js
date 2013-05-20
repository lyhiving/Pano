(function($) {
	var canvas = {};
	var context = {};
	var t = {};

	var p = [];
	var loaded = 3;
	var linked = false;

	function pano(_src, _id, _title, _latlng) {
		this.src = _src;
		this.id = _id;
		this.title = _title;
		this.latlng = _latlng;

		this.fov = 90;
		this.tilt = 0;
		this.pan = 0;
		this.pwidth = 0;
		this.pheight = 0;

		this.r = 0;
		this.imgData = {};
		var pa = this;
		var panoImg = new Image();
		panoImg.onload = function() {
			console.log("true");
			pa.pwidth = panoImg.width;
			pa.pheight = panoImg.height;
			pa.r = panoImg.width / (2 * Math.PI);
			canvas.width = panoImg.width;
			canvas.height = panoImg.height;
			context.drawImage(panoImg, 0, 0);
			loaded--;

			pa.imgData = context.getImageData(0, 0, panoImg.width,
					panoImg.height).data;
			canvas.width = 0;
			canvas.height = 0;
		};
		panoImg.src = this.src;

	}
	;

	function galaxy(_cwidth, _cheight, _panoArray) {
		this.cwidth = _cwidth;
		this.cheight = _cheight;
		this.panoArray = _panoArray;

		this.currentPano = this.panoArray[0];
		this.fov = this.currentPano.fov;
		this.r = this.currentPano.r;
		this.pan = this.currentPano.pan;
		this.tilt = this.currentPano.tilt;
		this.pwidth = this.currentPano.pwidth;
		this.pheight = this.currentPano.pheight;

		this.steps = 7;

		this.img = new Uint8ClampedArray(_cheight * _cwidth * 4);

		var ga = this;
		this.worker = new Worker("compute_task.js");

		this.worker.onmessage = function(event) {
			if (linked) {
				var img1 = new Uint8ClampedArray(ga.cheight *ga.cwidth*4);
				img1.set(ga.img);

			}

			var fov = ga.fov;
			var r = ga.r;

			var vwidth = parseInt(2 * r * Math.tan(fov * Math.PI / 360));
			var vheight = parseInt(vwidth * 2 / 3);
			var pwidth = ga.currentPano.pwidth;

			var cwidth = ga.cwidth;
			var cheight = ga.cheight;

			var u = 0, v = 0;
			var pano_pos = event.data.pano;

			var imgData = new Uint8ClampedArray(vheight * vwidth * 4);

			var srcData = ga.currentPano.imgData;
			for ( var j = 0; j != vheight; ++j) {
				for ( var k = 0; k != vwidth; ++k) {
					u = pano_pos[(j * vwidth + k) * 2];
					v = pano_pos[(j * vwidth + k) * 2 + 1];
					for ( var l = 0; l != 4; ++l) {
						imgData[((j) * vwidth + k) * 4 + l] = srcData[(v
								* pwidth + u)
								* 4 + l];
					}
				}
			}
			var Sx = vwidth / cwidth;
			var Sy = vheight / cheight;

			var img = ga.img;
			for (j = 0; j != cheight; ++j) {
				for (k = 0; k != cwidth; ++k) {
					u = parseInt(k * Sx);
					v = parseInt(j * Sy);
					for (l = 0; l != 4; ++l) {

						img[((j) * cwidth + k) * 4 + l] = imgData[(v * vwidth + u)
								* 4 + l];
					}
				}
			}
			if (linked) {
				var step = 0;
				(function linkAnimation() {
					if (step != ga.steps) {
						window.webkitRequestAnimationFrame(linkAnimation);
					}
					var tmpImg = new Uint8ClampedArray(cheight * cwidth * 4);

					for ( var i = 0; i != cheight; ++i) {
						for ( var j = 0; j != cwidth; ++j) {
							for(var k=0;k!=4;++k)
								{
								tmpImg[(i * cwidth + j)*4+k] =img1[(i * cwidth + j)*4+k]+
								step*(img[(i*cwidth+j)*4+k]-img1[(i*cwidth+j)*4+k])/ga.steps;
								}
						}
					}
					step++;
					context.clearRect(0, 0, cwidth, cheight);
					canvas.width = cwidth;
					canvas.height = cheight;
					var imageData = context.createImageData(cwidth, cheight);
					imageData.data.set(tmpImg);
					context.putImageData(imageData, 0, 0);
				})();

				linked = false;
			} else {
				context.clearRect(0, 0, cwidth, cheight);
				canvas.width = cwidth;
				canvas.height = cheight;
				var imageData = context.createImageData(cwidth, cheight);
				imageData.data.set(img);
				context.putImageData(imageData, 0, 0);
			}
			// console.log((new Date()).getTime()-beg);

		};
	}
	;

	galaxy.prototype.draw = function() {

		var vwidth = parseInt(2 * this.r * Math.tan(this.fov * Math.PI / 360));
		var vheight = parseInt(vwidth * 2 / 3);

		this.worker.postMessage({

			tilt : this.tilt,
			pan : this.pan,
			vheight : vheight,
			vwidth : vwidth,
			radius : this.r,
			pwidth : this.pwidth,
			pheight : this.pheight
		});

	};
	galaxy.prototype.left = function() {
		this.pan += 5;
	};
	galaxy.prototype.right = function() {
		this.pan -= 5;
	};
	galaxy.prototype.up = function() {
		this.tilt += 5;
	};
	galaxy.prototype.down = function() {
		this.tilt -= 5;
	};
	galaxy.prototype.zoom = function(delta) {
		if (delta > 0) {
			this.fov /= 1.1;
			if (this.fov < 45)
				this.fov = 45;
		}
		if (delta < 0) {
			this.fov *= 1.1;
			if (this.fov > 90)
				this.fov = 90;
		}
	};

	galaxy.prototype.horizontal = function(delta) {
		this.pan += delta;
	};
	galaxy.prototype.vertical = function(delta) {
		this.tilt += delta;
		if (this.tilt > 90) {
			this.tilt = 90;
		}
		if (this.tilt < -90) {
			this.tilt = -90;
		}
	};

	function execute() {

		if (!loaded) {
			console.log("loaded:" + loaded);
			window.clearInterval(t);

			var cwidth = 600;
			var cheight = 400;
			var g = new galaxy(cwidth, cheight, p);
			var pano_mouse_position_x = cwidth / 2;
			var pano_mouse_position_y = cheight / 2;
			var pano_mouse_delta_x = 0;
			var pano_mouse_delta_y = 0;
			var pano_mouse_down = false;
			// beg=(new Date()).getTime();
			g.draw();
			g.loadMap();
			var pano_element = canvas;
			$(pano_element).bind('mousedown', function(event) {
				pano_mouse_down = true;
				pano_mouse_position_x = event.clientX;
				pano_mouse_position_y = event.clientY;
				$(pano_element).parent().css("cursor", "move");
			});
			$(pano_element).bind('mouseup', function() {
				pano_mouse_down = false;
				$(pano_element).parent().css("cursor", "default");
			});
			$(pano_element).bind('mousemove', function(event) {
				if (pano_mouse_down) {

					pano_mouse_delta_x = pano_mouse_position_x - event.clientX;
					pano_mouse_delta_y = pano_mouse_position_y - event.clientY;
					g.horizontal(pano_mouse_delta_x / 100);
					g.vertical(pano_mouse_delta_y / 100);

					g.draw();
				}
			});
			$(pano_element).bind(
					'mousewheel',
					function(event) {
						var e = window.event || event;
						var deta = Math.max(-1, Math.min(1,
								(e.wheelDelta || -e.detail)));
						g.zoom(deta);

						g.draw();
					});

		}
	}

	function updateMarker(_marker, _i, _ga) {
		google.maps.event.addListener(_marker, 'click', function() {
			if(_ga.currentPano != _ga.panoArray[_i])
				{
					_ga.currentPano=_ga.panoArray[_i];
					linked = true;
					_ga.draw();
				}
			
		});
	}
	galaxy.prototype.loadMap = function() {

		var mapOptions = {
			center : this.currentPano.latlng,
			zoom : 15,
			mapTypeId : google.maps.MapTypeId.ROADMAP
		};
		map = new google.maps.Map(document.getElementById("map_canvas"),
				mapOptions);
		for ( var i in p) {
			var marker = new google.maps.Marker({
				position : this.panoArray[i].latlng,
				map : map,
				title : this.panoArray[i].title
			});
			updateMarker(marker, i, this);
		}
	};
	$.fn.panorama = function() {
		this.each(function() {
			canvas = this;
			context = this.getContext("2d");
			p = [
					new pano("imgs\\v2.jpg", "v2", "scene2",
							new google.maps.LatLng(26.5862820834394,
									114.141924977303)),
					new pano("imgs\\v1.jpg", "v1", "scene1",
							new google.maps.LatLng(26.5874717808881,
									114.141973257065)),
					new pano("imgs\\v3.jpg", "v3", "scene3",
							new google.maps.LatLng(26.5824442654713,
									114.145642518997)) ];
			t = self.setInterval(function() {
				execute();
			}, 50);

		});
	};

	$('document').ready(function() {
		$('canvas#c').panorama();

	});

})(jQuery);
