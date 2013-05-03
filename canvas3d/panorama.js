(function($){
	var canvas;
	var context;
	//图像矩阵模型
	function Mat(_row,_col,_data,_buffer)
	{
		this.row=_row||0;
		this.col=_col||0;
		this.channel=4;
		this.buffer=_buffer||new ArrayBuffer(_row*_col*4);
		this.data=new Uint8ClampedArray(this.buffer);
		_data&&this.data.set(_data);
		this.bytes=1;
		this.type="CV_RGBA";
	}
	//图片数据转成矩阵
	function imread(_image){
		var width=_image.width;
		var height=_image.height;
		$('canvas').addClass("tmp").appendTo('body');
		var ctx=$('canvas.tmp').getContext("2d");
		ctx.
		ctx.drawImage(_image,0,0);
		var imageData=ctx.getImageData(0,0,width,height);
		var tmpMat=new Mat(height,width,imageData.data);
		imageData=null;
		return tempMat;
	}
	$.fn.panorama=function(){
		this.each(function(){
			
			var pano_mouse_position_x=0;
			var pano_mouse_position_y=0;
			var pano_mouse_delta_x=0;
			var pano_mouse_delta_y=0;
			var pano_mouse_down=false;
			
			var  vwidth=0;
			var  vheight=0;
			var  pwidth=0;
			var  pheight=0;
			var fov=90;
			var pan=0;
			var tilt=0;
			
			var vposition=new Array();
			var panoImg;
			var viewImg;
			
			$('canvas#pano').css({"width":"0","height":"0"}).appendTo('body');
			
			panoImg=new Image();
			panoImg.src="D:\\village.jpg";
			panoImg.onload=function()
			{
				$('canvas#pano').getContext("2d").drawImage(panoImg,0,0);
				var imagedata=$('canvas#pano').getContext().getImageData(0,0,pwidth,pheight);
			}
			
			var pano_element=this;
			$(pano_element).bind('mousedown',function(){
				pano_mouse_down=true;
				pano_mouse_position_x=e.clientX;
				pano_mouse_position_y=e.clientY;
				$(pano_element).parent().css("cursor","move");
			});
			$(pano_element).bind('mouseup',function(){
				pano_mouse_down=false;
				$(pano_element).parent().css("cursor","pointer");
			});
			$(pano_element).bind('mousemove',function(e){
				if(pano_mouse_down){
					pano_mouse_delta_x=parseInt(pano_mouse_position_x-e.clientX);
					pano_mouse_delta_y=parseInt(pano_mouse_position_y=e.clientY);
				}
			});
			
			
		});
	};
	$('document').ready(function(){
		$('canvas#c').panorama();
	});
})(jQuery);