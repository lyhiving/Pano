(function($){
	var canvas;
	var context;
	//рт╫г╤х 
	var fov;
	var tilt;
	var pan;
	//
	var vwidth;
	var vheight;
	var pwidth;
	var pheight;
	var srcMat;

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
		canvas.width=width;
		canvas.height=height;
		context.drawImage(_image,0,0);
		var imageData=context.getImageData(0,0,width,height);
		var tmpMat=new Mat(height,width,imageData.data);
		imageData=null;
		context.clearRect(0,0,width,height);
		return tmpMat;
	}
	function setMatrix(_tilt,_pan)
	{
		var mt1=new Float32Array(3*3);
		var mt2=new Float32Array(3*3);
		mt1[0]=1;
		mt1[1]=0;
		mt1[2]=0;
		mt1[3]=0;
		mt1[4]=Math.cos(_tilt*Math.PI/180);
		mt1[5]=Math.sin(_tilt*Math.PI/180);
		mt1[6]=0;
		mt1[7]=-mt1[5];
		mt1[8]=mt1[4];
		mt2[0]=Math.cos(_pan*Math.PI/180);
		mt2[1]=0;
		mt2[2]=-Math.sin(_pan*Math.PI/180);
		mt2[3]=0;
		mt2[4]=1;
		mt2[5]=0;
		mt2[6]=-mt2[2];
		mt2[7]=0;
		mt2[8]=mt2[0];
		var mt=new Float32Array(3*3);
		var i=0;
		var j=0;
		for(i=0;i!=3;i++)
		{
			for(j=0;j!=3;j++)
			{
				mt[i*3+j]=mt1[i*3+0]*mt2[0*3+j]+mt1[i*3+1]*mt2[1*3+j]+mt1[i*3+2]*mt2[2*3+j];
					
			}
		}
		return mt

	}
		


	function RGBA2ImageData(_imgMat)
	{
		var width=_imgMat.col,
		    height=_imgMat.row,
		    imageData=context.createImageData(width,height);
		imageData.data.set(_imgMat.data);
		return imageData;
	}
	function backProjectionAlgorithm(_x,_y)
	{

		var f=vwidth/(2*Math.tan(fov*Math.PI/360));
		var a=tilt*Math.PI/180;
		var b=pan*Math.PI/180;
		var w=(_y-vheight/2)*Math.sin(a)*Math.cos(b)-(_x-vwidth/2)*Math.sin(b)-f*Math.cos(a)*Math.cos(b);
		
		var u=(_x-vwidth/2)*Math.cos(b)-f*Math.cos(a)*Math.sin(b);
		var v=(_y-vheight/2)*Math.cos(a)+f*Math.sin(a);	
		var sq=Math.sqrt(u*u+w*w);
		var x1=0,y1=0;
		if(w>=0)
		{
			x1=f*Math.acos(u/sq);
			y1=f*(Math.PI/2-Math.atan(v/sq));
		}
		else if(w<0)
		{
			x1=f*(Math.PI*2-Math.acos(u/sq));
			y1=f*(Math.PI/2-Math.atan(v/sq));
		}
		var  ad=new Array();
		ad[0]=x1;
		ad[1]=y1;
		return ad;

	}
	function drawOne()
	{
		var imgMat=new Mat(vheight,vwidth);
		var data=imgMat.data;
		var srcData=srcMat.data;
		var ti=0,tj=0;
		var u=0,v=0;
		var ad;
		for(var i=0;i!=vheight;++i)
		{
			for(var j=0;j!=vwidth;++j)
			{
			
				ti=-i+(vheight/2);
				tj=j-(vwidth/2);
				ti--;
				ad=backProjectionAlgorithm(tj,ti);
				u=parseInt(ad[0]);
				v=parseInt(ad[1]);
				
				if(u>pwidth)
				{
					u-=pwidth;
				}
				if(u<0)
				{
					u+=pwidth;
				}
				if(srcData[(v*pwidth+u)*4]==0)
				{
						console.log("z");
				}
				for(var k=0;k!=4;++k)
				{
					data[(i*vwidth+j)*4+k]=srcData[(v*pwidth+u)*4+k];
				}
			}
		}
		var imgData=RGBA2ImageData(imgMat);
		//draw on the canvas
		context.clearRect(0,0,vwidth,vheight);
		canvas.width=vwidth;
		canvas.height=vheight;
		canvas.style.width=vwidth;
		canvas.style.height=vheight;
		context.putImageData(imgData,0,0);	

	}
	function draw()
	{
		//transform view position to pan tilt angle;
		

		var i=0,j=0,k=0;
		var mt=setMatrix(tilt,pan);

	//	var r=vwidth/(2*Math.asin(fov*Math.PI/360));
		var r=pwidth/(2*Math.PI);
		//x y z float array
		var view=new Float32Array(vwidth*vheight*3);	
		var tk=-r;
		var ti=0,tj=0;
		
		for(i=0;i!=vheight;++i)
		{
			for(j=0;j!=vwidth;++j)
			{
				ti=-i+(vheight/2);
				tj=j-(vwidth/2);	
				ti--;
				for(k=0;k!=3;++k)
				{
					view[(i*vwidth+j)*3+k]=tj*mt[0*3+k]+
					ti*mt[1*3+k]+
					tk*mt[2*3+k];
				}
			

			}
		}
		//find correct position in panorama
		var u=0,v=0;
		var x=0,y=0,z=0;
		var uMax=0;
		var panoPos=new Float32Array(vheight*vwidth*2);
		for(i=0;i!=vheight;i++)
		{
			for(j=0;j!=vwidth;++j)
			{
				x=view[(i*vwidth+j)*3+0];
				y=view[(i*vwidth+j)*3+1];
				z=view[(i*vwidth+j)*3+2];
				if(Math.abs(z)<0.00001)
				{
					uMax=r*Math.atan(x/z);
				}
				
				if(z>=0)
				{ 
					u=r*Math.acos(x/Math.sqrt(z*z+x*x));
					v=r*(Math.PI/2-Math.atan(y/Math.sqrt(x*x+z*z)));
				
				}
				else if(z<0)
				{
					u=r*(Math.PI*2-Math.acos(x/Math.sqrt(z*z+x*x)));
					v=r*(Math.PI/2-Math.atan(y/Math.sqrt(x*x+z*z)));
						
				}
				u--;
				
				v++;
			//	v=pheight/2-v;
				if(v>=pheight)
				{
					v=pheight-1;
				}
				if(u>=pwidth)
				{
					u-=pwidth;
				}
				if(u<0)
				{
					u+=pwidth;
				}
				panoPos[(i*vwidth+j)*2+0]=u;
				panoPos[(i*vwidth+j)*2+1]=v;

			}	
		}	
		//get RGBA	

		var imgMat=new Mat(vheight,vwidth);
		var data=imgMat.data;
		var srcData=srcMat.data;
		 
		for( i=0;i!=vheight;++i)
		{
			for( j=0;j!=vwidth;++j)
			{
				u=panoPos[(i*vwidth+j)*2];
				v=panoPos[(i*vwidth+j)*2+1];
				u=parseInt(u);
				v=parseInt(v);
				for(var k=0;k!=4;k++)
				{
					data[(i*vwidth+j)*4+k]=srcData[(v*pwidth+u)*4+k];
				}
			}
		}
		imgMat.data.set(data);
		//transform imgMat to imgData
		var imgData=RGBA2ImageData(imgMat);
		//draw on the canvas
		context.clearRect(0,0,vwidth,vheight);
		canvas.width=vwidth;
		canvas.height=vheight;
		canvas.style.width=vwidth;
		canvas.style.height=vheight;
		context.putImageData(imgData,0,0);
	}	
	$.fn.panorama=function(){
		this.each(function(){
			 vwidth=600;
			  vheight=400;
			  pwidth=0;
			  pheight=0;
			 fov=90;
			 pan=90;
			 tilt=-90;
			 
			var pano_mouse_standard_x=vwidth/2;
			var pano_mouse_standard_y=vheight/2;
			var pano_mouse_delta_x=0;
			var pano_mouse_delta_y=0;
			var pano_mouse_down=false;
			
			 
			
			
			var pano_element=this;
			canvas=this;
			context=this.getContext("2d");
			

			panoImg=new Image();
			
			panoImg.onload=function()
			{
				pwidth=panoImg.width;
				pheight=panoImg.height;
				srcMat=imread(panoImg);
				var timebegin=(new Date()).getTime();
				
				draw();
				var timeend=(new Date()).getTime();
				alert(timeend-timebegin);
				$(pano_element).bind('mousedown',function(event){
				pano_mouse_down=true;
				
				$(pano_element).parent().css("cursor","move");
				
				
				});
				$(pano_element).bind('mouseup',function(){
				pano_mouse_down=false;
				$(pano_element).parent().css("cursor","default");
				
			});
			$(pano_element).bind('mousemove',function(event){
				if(pano_mouse_down){
					pano_mouse_delta_x=pano_mouse_standard_x-event.clientX;
					pano_mouse_delta_y=pano_mouse_standard_y-event.clientY;
					
					if(pano_mouse_delta_x >0)
					{
						pan+=1;
						
					}
					else if(pano_mouse_delta_x<0)
					{
						pan-=1;
					}
					if(pano_mouse_delta_y >0)
					{
						tilt+=1;
						if(tilt>90)
							tilt=90;
					}
					else if(pano_mouse_delta_y<0)
					{
						tilt-=1;
						if(tilt<-90)
							{
								tilt=-90;
							}
					}
					
					draw();
				}
			});
			}
			panoImg.src="imgs\\v2.jpg";
			
		
		
			
			
		});
	};
	$('document').ready(function(){
		$('canvas#c').panorama();
	});
})(jQuery);
