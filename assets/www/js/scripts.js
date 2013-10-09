/* 
*handset header
 *
 * Galaxy Tab2 10.1 : Mozilla/5.0 (Linux; U; Android 4.0.4; fr-fr; GT-P5100 Build/IMM76D) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Safari/534.30
 * 
*/

if(navigator.platform == "Win32") 
	var server = "http://localhost/vdc4/httpdocs/index.php";
else
	var server = "http://10.0.2.2/vdc4/httpdocs/index.php";
	//var server = "http://192.168.200.102/vdc4/httpdocs/index.php";
//var server = "http://localhost/vdc4/httpdocs/index.php";
	var server = "http://41.194.63.136";

var Notification = {

	beep : function(int){
        navigator.notification.beep(int);
    },
    
    vibrate : function(int){
      navigator.notification.vibrate(int*1000);
    },
    
    alertDialog : function(message, title, button) {
        console.log("alertDialog");
        alert(message);
       /* navigator.notification.alert(message,
        function(){
            console.log("Alert dismissed.");
        },
        title, button);*/
        console.log("After alert");
    },
    
    confirmDialog : function(message, title, buttons,action) {
    	Notification.action = action;
        navigator.notification.confirm(message,this.onConfirm,title,buttons);
    },

    onConfirm : function(buttonIndex) {
        if(buttonIndex == 1){
            Notification.reload(Notification.action);
        }

    },

    reload : function(action){

		$.mobile.loading( "show", {
			text: "Chargement",
			textVisible: true
		});
        if(action == "SetSession"){
        	MyVoda.actionGenerationPin(MyVoda.datas);
        }
        else if(action == "SingIn"){
        	MyVoda.actionLoggin(MyVoda.datas);
        }
        else if(action == "ResendPin"){
        	MyVoda.actionReGenerationPin(MyVoda.datas);
        }
        else if(action == "FetchInfo"){
        	MyVoda.actionFetchInfo();
        }
        else if(action == "GetBal"){
        	MyVoda.actionGetBal();
        }
        else if(action == "fetchOffres"){
        	MyVoda.actionfetchOffres();
        }
    	
    }
};

var MyVoda = {
		
	condIsCheck : false,
	currentLang : "fr",
	currentPage : "",
	urlVars : {},
	msgPin : "",
	datas:"",
	HelpContent : [],
	catalogParams : {
		"limit" 	: 5,
		"offset"	: 0,
		"sort"		: "priority",
		"order"		: true,
		"sortByAttrib" : 0,
		"ContentType":"json",
	},
	
	msg : {
		Erreur:{
			fr:{
				ErreurConnexion:"Erreur de connexion",
				Condition : "Veuiller accepter les conditions d'utilisation avant de continuer",
				MsgBox : "Veuiller reéssayer",
				MsgBoxChoix : ["Oui","No"]
			}
		},
		Notification:{
			fr:{
				Deconnexion : "Vous êtes deconnectez.\n Merci",
				MajCompte 	: "Vos informations sont mise à jour",
				Nobjects	: "il ya plus d'objects"
			}
		}
	},
	
	currentShop : {
		nom : "",
		latitude : "-4.3297220",
		longitude : "15.3150000"
	},
	
    initialize: function() {
        this.bindEvents();
    },

    bindEvents: function() {
    	if(navigator.platform == "Win32"){
    		this.hostmane = "http://localhost/platemobile/index.php";
    		$(document).on('pageshow',function(){  
    			MyVoda.onDeviceReady();
	    	});
    	}else
    		document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {

		if($('.ui-page-active#home').length){
			var timeout="";
			timeout = setTimeout(function(){
				$.mobile.changePage( "accueil.html", { transition: "pop"} );
					clearTimeout(timeout);
					}, 2000);
					
		}
    },

    /* 
	 * fixe la taille du popoup par rapport à la taille du screem 
	 */
	fixePopup : function($popup){
		
		var pageH = $(".ui-page-active").height();
		var pageW = $(".ui-page-active").width();
		var maxHeight = parseInt(pageH - 20);
		var maxWidth = parseInt(pageW - 20);
		
		$popup.css( {"max-height": maxHeight+ "px","width": parseInt(maxWidth-50)+ "px"});
		$popup.find( ".scrollable" ).css( {"max-height": parseInt($popup.height() - 100)+ "px"});
	},
	
	/* 
	 * Mise à jour des params url dans les liens
	 */
	
	majUrl : function(){
		if($('a[data-url]').length){
			$('a[data-url]').each(function(i, item){
				
				$(item).attr('data-url', MyVoda.currentLang + '|'+ $(item).data('url'));
			});
		}
		if($('.link_account').length){
			$('.link_account a').attr('href', $('.link_account a').attr('href') + "?pin=" + MyVoda.urlVars['pin'] + "&num=" + MyVoda.urlVars['num'] +"&page=" + $('.link_account a').data('url') + "&lang=" + MyVoda.currentLang );
		}

		$(".content-secondary ul a, .navbar.bottom-menu a").each(function(i, item){
			if($(item).parents('li').attr('id')!="direct-access-loggin")
				$(item).attr('href', $(item).attr('href') + "?pin=" + MyVoda.urlVars['pin'] + "&num=" + MyVoda.urlVars['num'] +"&page=" + $(item).data('url') + "&lang=" + MyVoda.currentLang );			
		});

		$('.deconnexion').attr("data-num",MyVoda.urlVars['num']);
	},
	
	/*
	 * 
	 */
	
	pageLoaded : function(page){
		
		switch(page){
			case "pin":
				$('#tempopin').html(this.msgPin);
				$('#num').val(this.urlVars['num']);
			break;
			
			case "summary":
				console.log(MyVoda);
				this.actionFetchInfo();
				this.actionGetBal();
			break;
			
			case "account":
				this.actionFetchInfo();
			break;
			
			case "shop":
				if($('.iosSlider').length) {
					$.iossliderStart=false;
					$.loadCatalog();
				}
			break;
			case "findshop":
				if($('.findshop').length) {
				
					$.findshop({
						"type" : "pronvinces"
					});
				}
			break;
		}
	},
	
	/*
	 * 
	 */
	doAction : function(action, datas, datasArray){
		
		MyVoda.datas = datas;
		switch(action){
			case "ActionChoixLang":
				var url = datasArray[0]['value'];
				$.mobile.changePage( url , {});
			break;
			case "ActionGenerationPin":
				this.actionGenerationPin(datas,datasArray);
			break;
			case "ActionLoggin":
				this.actionLoggin(datas,datasArray);
			break;
			case "ActionReGenerationPin":
				this.actionReGenerationPin(datas,datasArray);
			break;
			case "ActionEditCompte":
				this.actionEditCompte(datas);
			break;
		}
	},
	
	actionGenerationPin : function(datas,datasArray){
		var url = "pin.html?page=" + "pin&lang=" + MyVoda.currentLang;
		var action = "SetSession";
		
		$.myVodaLoad({
			"url"		: url,
			"doaction"	: action,
			"datas"		:datas + "&Doaction=" + action,
			"num" : datasArray[0]['value']
		});
	},
	
	actionLoggin : function(datas,datasArray){
		var url = "summary.html?page=" + "summary&lang=" + MyVoda.currentLang;
		var action = "SingIn";
		console.log(datasArray);
		$.myVodaLoad({
			"url"		: url,
			"doaction"	: action,
			"datas"		:datas + "&Doaction=" + action,
			"num" : datasArray[0]['value'],
			"pin" : datasArray[1]['value']
		});
	},
	
	actionReGenerationPin : function(datas,datasArray){
		var action = "SingIn";
		
		$.myVodaLoad({
			"doaction"	: action,
			"resendPin"	: 1,
			"datas"		:datas + "&Doaction=" + action + "&ResendPin=" + true,
			"num" : datasArray[0]['value']
		});
	},
	
	actionFetchInfo : function(){
		console.log(MyVoda);
		$.myVodaLoad({
			"doaction"	: "FetchInfo",
			"datas"		:"pin=" + MyVoda.urlVars['pin'] + "&num=" + MyVoda.urlVars['num'],
			"num" : MyVoda.urlVars['num'],
			"pin" : MyVoda.urlVars['pin']
		});
	},
	
	actionGetBal : function(){
		
		var num = MyVoda.urlVars['num'];
		var action = "GetBal";
		
		$.bundlesBalance({
			"doaction"	: action,
			"num"		:num
		});
	},
	
	actionfetchOffres : function(){

		$.loadCatalog({
			"limit"		: MyVoda.catalogParams.limit,
			"sort"		: MyVoda.catalogParams.sortBy,
			"order"		: MyVoda.catalogParams.order
		});
	},
	
	actionEditCompte : function(datas){
		var action = "EditCompte";
		
		$.myVodaLoad({
			"url" : "summary.html",
			"paramsUrl" : "?page=" + "summary&lang=" + MyVoda.currentLang + "&pin=" + MyVoda.urlVars['pin'] + "&num=" + MyVoda.urlVars['num'],
			"doaction"	: action,
			"datas"		: datas + "&Doaction=" + action + "&pin=" + MyVoda.urlVars['pin'],
			"num" : MyVoda.urlVars['num'],
			"pin" : MyVoda.urlVars['pin']
		});
	}
};


MyVoda.initialize();

$( window ).on( "orientationchange", function( event ) {
	event.preventDefault();
	var $popup = $("#popupCondition");
	if($popup.length > 1){
		MyVoda.fixePopup($popup);
	}
});

$(document).bind('pageshow',function(event){
	
	//initialisation
	MyVoda.urlVars = $.getVarsFromUrl();
	MyVoda.currentLang = MyVoda.urlVars['lang'];
	MyVoda.currentPage = MyVoda.urlVars['page'];
	
	MyVoda.majUrl();
	
	MyVoda.pageLoaded(MyVoda.currentPage);


	// Envoie du formualire
	$('.submit').on('click',function(){
		
		//Récupéraction de l'object form et de l'action
		var action 		= $(this).attr('id');
		var $form 		= $(this).parents("form");
		var datas 		= $form.serialize();
		var datasArray 	= $form.serializeArray();
		
		//Traitement selon les actions
		MyVoda.doAction(action, datas, datasArray);
		
		return false;
	});
	
	/*
	 * Activation du popup
	 */
	$( "#popupCondition" ).on({
		popupbeforeposition: function() { MyVoda.fixePopup($(this));}
	});
	/*
	 * verification si la condition d'utilisation est checké avant de continuer
	 */
	$('#checkbox-0').click(function(){
		if ( $(this).is(':checked')){
			MyVoda.condIsCheck=true;
		}else
			MyVoda.condIsCheck=false;
		
		var timeout="";
		timeout = setTimeout(function(){
			parent.history.back();
			clearTimeout(timeout);
		}, 500);
	});
	
	$('a[data-url]').on('click',function(event){
	
		var nextPage = $(this).attr('href') + "?page=" + $(this).data('url') + "&lang=" + MyVoda.currentLang;
		var id = $(this).attr('id');
		
		switch(id){
	 		case "start":
	 			//On contrôle que la condition est bien validée
	 			if (MyVoda.condIsCheck){
	 				$.mobile.changePage( nextPage , {});
	 				return false;
	 			}
	 			else{
	 				var err = MyVoda.msg.Erreur[MyVoda.currentLang].Condition;
	 				Notification.alertDialog(err);
	 				Notification.vibrate(0.5);
	 				return false;
	 			}
			break;
		 
	 		default :
 				$.mobile.changePage( nextPage , {});
 				return false;
			break;
		}
		return false;
	});
	/*
	 * Afficher les offres par nom, prix ou marque
	 */
	$(".navbar a").click(function(){

		MyVoda.catalogParams.sortBy 	= $(this).data('sortby');
		MyVoda.catalogParams.order 		= $(this).attr("data-order");
		MyVoda.catalogParams.limit		= MyVoda.catalogParams.limit;
		$.scrollbarNumber = 0;
		$.iossliderStart=false;
		$('.selectorsBlock .selectors, .slider').empty();
		$('.iosSlider').iosSlider('destroy');

		$.loadCatalog({
			"limit"		: MyVoda.catalogParams.limit,
			"sort"		: MyVoda.catalogParams.sortBy,
			"order"		: MyVoda.catalogParams.order,
			"sortByAttrib" : 1
		});
		//$('.iosSlider').iosSlider('goToSlide', 1);
		
		if($.Order == "true"){
			$(this).attr("data-order","false");
		}else{
			$(this).attr("data-order","true");
		}
		
	});
	$('.deconnexion').on('click',function(event){
		
		$.logout({
			"redirect"	: "../index.html",
			"num"		: MyVoda.urlVars['num'],
			"doaction"	: "Logout",
		});
		
		return false;
	});

	$('.voir-la-carte').on('click',function(event){ 
	});
	
	$(document).delegate(".voir-la-carte a","click",function(){
		MyVoda.currentShop.latitude = $(this).data('latitude');
		MyVoda.currentShop.longitude = $(this).data('longitude');
		var params = "";
		params = "?prevPage="+MyVoda.currentPage+"&lang="+MyVoda.currentLang+"&lat=" + $(this).data('latitude') + "&long=" + $(this).data('longitude');
		var url = "carte.html" + params;
		$.mobile.changePage( url , {});
		return false;
	});
	
	$('.roll-back').on('click',function(event){

		event.stopPropagation();
		event.preventDefault();
		var url = MyVoda.urlVars['prevPage'] + ".html?lang="+MyVoda.currentLang;
		$.mobile.changePage( url , {});	
		return false;
	});
	//console.log(MyVoda.urlVars);
	return false;
});

$( document ).on( "pagebeforechange", function( event, data ) {

	event.stopPropagation();
	//event.preventDefault();
});

var longitude = MyVoda.currentShop.longitude;
var latitude = MyVoda.currentShop.latitude;
var title = MyVoda.currentShop.nom;

var icon_path = "../img/phones.png";

function loadmap(){
	//alert("chargement de la carte ...");
	var mapElt = document.getElementById('map');
	var latlong = new google.maps.LatLng(latitude, longitude);
	var icon_path = "../img/phones.png";
	var mapOptions = {
		center: latlong,
		mapTypeControl: false,
		zoomControl: true,
		zoomControlOptions: {
			style: google.maps.ZoomControlStyle.SMALL
		},
		zoom: 15,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	var map = new google.maps.Map(mapElt, mapOptions);
	var marker = new google.maps.Marker({icon : icon_path, map : map, visible: true, title : title, position : latlong});
}

$(document).on('pageshow',function(event,data){

	console.log(data);
	if($('.ui-page-active #map').length > 0){
		//importScripts("http://maps.googleapis.com/maps/api/js?sensor=false");
		
		longitude = MyVoda.currentShop.longitude;
		latitude = MyVoda.currentShop.latitude;
		title = MyVoda.currentShop.nom;
		loadmap();
		//google.maps.event.addDomListener(window, 'load', loadmap);
	}
});
//google.maps.event.addDomListener(window, 'load', loadmap);
