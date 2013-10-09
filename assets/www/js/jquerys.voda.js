(function($, undefined){
	
	/* 
	 * Récuperations des valeurs passées en url
	 */
	$.getVarsFromUrl = function() {
	    var vars = [], hash;
	    var hashes;

	    if($.mobile.activePage.data('url').indexOf("?") != -1){ // first check the active page url for parameters
	         hashes = $.mobile.activePage.data('url').slice($.mobile.activePage.data('url').indexOf('?') + 1).split('&');
	    } else { // otherwise just get the current url
	         hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	    }

	    for(var i = 0; i < hashes.length; i++) {
	         hash = hashes[i].split('=');

	         if(hash.length > 1 && hash[1].indexOf("#") == -1){ // filter out misinterpreted paramters caused by JQM url naming scheme
	              vars.push(hash[0]);
	              vars[hash[0]] = hash[1];
	         }
	    }

	    return vars;
	};
	
	$.myVodaLoad = function(options){
		var defauts = {
			"url"		: "",
			"num"		: "",
			"pin"		: "",
			"doaction"	: "",
			"resendPin"	:0,
			"datas"		:"",
		};
		var params = $.extend(defauts, options);

		var url = server + "/" + MyVoda.currentLang + "/ezjscore/call/appmobile::login::" + params.doaction +"::"+ params.num +"::"+ params.pin +"::"+params.resendPin+"?ContentType=json";
		
		console.log(params);
		console.log(url);
		//Lance la requete server
		ajaxQuery(url,params);
		return false;
	};
	
	$.bundlesBalance = function(options){
		var defauts={
			"doaction"	: "bundlesBalance",
			"num"		:""
		};
		var params=$.extend(defauts, options);
		var url = server + "/" + MyVoda.currentLang + "/ezjscore/call/appmobile::bundlesBalance::" + params.num +"::" + params.doaction +"::?ContentType=json";
		
		ajaxQuery(url,params);
	};
	

	$.loadCatalog = function(options) {	
		
		var defauts={
			"limit"		: MyVoda.catalogParams.limit,
			"offset"	: MyVoda.catalogParams.offset,
			"sort"		: MyVoda.catalogParams.sort,
			"order"		: MyVoda.catalogParams.order,
			"sortByAttrib"	: 0,
			"contentType":"json",
			"doaction":"fetchOffres",
	     };
		
		var parametres=$.extend(defauts, options);
		
		var url =  server + "/" + MyVoda.currentLang + "/ezjscore/call/appmobile::fetchOffres::" + 
					parametres.limit + "::" + parametres.offset + "::" + parametres.sort + "::" + 
					parametres.order + "::"+parametres.sortByAttrib+"::?ContentType=" + parametres.contentType + "&image_alias=line_offre";
		
		console.log(url);
		
		//fetch from server
		queryCatalog(url,parametres);
		
		
	};
	
	$.myVodaLoadContent = function(options){

		
		var defauts={
			"type"	: "",
			"contenaire" : "#content",
			"data" : ""
		};

		var params=$.extend(defauts, options);
		
		var type= params.type;
		
		var result = {};
		var url = "";
		
		if(type=="help"){
			url = server + "/" + MyVoda.currentLang + "/ezjscore/call/appmobile::fetchcontent::help::?ContentType=json";
		}
		
		if(url){

			$.ajax({  
				 type: 'POST',
				 url: url, 
				 data: params.datas,
			     dataType: 'json',  
			     success:  function(data){
			    	// MyVoda.HelpContent = data.content;
			 		//$("#dialogPageHelp #content").html(MyVoda.HelpContent.body)
			     },
			     error: function(){
			    	 
			     },
			     beforeSend: function(){
			    		$.mobile.loading( "show", {
			    			text: "Chargement",
			    			textVisible: true
			    			});
			     },
			     complete: function(){
			    		 onCompleteFunction(params);
			     }
			 });
		}
		return result;
	};
	
	$.logout = function(params){

		var url = server + "/" + MyVoda.currentLang + "/ezjscore/call/appmobile::logout::" + params.num +"::?ContentType=json";
			
		console.log(url);
		//Lance la requete server
		ajaxQuery(url,params);
		return false;
	};
	
	$.findshop = function(options){
			
		var defauts={
			"data" : "",
			"doaction": ""
		};

		var params=$.extend(defauts, options);

		var data = params.data  + "&type=" + params.type;
		
		if(params.type=="pronvinces"){
			
			var url = server + "/" + MyVoda.currentLang + "/ezjscore/call/appmobile::findshop::pronvinces::?ContentType=json";
			//var url = server + "/" + MyVoda.currentLang + "/androidapi/getcontent/FindShop/pronvinces/json";
			ajaxQueryShop(url, params, data);
			
			var timeout ="";
			timeout = setTimeout(function(){
				var idProvince = 0;
				$.findshop({
					"type" : "shops",
					"idProvince" : idProvince,
					"limit" : 2
				});
				clearTimeout(timeout);
			}, 2000);
			
		}

		if(params.type=="shops"){
			
			data = data  + "&idProvince=" + params.idProvince;
			
			var url = server + "/" + MyVoda.currentLang + "/ezjscore/call/appmobile::findshop::shops::"+params.idProvince+"::?ContentType=json";
			//var url = server + "/" + MyVoda.currentLang + "/ezjscore/call/appmobile::fetchcontent::findshop::?ContentType=json";
			//var url = server + "/" + MyVoda.currentLang + "/androidapi/getcontent/FindShop/shops/json";
			ajaxQueryShop(url, params, data);
		}
		
	};
	ajaxQueryShop = function(url, params, data){
		console.log(url);
		$.ajax({  
			type: 'POST',url: url, data: data ,dataType: 'json',  
			 
			success:  function(result){
				console.log(result);
				addToList(result.content,params);
				
			},
			error: function(){
		    	
			},
			beforeSend: function(){
				$.mobile.loading( "show", {
					text: "Chargement",
					textVisible: true
		    	});
			},
			complete: function(){
				onCompleteFunction(params);
			}
		});
	};
	
	
	/*
	 *  Constitution et execution de la réquete
	 */
	ajaxQuery = function(url,params){
		$.ajax({  
			 type: 'POST',
			 url: url, 
			 data: params.datas,
		     dataType: 'json',  
		     success:  function(result){
		    	 onSuccessFunction(result,params);
		     },
		     error: function(){
		    	 onErrorFunction(params);
		     },
		     beforeSend: function(){
		    		$.mobile.loading( "show", {
		    			text: "Chargement",
		    			textVisible: true
		    			});
		     },
		     complete: function(){
		    		 onCompleteFunction(params);
		     }
		 });
	};

	var TotalItem = "";
	$.iossliderStart=false;
	
	queryCatalog = function(url,parametres){
		$.ajax({
			type: "POST",
			dataType: "json",
			url : url,
	     	success:  function (data) {
	     		MyVoda.catalogParams.offset = data.content.offset;
	     		MyVoda.catalogParams.limit = data.content.limit;
	     		MyVoda.catalogParams.sortByAttrib = data.content.sortByAttrib;
	     		TotalItem = data.content.total_count;
	     		if(data.content.count == 0){
		 			//var msg = MyVoda.msg.Notification[MyVoda.currentLang].Nobjects;
	 				//Notification.alertDialog(msg);
		      		$.mobile.loading( "hide");
	     		}else{
		     		$.each(data.content.list ,function(i, item){
		     			var prix = "";
			     		var img = "<img src='" + item.visuel + "' alt='" + item.name + "'/>";
			     		var title = "<h1 class='title'>" + item.name +"</h1>";
			     		if(parseInt(item.prix)>0)
			     			prix = "<span class='prix'> " + item.prix +"$</span>";
	
			     			
			     		$(".slider").append("<div class = 'item'>" + img + title + prix + "</div>");
		     		});
		     		var method = "";
		     		if(!$.iossliderStart){
			     		method = "start";
		     			$.iossliderStart=true;
		     			slideInit(TotalItem);
		     		}else{
		     			method = "update";
		     		}
		     		console.log('methode:' + method);
		     		$.iosSliderCall(method);
	     		}
	     	},
	        error: function () {
	       	  
	     	}, 
	     	beforeSend: function(){
	    		$.mobile.loading( "show", {
	    			text: "Chargement",
	    			textVisible: true
	    			});
	     	},
	     	complete: function(){
	      		$.mobile.loading( "hide");
	     	}
	    });
	};

	$.iosSliderCall = function(method){

		if(method =="update"){
			$('.iosSlider').iosSlider('update');
		}
		else{
			$('.iosSlider').iosSlider({
				snapToChildren: true,
				desktopClickDrag: true,
				keyboardControls: true,
				scrollbar: true,
				scrollbarHide:false,
				scrollbarDrag: true,
				scrollbarLocation: 'bottom',
				scrollbarMargin: '5px 20px 5px 20px',
				scrollbarBorderRadius: 0,
				scrollbarHeight: '2px',
				navPrevSelector: $('.prevButton'),
				navNextSelector: $('.nextButton'),
				navSlideSelector: $('.selectors .item'),
				onSlideChange: slideChange,
				onSliderLoaded: slideLoaded,
				onSliderUpdate: sliderUpdate
			});
		}
	};

	function slideLoaded(args){
		$(".count_article").html(TotalItem + " offres");
		for(var i = 0; i < args.data.numberOfSlides; i++) {
			var item = $('.selectors').children('.item')[i];
			$(item).addClass('active');
		}
	}
	function sliderUpdate(args){
		$('.selectors .item').removeClass('selected');
		$('.selectors .item:eq(' + (args.currentSlideNumber - 1) + ')').addClass('selected');
		
		for(var i = 0; i < args.data.numberOfSlides; i++) {
			var item = $('.selectors').children('.item')[i];
			$(item).addClass('active');
		}
	}
	function slideChange(args) {
		
		$('.selectors .item').removeClass('selected');
		$('.selectors .item:eq(' + (args.currentSlideNumber - 1) + ')').addClass('selected');
		
		currentSlideNumber = args.currentSlideNumber;
		numberOfSlides = args.data.numberOfSlides;
		if(currentSlideNumber == numberOfSlides){
			$.loadCatalog({
				"limit"		: MyVoda.catalogParams.limit,
				"sort"		: MyVoda.catalogParams.sortBy,
				"order"		: MyVoda.catalogParams.order,
				"offset"	: parseInt(parseInt(MyVoda.catalogParams.limit) + parseInt(MyVoda.catalogParams.offset)),
	     		"sortByAttrib" : MyVoda.catalogParams.sortByAttrib
			});
		}
	}
	function slideInit(totalItem){
		for(var i = 1; i <= totalItem; i++) {
			$('.selectors').append("<div class='item'></div>");
		}
		$('.selectors .item:first-child').addClass('first selected');
	}
	
	onSuccessFunction= function(result,params){
		console.log(result);
		switch(params.doaction){
		
		 	case "SetSession":
		 		if(result.content.error || result.error){
	 				var err = result.content.ErreurNumero;
			 		
	 				Notification.alertDialog(err);
	 				Notification.vibrate(0.5);
		 		}
		 		else{
		 			$.mobile.changePage( params.url + "&num=" + result.content.num + "&pin=" + result.content.pin , {}); 
		 			MyVoda.msgPin = result.content.msg;
		 		}
			 break;
			 
		 	case "SingIn":
		 		if(result.content.error || result.error){
	 				var err = result.content.msg;
	 				Notification.alertDialog(err);
	 				Notification.vibrate(0.5);
		 		}
		 		else{
		 			if(params.resendPin)
						$('#tempopin').html(result.content.msg);
		 			else
			 			$.mobile.changePage( params.url + "&num=" + result.content.num + "&pin=" + result.content.session , {}); 
		 		} 
		 	break;
		 	
		 	case "FetchInfo":
		 		__setDataContent(result.content);
		 	break;
		 	
		 	case "GetBal" :
		 		__onSuccessBalance(result,params);
		 	break;
		 	
		 	case "Logout":
		 		if(result.content.error || result.error){
		 	  		$.mobile.loading( "hide");
		        	$.showAlert(result.content.msg);
		        	Notification.vibrate(0.5);
		 		}else{
		 	  		$.mobile.loading( "hide");
		 			Notification.alertDialog(MyVoda.msg.Notification[MyVoda.currentLang].Deconnexion);
		 			$.mobile.changePage( params.redirect , {});
		 		}
		 	break;
		 	case "EditCompte":
		 		if(result.content.error || result.error){
		 	  		$.mobile.loading( "hide");
		        	Notification.alertDialog(result.content.msg);
		        	Notification.vibrate(0.5);
		 		}else{
		 	  		$.mobile.loading( "hide");
		 			Notification.alertDialog(MyVoda.msg.Notification[MyVoda.currentLang].MajCompte);
		 			$.mobile.changePage( params.url + params.paramsUrl , {});
		 		}
		 		
			 break;
		 }
	};
	
	onErrorFunction = function(params){
		console.log(params);
		var action = params.doaction;
		var title = MyVoda.msg.Erreur[MyVoda.currentLang].ErreurConnexion;
		var msgBox = MyVoda.msg.Erreur[MyVoda.currentLang].MsgBox;
		var msgBoxChoix = MyVoda.msg.Erreur[MyVoda.currentLang].MsgBoxChoix;
		
		if(action.resendPin)
			action = "ResendPin";
		
		Notification.confirmDialog(msgBox,title,msgBoxChoix,action);
		Notification.vibrate(0.5);
		$.mobile.loading( "hide");
	};
	
	onCompleteFunction= function(params){
  	  if(params.doaction !="FetchInfo")
  		$.mobile.loading( "hide");
	};
	
	__setDataContent = function(datas){
		
		 if($('.edit-account').length > 0){
			 $(".edit-account #num").html(datas.n);
			 $(".edit-account #num2").val(datas.n);
			 $(".edit-account #prenom").val(datas.compte.prenom);
			 $(".edit-account #nom").val(datas.compte.nom);
			 $(".edit-account #email").val(datas.compte.email);
			 $(".edit-account #pwd").val(datas.compte.pwd);
			 $(".edit-account #confirm_pwd").val(datas.compte.pwd);
			 $.mobile.loading( "hide");
		 }else{
			$(".info .num").html(datas.n);
			$(".info .nom").html(datas.compte.prenom + " " + datas.compte.nom);
			$(".info .email").html(datas.compte.email);
			//$(".info .profil").html(datas.compte.type_profil);
			 
		 }
	};
	__onSuccessBalance = function(data,params){
		
		var solde = data.content.Solde;
		
		$('.moncredit label').html(solde);
		setForfait(data.content.maxBundles,data.content.bundles); 
	};
	
	setForfait = function(maxBundles,bundles){
		//var forfait = ['.call.forfait', '.sms.forfait','.data.forfait'];
		
		var voice = bundles.voice,
		sms = bundles.sms,
		data = bundles.data,
		maxVoice = maxBundles.maxVoice,
		maxSms = maxBundles.maxSms,
		maxData = maxBundles.maxData;
		

		$('.call.forfait').find(".total").find("span").prepend(maxVoice);
		$('.call.forfait').find(".use").find("span").prepend(maxVoice-voice);
		$('.call.forfait').find(".rest").find("span").prepend(voice);
		$('.call #call').val(maxVoice + "-" + voice);
		
		$('.sms.forfait').find(".total").find("span").prepend(maxSms);
		$('.sms.forfait').find(".use").find("span").prepend(maxSms-sms);
		$('.sms.forfait').find(".rest").find("span").prepend(sms);
		$('.call #sms').val(maxSms + "-" + sms);
		
		$('.data.forfait').find(".total").find("span").prepend(maxData);
		$('.data.forfait').find(".use").find("span").prepend(maxData-data);
		$('.data.forfait').find(".rest").find("span").prepend(data);
		$('.call #internet').val(maxData + "-" + data);
		/*
		$.each(forfait,function(){
			$(this).find(".total").find("span").append(bundles.);
			$(this).find(".use").find("span").append();
			$(this).find(".rest").find("span").append();
		});
		*/
		var timeout = "";
		timeout = setTimeout(function(){
			setProress(maxVoice, voice, maxSms, sms, maxData, data);
			clearTimeout(timeout);
		}, 2000);
		
	};

	setProress = function(maxVoice, voice, maxSms, sms, maxData, data){
		$('.summary .forfaits .forfait .progressBar').width($('.summary .forfaits .forfait .progressBar').width());
		//if( $('#call').length && $('#call').val() && $('#sms').length && $('#sms').val()  && $('#internet').val() && $('#internet').length)
		if( $('#call').length && $('#call').val())
		{ 
			myVodaProgress(maxVoice, voice, $('#callBar'));
			myVodaProgress(maxSms, sms, $('#smsBar'));
			myVodaProgress(maxData, data, $('#dataBar'));
				
		}
	};
	/**
	* myVodaProgress for jQuery
	*
	* @version 1 (17. Juillet 2013)
	* @requires jQuery
	* @framework Vodacom Website Project
	*
	* @param {Number} max
	* @param {Number} forfait
	* @param {Number} element  DOM element
	*/
	myVodaProgress = function(max , forfait , element) {
		
		var ratio = element.width() / max; //console.log('width : ' + element.width());console.log('rasion : ' + ratio);
		var widthProgress = forfait * ratio;//console.log('widthProgress : ' + widthProgress);
		if(widthProgress < 0)
			widthProgress = 0;
		element.find('div').animate({ width: widthProgress }, 5000).html(forfait);

	};
	
	addToList = function(datas, params) {
    	
		if(params.type=="shops"){
			var idProvince = 0;
			var next = false;
			$.each(datas, function(i, item){
				idProvince = item.idProvince;
				if(params.limit > idProvince){
					next = true;
					$.each(item.shops, function(i, shop){
					
						var entry = "<div class='inline' id='shop'" + i +">"
								+ "<div class='part-left'>"
								+ "<h2>" + shop.nom + "</h2>"
								+ "<p>" + shop.adresse + "</p>"
								+ "<p>" + shop.telephone + "</p>"
								+ "</div>"
								+ "<div class='part-right'>"
								+ "<h2>Heures d'ouverture/fermeture</h2>"
								+ "<div>" + shop.heures + "</div>"
								+ "</div>"
								+ "<div style='clear:both'></div>"
								+ "<div class='voir-la-carte'>"
								+ "<a data-role='button' data-inline='true' data-icon='grid' data-iconpos='left' data-latitude='"+ shop.gps[1] +"' data-longitude='"+ shop.gps[2] +"'>Voir</a>"
								+ "</div>"
								+ "<div class='carte' id='carte-shop-"+ i +"'></div>"
								+ "</div>";
						$('#collapsible-content-' + idProvince).append(entry).trigger( "create" );
					});
				}
			});
			if(next){
				$.findshop({
					"type" : "shops",
					"idProvince" : parseInt(idProvince) + 1,
					"limit" : $.limitProvinces
				});
			}
		}else{
			$.limitProvinces = datas.pronvinces.length;
			var items = "";
	    	$.each(datas.pronvinces, function(i, pronvince){

				var item = 	'<div data-role="collapsible" class="pronvince pronvince-' + pronvince.id +'" id="'+ pronvince.id +'" >'
	    				+ '<h3>'+ pronvince.name +'</h3>'
	    				+ '<div class="collapsible-content" id="collapsible-content-' + pronvince.id +'">'
	         			+ '</div>'
	         			+ '</div>';
				//$(item).appendTo('#pronvinces');
				items += item;
				//$(".pronvince h3").unbind('click').bind('click',function(){ });
			});
			$('#pronvinces').html(items);
	      	//$('.pronvince').trigger('create');
	      	$('#pronvinces').collapsibleset("refresh", "inset" );
	    	//$('#pronvinces').trigger( "updatelayout" );
		}
		
    };
	
})(window.jQuery);