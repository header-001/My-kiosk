/* handset header
 *
 * Galaxy Tab2 10.1 : Mozilla/5.0 (Linux; U; Android 4.0.4; fr-fr; GT-P5100 Build/IMM76D) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Safari/534.30
 * 
*/

if(navigator.platform == "Win32") 
	var server = "http://localhost/vdc4/httpdocs/index.php";
else
	var server = "http://10.0.2.2/vdc4/httpdocs/index.php";
	//var server = "http://192.168.200.102/vdc4/httpdocs/index.php";
var server = "http://localhost/vdc4/httpdocs/index.php";
//var server = "http://41.194.63.136";

var Notification = {

	beep : function(int){
        navigator.notification.beep(int);
    },
    
    vibrate : function(int){
      navigator.notification.vibrate(int*1000);
    },
    
    alertDialog : function(message, title, button) {
        console.log("alertDialog()");
        navigator.notification.alert(message,
        function(){
            console.log("Alert dismissed.");
        },
        title, button);
        console.log("After alert");
    },
    
    confirmDialog : function(message, title, buttons) {
        navigator.notification.confirm(message,
            function(r) {
                if(r===0){
                    console.log("Dismissed dialog without making a selection.");
                    alert("Dismissed dialog without making a selection.");
                }else{
                    console.log("You selected " + r);
                    alert("You selected " + (buttons.split(","))[r-1]);
                }
            },
            title,
            buttons);
        alert(buttonIndex);
    }
}

var MyVoda = {

	condIsCheck : false,
	currentLang : "fr",
	currentPage : "",
	urlVars : {},
	msgPin : "",
	catalogParams : {
		"limit" 	: 2,
		"offset"	: 0,
		"sort"		: "priority",
		"order"		: true,
		"ContentType":"json",
	},
	
	msg : {
		Erreur:{
			fr:{
				Condition : "Veuiller accepter les conditions d'utilisation avant de continuer"
			}
		}
	},

	onDeviceReady : function(){
		var timeout = setTimeout(function(){
			$.mobile.changePage( "accueil.html", { transition: "pop"} );
				clearTimeout(timeout);
				}, 1000);
	},
	
	/* 
	 * fixe la taille du popoup par rapport à la taille du screem 
	 */
	fixePopup : function($popup){
		
		var pageH = $(".ui-page-active").height();
		var pageW = $(".ui-page-active").width();
		var maxHeight = parseInt(pageH - 2*(pageH/10));
		var maxWidth = parseInt(pageW - 2*(pageW/10));
		
		$popup.css( {"max-height": maxHeight+ "px","width": maxWidth+ "px"});
		$popup.find( ".scrollable" ).css( {"max-height": $popup.height() - 3*($popup.height()/10)+ "px"});
	},
	
	/* 
	 * Mise à jour des params url dans les liens
	 */
	
	majUrl : function(){
		if($('a[data-url]').length){
			$('a[data-url]').each(function(i, item){
				
				$(item).attr('data-url', MyVoda.currentLang + '|'+ $(item).data('url'))
			});
		}
		if($('.link_account').length){
			$('.link_account a').attr('href', $('.link_account a').attr('href') + "?s=" + MyVoda.urlVars['s'] + "&n=" + MyVoda.urlVars['n'] +"&page=" + $('.link_account a').data('url') + "&lang=" + MyVoda.currentLang );
		}

		$(".content-secondary ul a").each(function(i, item){
			$(item).attr('href', $(item).attr('href') + "?s=" + MyVoda.urlVars['s'] + "&n=" + MyVoda.urlVars['n'] +"&page=" + $(item).data('url') + "&lang=" + MyVoda.currentLang );
		});
	},
	
	/*
	 * 
	 */
	
	pageLoaded : function(page){
		
		switch(page){
			case "pin":
				$('#tempopin').html(MyVoda.msgPin);
				$('#num').val(MyVoda.urlVars['num']);
			break;
			
			case "summary":
				$.myModaLoad({
					"doaction"	: "FetchInfo",
					"datas"		:"s=" + MyVoda.urlVars['s'] + "&n=" + MyVoda.urlVars['n']
				});
				var num = MyVoda.urlVars['n'];
				var action = "GetBal";
				
				$.bundlesBalance({
					"doaction"	: action,
					"num"		:num
				});
			break;
			
			case "account":
				$.myModaLoad({
					"doaction"	: "FetchInfo",
					"datas"		:"s=" + MyVoda.urlVars['s'] + "&n=" + MyVoda.urlVars['n']
				});
			break;
			case "shop":
					if($('.iosSlider').length) {
						$.loadCatalog();
					}
			break;
		}
	},
	
	/*
	 * 
	 */
	doAction : function(action, datas, datasArray){
		
		switch(action){
			case "ActionChoixLang":
				var url = datasArray[0]['value']
				$.mobile.changePage( url , {});
			break;
			case "ActionGenerationPin":
				var url = "pin.html?page=" + "pin&lang=" + MyVoda.currentLang;
				var action = "SetSession";
				
				$.myModaLoad({
					"url"		: url,
					"doaction"	: action,
					"datas"		:datas + "&Doaction=" + action
				});
			break;
			case "ActionLoggin":
				var url = "summary.html?page=" + "summary&lang=" + MyVoda.currentLang;
				var action = "SingIn";
	
				$.myModaLoad({
					"url"		: url,
					"doaction"	: action,
					"datas"		:datas + "&Doaction=" + action
				});
			break;
			case "ActionReGenerationPin":
				var action = "SingIn";
				
				$.myModaLoad({
					"doaction"	: action,
					"resendPin"	: true,
					"datas"		:datas + "&Doaction=" + action + "&ResendPin=" + true
				});
			break;
		}
	}
	
}


document.addEventListener("deviceready", MyVoda.onDeviceReady, false);
$(document).ready(function(){
	MyVoda.onDeviceReady();
});

$(document).on('pageshow',function(){

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
		
		var timeout = setTimeout(function(){
			parent.history.back();
			clearTimeout(timeout);
		}, 500);
	});
	
	$('a[data-url]').click(function(){
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
});




