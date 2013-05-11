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
	var imgMat;
	//Workers
	var workers=[];
	var jobCount=2;
	var flag=jobCount;
	
	var timbeg;
	var timend;
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

	function draw()
	{
		//transform view position to pan tilt angle;
		

		var i=0,j=0,k=0;
		var mt=setMatrix(tilt,pan);

		var r=pwidth/(2*Math.PI);
	
		var tk=-r;
		var ti=0,tj=0;
		var x=0,y=0,z=0;
		var u=0,v=0;
	
		var imgMat=new Mat(vheight,vwidth);
		var data=imgMat.data;
		var srcData=srcMat.data;
		var view;
		
		for(k=0;k!=jobCount;++k)
		{
			view=new Float32Array(vheight/jobCount*vwidth*3);
			for(i=0;i!=vheight/jobCount;++i)
			{
			
				for(j=0;j!=vwidth;++j)
				{
				
				view[(i*vwidth+j)*3]=j-(vwidth/2);	

				view[(i*vwidth+j)*3+1]=-(i+k*vheight/jobCount)+(vheight/2)-1;
				view[(i*vwidth+j)*3+2]=-r;	
		
				}
			}
			workers[k].postMessage(
					{
						tilt:tilt,
						pan:pan,
						fov:fov,
						view:view,
						height:vheight/jobCount,
						width:vwidth,
						radius:r,
						pwidth:pwidth,
						pheight:pheight
					},[view.buffer]
					);
			
		
			
		}
		//	timbeg=(new Date()).getTime();
		
	}	
function createWorker(i,imgData,srcData)
{
	
	 workers[i]=new Worker("compute_task.js");
	 workers[i].onmessage=function(event){
	 flag--;
	 var u=0,v=0;
	 var pano_pos=event.data.pano;
	 for(var j=0;j!=vheight/jobCount;++j)
         {
  		 for(var k=0;k!=vwidth;++k)
		 {
		 	u=pano_pos[(j*vwidth+k)*2];
		 	v=pano_pos[(j*vwidth+k)*2+1];
		 	for(var l=0;l!=4;++l)
	 		{
				imgData[((j+vheight/jobCount*i)*vwidth+k)*4+l]=
					srcData[(v*pwidth+u)*4+l];
			}
		 }
	}
	 if(flag==0)
	 {
	 	var img=RGBA2ImageData(imgMat);
		//draw on the canvas
		context.clearRect(0,0,vwidth,vheight);
		canvas.width=vwidth;
		canvas.height=vheight;
		canvas.style.width=vwidth;
		canvas.style.height=vheight;
		context.putImageData(img,0,0);
		flag=jobCount;
	//	 timend=(new Date()).getTime();
		 
	//		console.log(timend-timbeg);
	 }
	};
}
	$.fn.panorama=function(){
		this.each(function(){
			 vwidth=600;
			  vheight=400;
			  pwidth=0;
			  pheight=0;
			 fov=90; 
			 pan=90;
			 tilt=0;
			
			 
			var pano_mouse_position_x=vwidth/2;
			var pano_mouse_position_y=vheight/2;
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
				
				
				 imgMat=new Mat(vheight,vwidth);
				 var imgData=imgMat.data;
				 var srcData=srcMat.data;
				 
				
				 
				 for( var i=0;i!=jobCount;++i)
			    	 {
					createWorker(i,imgData,srcData);
				 }
				
				
				 
				
				draw();
				
				$(pano_element).bind('mousedown',function(event){
				pano_mouse_down=true;
				pano_mouse_position_x=event.clientX;
				pano_mouse_position_y=event.clientY;
				$(pano_element).parent().css("cursor","move");
				
				
				});
				$(pano_element).bind('mouseup',function(){
				pano_mouse_down=false;
				$(pano_element).parent().css("cursor","default");
				
			});
			$(pano_element).bind('mousemove',function(event){
				if(pano_mouse_down){
					pano_mouse_delta_x=pano_mouse_position_x-event.clientX;
					pano_mouse_delta_y=pano_mouse_position_y-event.clientY;
					
					pan+=pano_mouse_delta_x/100;
					
					
						tilt+=pano_mouse_delta_y/100;
						if(tilt>90)
							tilt=90;
						if(tilt<-90)
							tilt=-90;
					
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
