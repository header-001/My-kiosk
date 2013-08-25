package org.apache.cordova.jqm.kiosque;

import android.os.Bundle;

import org.apache.cordova.*;

public class FleoKioskActivity extends DroidGap {

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState); 
		super.setIntegerProperty("loadUrlTimeoutValue", 50000);
	    super.loadUrl(Config.getStartUrl());
		//super.loadUrl("file:///android_asset/www/index.html");
	}

}