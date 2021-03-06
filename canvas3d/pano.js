(function($) {

	var loaded = false;

	var workerFlags = [ false];
	function pano(_src, _id, _title, _latlng, _links, _canvas, _context) {
		this.src = _src;
		this.id = _id;
		this.title = _title;
		this.latlng = _latlng;
		this.links = _links || [];
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
			loaded = true;

			pa.imgData = context.getImageData(0, 0, panoImg.width,
					panoImg.height).data;
			canvas.width = 0;
			canvas.height = 0;
		};
		panoImg.src = this.src;

	}
	;
	function createWorker(_workers, _ga, _i) {
		
		_workers[_i] = new Worker("compute_task.js");

		
		_workers[_i].onmessage = function(event) {
			var jobCount = _ga.jobCount;
			workerFlags[_i] = true;
			var fov = _ga.fov;
			var r = _ga.r;

			var vwidth = parseInt(2 * r * Math.tan(fov * Math.PI / 360));
			var vheight = parseInt(vwidth * 2 / 3);
			var pwidth = _ga.currentPano.pwidth;

			var cwidth = _ga.cwidth;
			var cheight = _ga.cheight;

			var u = 0, v = 0;
			var pano_pos = event.data.pano;
			var subVheight = parseInt(vheight / jobCount);
			var imgData = new Uint8ClampedArray(subVheight * vwidth * 4);

			var srcData = _ga.currentPano.imgData;
			for ( var j = 0; j != subVheight; ++j) {
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
			var img = _ga.img;
			for (j = 0; j != parseInt(cheight / jobCount); ++j) {
				for (k = 0; k != cwidth; ++k) {
					u = parseInt(k * Sx);
					v = parseInt(j * Sy);
					for (l = 0; l != 4; ++l) {

						img[((j + parseInt(cheight / jobCount) * _i) * cwidth + k)
								* 4 + l] = imgData[(v * vwidth + u) * 4 + l];
					}
				}
			}
			var flag = true;
			for ( var f in workerFlags) {
				flag &= workerFlags[f];
			}
			if (flag) {
				context.clearRect(0, 0, cwidth, cheight);
				canvas.width = cwidth;
				canvas.height = cheight;
				var imageData = context.createImageData(cwidth, cheight);
				imageData.data.set(img);
				context.putImageData(imageData, 0, 0);
				for (f in workerFlags) {
					workerFlags[f] = false;
				}
				//console.log((new Date()).getTime()-beg);
			}

		};
	}

	function galaxy(_cwidth, _cheight, _panoArray) {
		this.cwidth = _cwidth;
		this.cheight = _cheight;
		this.panoArray = _panoArray;
		this.jobCount = 1;
		this.currentPano = this.panoArray[0];
		this.fov = this.currentPano.fov;
		this.r = this.currentPano.r;
		this.pan = this.currentPano.pan;
		this.tilt = this.currentPano.tilt;
		this.pwidth = this.currentPano.pwidth;
		this.pheight = this.currentPano.pheight;

		this.img = new Uint8ClampedArray(_cheight * _cwidth * 4);

		var ga = this;
		this.workers = [];
		for ( var i = 0; i != this.jobCount; ++i) {
			createWorker(this.workers, ga, i);
		}
	}
	;

	galaxy.prototype.draw = function() {
	
		var vwidth = parseInt(2 * this.r * Math.tan(this.fov * Math.PI / 360));
		var vheight = parseInt(vwidth * 2 / 3);
		
		for ( var i = 0; i != this.jobCount; ++i) {
			this.workers[i].postMessage({
				jobCount : this.jobCount,
				index : i,
				tilt : this.tilt,
				pan : this.pan,
				vheight :vheight,
				vwidth : vwidth,
				radius : this.r,
				pwidth : this.pwidth,
				pheight : this.pheight
			});
		}

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
	var canvas;
	var context;
	var t;

	var p;

	function execute() {

		if (loaded) {
			console.log("loaded");
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
	$.fn.panorama = function() {
		this.each(function() {
			canvas = this;
			context = this.getContext("2d");
			p = [ new pano("imgs\\v2.jpg", "v2", "123", "123", null, canvas,
					context) ];
			t = self.setInterval(function() {
				execute();
			}, 50);

		});
	};

	$('document').ready(function() {
		$('canvas#c').panorama();

	});
})(jQuery);
