$(document).bind("mobileinit", function(){
	 $.support.cors = true;
	/*$.mobile.defaultPageTransition="slide";*/
	$.mobile.allowCrossDomainPages = true;
	$.mobile.pushStateEnabled = false;
	//$.mobile.phonegapNavigationEnabled = true
	//$.mobile.touchOverflowEnabled  = true;
	$.mobile.defaultPageTransition = 'none';
});