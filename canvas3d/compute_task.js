function setMatrix(_tilt, _pan) {
	var mt1 = new Float32Array(3 * 3);
	var mt2 = new Float32Array(3 * 3);
	mt1[0] = 1;
	mt1[1] = 0;
	mt1[2] = 0;
	mt1[3] = 0;
	mt1[4] = Math.cos(_tilt * Math.PI / 180);
	mt1[5] = Math.sin(_tilt * Math.PI / 180);
	mt1[6] = 0;
	mt1[7] = -mt1[5];
	mt1[8] = mt1[4];
	mt2[0] = Math.cos(_pan * Math.PI / 180);
	mt2[1] = 0;
	mt2[2] = -Math.sin(_pan * Math.PI / 180);
	mt2[3] = 0;
	mt2[4] = 1;
	mt2[5] = 0;
	mt2[6] = -mt2[2];
	mt2[7] = 0;
	mt2[8] = mt2[0];
	var mt = new Float32Array(3 * 3);
	var i = 0;
	var j = 0;
	for (i = 0; i != 3; i++) {
		for (j = 0; j != 3; j++) {
			mt[i * 3 + j] = mt1[i * 3 + 0] * mt2[0 * 3 + j] + mt1[i * 3 + 1]
					* mt2[1 * 3 + j] + mt1[i * 3 + 2] * mt2[2 * 3 + j];

		}
	}
	return mt;

}

onmessage = function(event) {
	
	var data = event.data;
	var tilt = data.tilt;
	var pan = data.pan;
	
	var vwidth = parseInt(data.vwidth);
	var vheight = parseInt(data.vheight);
	var pwidth = parseInt(data.pwidth);
	var pheight = parseInt(data.pheight);
	var index=parseInt(data.index);
	var jobCount=parseInt(data.jobCount);

	var i = 0, j = 0;
	var view;
	var r = data.radius;
	var ti = 0, tj = 0, tk = 0;
	var x = 0, y = 0, z = 0;
	var u = 0, v = 0;
	var subVH=parseInt(vheight/jobCount);
	var pano = new Uint16Array(subVH * vwidth * 2);

	view = new Float32Array(subVH * vwidth * 3);
	for (i = 0; i != subVH; ++i) {

		for (j = 0; j != vwidth; ++j) {

			view[(i * vwidth + j) * 3] = j - (vwidth / 2);

			view[(i * vwidth + j) * 3 + 1] = -(i+index*subVH) + (vheight / 2) - 1;
			view[(i * vwidth + j) * 3 + 2] = -r;

		}
	}
	var mt = setMatrix(tilt, pan);

	for (i = 0; i != subVH; ++i) {
		for (j = 0; j != vwidth; ++j) {

			ti = view[(i * vwidth + j) * 3 + 0];
			tj = view[(i * vwidth + j) * 3 + 1];
			tk = view[(i * vwidth + j) * 3 + 2];

			x = ti * mt[0 * 3 + 0] + tj * mt[1 * 3 + 0] + tk * mt[2 * 3 + 0];
			y = ti * mt[0 * 3 + 1] + tj * mt[1 * 3 + 1] + tk * mt[2 * 3 + 1];
			z = ti * mt[0 * 3 + 2] + tj * mt[1 * 3 + 2] + tk * mt[2 * 3 + 2];

			if (z >= 0) {
				u = r * Math.acos(x / Math.sqrt(z * z + x * x));
				v = r * (Math.PI / 2 - Math.atan(y / Math.sqrt(x * x + z * z)));

			} else if (z < 0) {
				u = r * (Math.PI * 2 - Math.acos(x / Math.sqrt(z * z + x * x)));
				v = r * (Math.PI / 2 - Math.atan(y / Math.sqrt(x * x + z * z)));

			}

			if (u >= pwidth) {
				u -= pwidth;
			}
			if (u < 0) {
				u += pwidth;
			}

			u = parseInt(u);
			v = parseInt(v);
			pano[(i * vwidth + j) * 2] = u;
			pano[(i * vwidth + j) * 2 + 1] = v;
		}
	}
	self.postMessage({
		pano : pano
	}, [ pano.buffer ]);
	
};
