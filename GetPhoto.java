package com.ylj.pano;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.net.URLConnection;

public class GetPhoto {
  private String urlHeader="http://maps.googleapis.com/maps/api/streetview?";
	private String location;
	private String size="640x640";
	private String heading;
	private String fov="90";
	private String pitch="0";
	private String name;
	public void setLocation(double lat,double lng)
	{
		location=""+lat+","+lng;
	}
	public void setFov(double fov)
	{
		this.fov=""+fov;
	}
	public void setHeading(double heading)
	{
		this.heading=""+heading;
	}
	public void setPitch(double pitch)
	{
		this.pitch=""+pitch;
	}
	public void setSize(int w,int h){
		size=""+w+"x"+h;
	}
	public GetPhoto(String name)
	{
		this.name=name;
	}
	/**
	 * 生成取出的全景图像
	 * @throws IOException
	 */
	public void GenPhoto() throws IOException
	{
		String urlText=urlHeader+"size="+size
				+"&location="+location
				+"&heading="+heading
				+"&pitch="+pitch
				+"&fov="+fov
				+"&sensor=false";
		URL url=new URL(urlText);
		URLConnection uc=url.openConnection();
		InputStream is=uc.getInputStream();
		File fl=new File(name);
		if(!fl.exists())
		{
			fl.createNewFile();
		}
		FileOutputStream os=new FileOutputStream(fl);
		int c;
		while((c=is.read())!=-1)
		{
			os.write(c);
		}
		is.close();
		os.close();
	}


}
