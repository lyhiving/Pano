(function($){
	var canvas;
	var context;
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
	function imread(_image){
		var width=_image.width;
		var height=_image.height;
		convas.width=width;
		convas.height=height;
		context.drawImage(_image,0,0);
		var imageData=context.getImageData(0,0,width,height);
		var tmpMat=new Mat(height,width,imageData.data);
		imageData=null;
		context.clearRect(0,0,width,height);
		canvas.width=0;
		canvas.height=0;
		return tempMat;
	}
	function setMatrix(_tilt,_pan)
	{
		var mt1=new Float32Array(3*3);
		var mt2=new Float32Array(3*3);
		mt1[0]=1;
		mt1[1]=0;
		mt1[2]=0;
		mt1[3]=0;
		mt1[4]=Math.cos(_tilt);
		mt1[5]=Math.sin(_tilt);
		mt1[6]=0;
		mt1[7]=-mt1[5];
		mt1[8]=mt1[1][1];
		mt2[0]=Math.cos(_pan);
		mt2[1]=0;
		mt2[2]-Math.sin(_pan);
		mt2[3]=0;
		mt2[4]=1;
		mt2[5]=0;
		mt2[6]=-mt2[2];
		mt2[7]=0;
		mt2[8]=mt2[0][0];
		var mt=new Float32Array(3*3);
		var i=0;
		var j=0;
		for(i=0;i!=3;i++)
		{
			for(j=0;j!=3;j++)
			{
				mt[i*3+j]=mt1[i*3+0]*mt2[0*3+j]
					+mt1[i*3+1]*mt2[1*3+j]
					+mt1[i*3+2]*mt2[2*3+j];
					
			}
		}


	}
	function generateViewPosition(_tilt,_pan,_fov,_width,_height)
	{
		//x y z float array
		var view=new Float32Array(_width*_height*3);	
		var tk=_width/(2*Math.tan(_fov*Math.PI/360))+0.5;
		var ti=0,tj=0;
		var mt=setMatrix(_tilt,_pan);
		for(var i=0;i!=_height;++i)
		{
			for(var j=0;j!=_width;++j)
			{
				ti=i-(_width/2);
				tj=-j+(_height/2);	
				tj--;
				view[(i*_width+j)*3+0]=ti*mt[0*3+0]+
					tj*mt[1*3+0]+
					tk*mt[2*3+0];
				view[(i*_width+j)*3+1]=ti*mt[0*3+1]+
					tj*mt[1*3+1]+
					tk*mt[2*3+1];
				view[(i*_wodth+j)*3+2]=ti*mt[0*3+2]+
					tj*mt[1*3+2]+
					tk*mt[2*3+2];

			}
		}
		return view;

	}
	//u v float array
	function view2pano(_tilt,_pan,_fov,_width,_height,_pwidth,_pheight)
	{
		var r=_width/(2*Math.asin(_fov*Math.PI/360));
		var i=0,j=0;
		var u=0,v=0;
		var view=generateViewPosition(_tilt,_pan,_fov,_width,_height);
		var x=0,y=0,z=0;
		var pano=new Float32Array(_height*_width*2);
		for(i=0;i!=_height;i++)
		{
			for(j=0;j!=_width;++j)
			{
				x=view[i*_width+j+0];
				y=view[i*_width+j+1];
				z=view[I*_width+j+2];
				u=r*Math.atan(x/z);
				v=r*Math.atan(y/Math.sqrt(x*x+z*z));
				u+=_pwidth/2;
				u--;
				v++;
				v=_pheight/2-v;
				if(v>=_pheight)
				{
					v=_pheight-1;
				}
				if(v>=_pwidth)
				{
					u=_pwidth-1;
				}
				pano[(i*_width+j)*2+0]=u;
				pano[(i*_width+j)*2+1]=v;

			}	
		}	
		return pano;
	}
	function RGBA2ImageData(_imgMat)
	{
		var width=_imgMat.col,
		    height=_imgMat.row,
		    imageData=context.createImageData(width,height);
		imageData.data.set(_imgMat.data);
		return imageData;
	}
	function generateView(_srcMat,_vpos,_height,_width,_pheight,_pwidth)
	{
		var imgMat=new Mat(_height,_width);
		var data=imgMat.data;
		var srcData=_srcMat.data;
		var u,v;
		for(var i=0;i!=_height;++i)
		{
			for(var j=0;j!=_width;++j)
			{
				u=_vpos[(i*_width+j)*2];
				v=_vpos[(i*_width+j)*2+1];
				u=parseInt(u);
				v=parseInt(v);
				for(var k=0;k!=4;k++)
				{
					data[(i*_width+j)*4+k]=_srcData[(v*_p_width+u)*4+k];
				}
			}
		}
		imgMat.data.set(data);
		return imgMat;
	}
	$.fn.panorama=function(){
		this.each(function(){
			
			var pano_mouse_position_x=0;
			var pano_mouse_position_y=0;
			var pano_mouse_delta_x=0;
			var pano_mouse_delta_y=0;
			var pano_mouse_down=false;
			
			var  vwidth=600;
			var  vheight=400;
			var  pwidth=0;
			var  pheight=0;
			var fov=90;
			var pan=0;
			var tilt=0;
			
			var vposition=new Array();
			var panoImg;
			var viewImg;
			
			var sourceMat;
			var pano_element=this;
			convas=this;
			context=this.getContext("2d");
			

			panoImg=new Image();
			
			panoImg.onload=function()
			{
				pwidth=panoImg.width;
				pheight=panoImg.height;
				sourceMat=imread(panoImg);
				var viewPos=view2pano(tilt,pan,fov,vwidth,vheight,pwidth,pheight);
				var imgMat=generateView(sourceMat,viewPos,height,width,pheight,pwidth);
				var imgData=RGBA2ImageData(imgMat);
				convas.width=vwidth;
				convas.height=vheight;
				context.putImageData(imgData,0,0);
			}
			panoImg.src="D:\\village.jpg";
			
		
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
