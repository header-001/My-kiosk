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
        console.log("alertDialog()");
        navigator.notification.alert(message,
        function(){
            console.log("Alert dismissed.");
        },
        title, button);
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
		"sortByAttrib" : 0,
		"ContentType":"json",
	},
	datas:"",
	msg : {
		Erreur:{
			fr:{
				ErreurConnexion:"Erreur de connexion",
				Condition : "Veuiller accepter les conditions d'utilisation avant de continuer",
				MsgBox : "Veuiller reéssayer",
				MsgBoxChoix : "Oui,No"
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

	onDeviceReady : function(){
		/*
		if($('.ui-page-active#home').length){
			var timeout = setTimeout(function(){
				$.mobile.changePage( "accueil.html", { transition: "pop"} );
					clearTimeout(timeout);
					}, 2000);
		}
		*/
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
				$('#tempopin').html(this.msgPin);
				$('#num').val(this.urlVars['num']);
			break;
			
			case "summary":
				this.actionFetchInfo();
				this.actionGetBal();
			break;
			
			case "account":
				this.actionFetchInfo();
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
		MyVoda.datas = datas;
		switch(action){
			case "ActionChoixLang":
				var url = datasArray[0]['value']
				$.mobile.changePage( url , {});
			break;
			case "ActionGenerationPin":
				this.actionGenerationPin(datas);
			break;
			case "ActionLoggin":
				this.actionLoggin(datas);
			break;
			case "ActionReGenerationPin":
				this.actionReGenerationPin(datas);
			break;
			case "ActionEditCompte":
				this.actionEditCompte(datas);
			break;
		}
	},
	
	actionGenerationPin : function(datas){
		var url = "pin.html?page=" + "pin&lang=" + MyVoda.currentLang;
		var action = "SetSession";
		
		$.myModaLoad({
			"url"		: url,
			"doaction"	: action,
			"datas"		:datas + "&Doaction=" + action
		});
	},
	
	actionLoggin : function(datas){
		var url = "summary.html?page=" + "summary&lang=" + MyVoda.currentLang;
		var action = "SingIn";

		$.myModaLoad({
			"url"		: url,
			"doaction"	: action,
			"datas"		:datas + "&Doaction=" + action
		});
	},
	
	actionReGenerationPin : function(datas){
		var action = "SingIn";
		
		$.myModaLoad({
			"doaction"	: action,
			"resendPin"	: true,
			"datas"		:datas + "&Doaction=" + action + "&ResendPin=" + true
		});
	},
	
	actionFetchInfo : function(){

		$.myModaLoad({
			"doaction"	: "FetchInfo",
			"datas"		:"s=" + MyVoda.urlVars['s'] + "&n=" + MyVoda.urlVars['n']
		});
	},
	
	actionGetBal : function(){
		
		var num = MyVoda.urlVars['n'];
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
		})
	},
	
	actionEditCompte : function(datas){
		var action = "EditCompte";
		
		$.myModaLoad({
			"url" : "summary.html",
			"paramsUrl" : "?page=" + "summary&lang=" + MyVoda.currentLang + "&s=" + MyVoda.urlVars['s'] + "&n=" + MyVoda.urlVars['n'],
			"doaction"	: action,
			"datas"		: datas + "&Doaction=" + action + "&s=" + MyVoda.urlVars['s']
		});
	}

}


document.addEventListener("deviceready", MyVoda.onDeviceReady, false);
$(document).ready(function(){
	MyVoda.onDeviceReady();
});

$( window ).on( "orientationchange", function( event ) {
	var $popup = $("#popupCondition");
	if($popup.length > 1){
		MyVoda.fixePopup($popup);
	}
});
$(document).bind('pageshow',function(){

	//initialisation
	MyVoda.urlVars = $.getVarsFromUrl();
	MyVoda.currentLang = MyVoda.urlVars['lang'];
	MyVoda.currentPage = MyVoda.urlVars['page'];
	
	MyVoda.majUrl();
	
	MyVoda.pageLoaded(MyVoda.currentPage);

	
	if($('.ui-page-active#home').length){
		var timeout = setTimeout(function(){
			$.mobile.changePage( "accueil.html", { transition: "pop"} );
				clearTimeout(timeout);
				}, 2000);
	}
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
		})
		//$('.iosSlider').iosSlider('goToSlide', 1);
		
		if($.Order == "true"){
			$(this).attr("data-order","false");
		}else{
			$(this).attr("data-order","true");
		}
		
	});
});




