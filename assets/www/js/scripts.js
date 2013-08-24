document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
	var height = $(window).height();
	$('.home').height(height)
	var timeout = setTimeout(function(){
		$.mobile.changePage( "accueil.html", { transition: "pop"} );
		clearTimeout(timeout);
	}, 10000);
}

	
function contentfixe(){
    var height = $(window).height();
    if($(".ui-page-active .home").length){
    	$('.home').height(height)
    }
    if($(".index").length){
    	$('.index').each(function(i,index){
    		//alert($(index).find('.content').height())
    		//alert($(index).height())
    		//alert(height)
    		//$(index).find('.content').css({"margin-top" : parseInt(height-$(index).height())/2})
    	});
    }
}
$( window ).on( "orientationchange", function( event ) {
	//alert( "This device is in " + event.orientation + " mode!" );
	/*if(event.orientation =="landscape"){
		$("#orientaion").attr('href',"css/lanscape.css");
	}else{
		$("#orientaion").attr('href',"css/portrait.css");
	}*/
	
	contentfixe();
});

$(window).resize( function(){

});
$(document).on('pageinit',function(e){
		//$(window).resize();
});
$(document).on('pagebeforechange',function(e){
	$('.ui-loader').hide();
});

$(document).on('pageshow',function(){

	$.urlVars = $.getVarsFromUrl();
	$.lang = $.urlVars['lang'];
	$.page = $.urlVars['page'];

	
	/*
	 * Chargement de la première page apres 5 secondes
	 */
	if($(".ui-page-active .home").length){
		//var h = $(".home").parent().css("max-height");
		//$('.home').css({"min-height": h});
		//alert(navigator.userAgent)
		//Mozilla/5.0 (Linux; U; Android 4.0.4; fr-fr; GT-P5100 Build/IMM76D) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30
	   /* var height = $(window).height();
    	$('.home').height(height)
		var timeout = setTimeout(function(){
			$.mobile.changePage( "accueil.html", { transition: "pop"} );
			clearTimeout(timeout);
		}, 10000); */
	}
	if($(".ui-page-active.index").length){
		//$('.index ').css({"display": "table"});
		//$('.index div[data-role="content"]').css({"display": "table-cell","vertical-align":"middle"});
	    //var height = $(window).height();
	    //var heightIndex = $('.index .content').height();
		//$('.index .content').css({"margin-top": parseInt(height-heightIndex)/2});
	}
	//contentfixe();
	/*
	 *  Boutton de choix de langue
	 */

	$('.langues .entrer').bind('click', function() { 
			var values = $(this).parents("form").serializeArray();
			var url = values[0]['value']
			$.mobile.changePage( url , {}); 
			return false;
	});
	
	/*
	 * verification si la condition d'utilisation est checké avant de continuer
	 */
	$('#checkbox-mini-0').click(function(){
		if ( $(this).is(':checked')){
			$.condIsCheck=true;
		}
		
		var timeout = setTimeout(function(){
			parent.history.back();
			clearTimeout(timeout);
		}, 1000);
	});
	/*
	 * Activation du popup
	 */
	$( "#popupCondition" ).on({
		
		popupbeforeposition: function() {
			var pageH = $(".ui-page-active").height();
			var pageW = $(".ui-page-active").width();
			var maxHeight = parseInt(pageH - 2*(pageH/10));
			var maxWidth = parseInt(pageW - 2*(pageW/10));
			
			$( "#popupCondition" ).css( {"max-height": maxHeight+ "px",
											//"height": maxHeight,
											"width": maxWidth+ "px",
											//"position": "absolute",
											});
			
			$( "#popupCondition .scrollable" ).css( {"max-height": $( "#popupCondition").height() - 3*($( "#popupCondition").height()/10)+ "px"});
		}
	});
	
	
	/*
	 * Ajout de complement de l'url sur chaque lien
	 */
	var nextPage = "";
	if($('a[data-url]').length){
		$('a[data-url]').each(function(i, item){
			
			$(item).attr('data-url', $.lang + '|'+ $(item).data('url'))
		});
	}
	if($('.link_account').length){
		$('.link_account a').attr('href', $('.link_account a').attr('href') + "?s=" + $.urlVars['s'] + "&n=" + $.urlVars['n'] +"&page=" + $('.link_account a').data('url') + "&lang=" + $.lang);
	}

	$(".content-secondary ul a").each(function(i, item){
		$(item).attr('href', $(item).attr('href') + "?s=" + $.urlVars['s'] + "&n=" + $.urlVars['n'] +"&page=" + $(item).data('url') + "&lang=" + $.lang);
	});
	
	/*
	 * Boutton deconnexion
	 */
	$('.deconnexion').attr("data-num",$.urlVars['n'])
	
	
	switch($.page){
	 
		case "pin":
			$('#tempopin').text($.affiPin);
			$('#num').val($.urlVars['num']);
		break;
			case "summary":
	
			$.fleoLoad({
				"Doaction"	: "FetchInfo",
				"Datas"		:"s=" + $.urlVars['s'] + "&n=" + $.urlVars['n']
			});
			var num = $.urlVars['n'];
			var action = "GetBal";
			
			$.bundlesBalance({
				"Doaction"	: action,
				"num"		:num
			});
		break;
			case "account":
	
			$.fleoLoad({
				"Doaction"	: "FetchInfo",
				"Datas"		:"s=" + $.urlVars['s'] + "&n=" + $.urlVars['n']
			});
		break;
			case "shop":

				if($('.iosSlider').length) {
					$.loaded();
				}
			
		break;
	}
	$('a[data-url]').click(function(){
		
		nextPage = $(this).attr('href') + "?page=" + $(this).data('url') + "&lang=" + $.lang;
		
		var id = $(this).attr('id');
		
		switch(id){
		 
	 		case "start":
	 			//On contrôle que la condition est bien validée
	 			if ($.condIsCheck){
	 				$.mobile.changePage( nextPage , {});
	 				return false;
	 			}
	 			else{
	 				var err = $.msg.Erreur[$.lang].Condition;
	 				$.showAlert(err);
		        	$.vibrate();
	 				return false;
	 			}
			break;
		 
	 		case "touch":
 				$.mobile.changePage( nextPage , {});
 				return false;
			break;
		 
	 		case "send":
 				$.mobile.changePage( nextPage , {});
 				return false;
			break;
		
		}
	});
	
	
	$('#send').click(function(){
		
		var datas = formSerialize($(this));
		var url = "pin.html?page=" + "pin&lang=" + $.lang;
		var action = "SetSession";
		
		$.fleoLoad({
			"Url"		: url,
			"Doaction"	: action,
			"Datas"		:datas + "&Doaction=" + action
		});
	});
	
	$('#signin').click(function(){
		
		var datas = formSerialize($(this));
		var url = "summary.html?page=" + "summary&lang=" + $.lang;
		var action = "SingIn";
		
		$.fleoLoad({
			"Url"		: url,
			"Doaction"	: action,
			"Datas"		:datas + "&Doaction=" + action
		});
	});
	
	$('#resend').click(function(){
		
		var datas = formSerialize($(this));
		var action = "SingIn";
		
		$.fleoLoad({
			"Doaction"	: action,
			"ResendPin"	: true,
			"Datas"		:datas + "&Doaction=" + action + "&ResendPin=" + true
		});
	});
	
	$('#EditCompte').click(function(){
		
		var datas = formSerialize($(this));
		var action = "EditCompte";
		
		$.fleoLoad({
			"Url" : "summary.html",
			"ParamsUrl" : "?page=" + "summary&lang=" + $.lang + "&s=" + $.urlVars['s'] + "&n=" + $.urlVars['n'],
			"Doaction"	: action,
			"Datas"		:datas + "&Doaction=" + action + "&s=" + $.urlVars['s']
		});
		return false;
	});

	$('.deconnexion').click(function(){
		var action = "Logout";
		var url = "../index.html";
		
		$.fleoLoad({
			"Url"		: url,
			"Doaction"	: action,
			"Datas"		: "num=" + $(this).data('num') + "&Doaction=" + action
		});
	});
	
	/*
	 * Afficher les offres par nom, prix ou marque
	 */
	$(".navbar a").click(function(){

		$.params.SortBy 	= $(this).data('sortby');
		$.params.Order 		= $(this).attr("data-order");
		$.params.Limit		= $.Limit;
		$.scrollbarNumber = 0;
		$.iossliderStart=false;
		$('.selectorsBlock .selectors, .slider').empty();
		$('.iosSlider').iosSlider('destroy');

		$.loaded({
			"Limit"		: $.params.Limit,
			"Sort"		: $.params.SortBy,
			"Order"		: $.params.Order
		})
		//$('.iosSlider').iosSlider('goToSlide', 1);
		
		if($.Order == "true"){
			$(this).attr("data-order","false");
		}else{
			$(this).attr("data-order","true");
		}
		
	});
	
	
	function formSerialize(elt){
		var form 	= elt.parents('form');
		return  form.serialize();
	}
});	 
