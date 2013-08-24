(function ($) {

	var server="";
	var TotalItem = "";
	$.urlVars ="";
	$.lang = "";
	$.page = "";

	$.params = {
			SortBy : "priority",
			Order : true,
			Limit : 2,
			offset : 0
	}
	
	$.condIsCheck 	= false;
	$.iossliderStart=false;
	
	if(navigator.platform == "Win32") 
		server = "http://localhost/vdc4/httpdocs/index.php";
	else
		//server = "http://10.0.2.2/vdc4/httpdocs/index.php";
		server = "http://192.168.200.102/vdc4/httpdocs/index.php";

		server = "http://41.194.63.136";
	$.msg = {
			
		Erreur:{
			
			fr:{
				ErreurConnexion:"Erreur de connexion",
				ErreurNumero: "Numéro invalide",
				ErreurPin: "Erreur Pin",
				Deconnexion : "Vous êtes deconnectez.\n Merci",
				Condition : "Veuiller accepter les conditions d'utilisation avant de continuer"
			},
			en:{
				ErreurConnexion:"Connection error",
				ErreurNumero: "Invalid number",
				ErreurPin: "Error Pin",
				Deconnexion : "You are logout.\n Thanks",
				Condition : "Pleae Accept Terms & Conditions use before continuing"
			}
		},
		Notification:{
			
			fr:{
				Deconnexion : "Vous êtes deconnectez.\n Merci",
				MajCompte 	: "Vos informations sont mise à jour"
			},
			en:{
				Deconnexion : "You are logout.\n Thanks",
				MajCompte 	: "Vos informations sont mise à jour"
			}
		}
			
	}
	
	//Récuperations des valeurs passées en url
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

	onError = function(){
        showAlert($.msg.Erreur[$.lang].ErreurConnexion);
	 };
		
	// alert dialog dismissed
	alertDismissed = function(){
        // do something
    };

	$.showAlert = function(msg) {
	     navigator.notification.alert(
	         msg,  // message
	         alertDismissed,         // callback
	         'Notification',            // title
	         'OK'                  // buttonName
	     );
	 };
	 
	 showConfirm = function(msg){
		    navigator.notification.confirm(
		    	msg,  // message
		        onConfirm,              // callback to invoke with index of button pressed
		        'Confirmation',            // title
		        'Annuler,Continuer'          // buttonLabels
		    );
	 };
	 
	onConfirm = function(buttonIndex) {
		 $.Confirm = buttonIndex;
	};
	 
	$.vibrate = function(){
		 navigator.notification.vibrate(500);
	 };
	
	 $.fleoLoad = function(options){
		 
		 var defauts=
			{
					"Doaction"	: "",
					"ResendPin"	:false,
					"Datas"		:""
		     };
		 var params=$.extend(defauts, options);
		 
		 $.ajax({  
			 type: 'POST',
			 url: server + "/" + $.lang + "/ezjscore/call/appmobile::login::" + defauts.Doaction +"::?ContentType=json", 
			 data: params.Datas,
		     timeout : 30000,
		     dataType: 'json',  
		     success:  function (data) {
		    	 onSuccess(data,params);
	          },
	          error: function () {
	        	  onErrorfunction();
	        	  $.vibrate();
	        	  $('.ui-loader').hide();
	          }, 
	          beforeSend: function(){
	        	  $('.ui-loader').show();
	          },
	          complete: function(){
	        	  if(params.Doaction !="FetchInfo")
	        		  $('.ui-loader').hide();
	          } 
		 });
		 return false;
	 };
		 
	 function onSuccess(data,params){
		 
		 switch(params.Doaction){
		 
		 	case "SetSession":
		 		if(data.content.error || data.error){
		        	$.vibrate();
		        	$.showAlert(data.content.msg);
		 		}
		 		else{
		 			$.mobile.changePage( params.Url + "&num=" + data.content.num + "&pin=" + data.content.pin , {}); 
		 			$.affiPin = data.content.msg;
		 		}
			 break;
		 	case "SingIn":
		 		if(data.content.error || data.error){
		        	$.vibrate();
		        	$.showAlert(data.content.msg);
		 		}
		 		else{
		 			if(params.ResendPin)
						$('#tempopin').text(data.content.msg);
		 			else
			 			$.mobile.changePage( params.Url + "&n=" + data.content.num + "&s=" + data.content.session , {}); 
		 		} 
			 break;
		 	case "Logout":
		 		if(data.content.error || data.error){
		        	$('.ui-loader').hide();
		        	$.showAlert(data.content.msg);
		        	vibrate();
		 		}else{
		 			$('.ui-loader').hide();
		        	$.showAlert($.msg.Notification[$.lang].Deconnexion);
		 			$.mobile.changePage( params.Url , {});
		 		}
		 	case "FetchInfo":
		 		_setDataContent(data.content);
		 		
			 break;
		 	case "EditCompte":
		 		if(data.content.error || data.error){
		        	$('.ui-loader').hide();
		        	$.showAlert(data.content.msg);
		        	vibrate();
		 		}else{
		 			$('.ui-loader').hide();
		        	$.showAlert($.msg.Notification[$.lang].MajCompte);
		 			$.mobile.changePage( params.Url + params.ParamsUrl , {});
		 		}
		 		
			 break;
		 }
	 }
	 
	 function  onErrorfunction(){
        $.showAlert($.msg.Erreur[$.lang].ErreurConnexion);
	 }
	 function _setDataContent(datas,block){
		
		 if($('.edit-account').length > 0){
			 $(".edit-account #num").html(datas.n);
			 $(".edit-account #num2").val(datas.n);
			 $(".edit-account #prenom").val(datas.compte.prenom);
			 $(".edit-account #nom").val(datas.compte.nom);
			 $(".edit-account #email").val(datas.compte.email);
			 $(".edit-account #pwd").val(datas.compte.pwd);
			 $(".edit-account #confirm_pwd").val(datas.compte.pwd);
       	  	$('.ui-loader').hide();
		 }else{
			$(".info .num").html(datas.n);
			$(".info .nom").html(datas.compte.prenom + " " + datas.compte.nom);
			$(".info .email").html(datas.compte.email);
			//$(".info .profil").html(datas.compte.type_profil);
			 
		 }
	}
	
	$.fn.vAlign = function() {
		return this.each(function(i){
			var ah = $(this).height();
			//var ph = $(this).parent().height();
			//var ph = $(".ui-page-active").height();
			var ph = $(".ui-page-active").css("min-height");
			var mh = (ph - ah) / 2;
		$(this).css('margin-top', mh);
		});
	};
	
	$.loaded = function(options) {	
		
		var defauts=
		{
				"Url"		: server + "/" + $.lang + "/ezjscore/call/vodashop::fetchProductItems",
				"Limit"		: $.params.Limit,
				"Offset"	: 0,
				"Sort"		: $.params.SortBy,
				"Order"		: $.params.Order,
				"ContentType":"json",
	     };
		
		var parametres=$.extend(defauts, options);
		 
		var q = parametres.Url + "::" + parametres.Limit + "::" + parametres.Offset + "::" + parametres.Sort + "::" + 
		parametres.Order + "::?ContentType=" + parametres.ContentType + "&image_alias=line_offre";
		console.log(q);
		
		//fetch from server
		$.query(q,parametres);
		
		varOffset = parametres.Offset;
		varLimit = parametres.Limit;
		
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
		$(".count_article").html(TotalItem + " offres")
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
		
		currentSlideNumber = args.currentSlideNumber
		numberOfSlides = args.data.numberOfSlides
		if(currentSlideNumber == numberOfSlides){
			$.loaded({
				"Limit"		: $.params.Limit,
				"Sort"		: $.params.SortBy,
				"Order"		: $.params.Order,
				"Offset"	: parseInt($.params.Limit) + parseInt($.params.offset)
			})
		}
	}
	function slideInit(totalItem){
		for(var i = 1; i <= totalItem; i++) {
			$('.selectors').append("<div class='item'></div>");
		}
		$('.selectors .item:first-child').addClass('first selected');
		//$('.selectors').css({"width": parseInt($.TotalItem + ($.TotalItem/2)) + "em",});
	}
	
	$.query = function(url,parametres){
		$.ajax({
			type: "POST",
			dataType: "json",
			url : url,
	     	success:  function (data) {
	     		$.offset = data.content.offset;
	     		$.Limit = data.content.limit;
	     		TotalItem = data.content.total_count;
	     		
	     		$.each(data.content.list ,function(i, item){
		     		
		     		var img = "<img src=' " + item.visuel + "' alt='" + item.name + "'/>";
		     		var title = "<h1 class='title'>" + item.name +"</h1>";
		     		var prix = "<span class='prix'> " + item.prix +"$</span>";
		     		$(".slider").append("<div class = 'item'>" + img + title + prix + "</div>");
	     		});
	     		
	     		if(!$.iossliderStart){
		     		var method = "start";
	     			$.iossliderStart=true;
	     			slideInit(TotalItem);
	     		}else{
	     			var method = "update";
	     		}
	     		
	     		$.iosSliderCall(method);
	     	},
	        error: function () {
	       	  
	     	}, 
	     	beforeSend: function(){
	     		$('.ui-loader').show();
	     	},
	     	complete: function(){
	     		$('.ui-loader').hide();
	     	}
	    });
	};
	
	$.bundlesBalance = function(options){
		 
		 var defauts=
			{
					"Doaction"	: "",
					"num"		:""
		     };
		 var params=$.extend(defauts, options);
		 
		$.ajax({  
			 type: 'POST',
			 url: server + "/" + $.lang + "/ezjscore/call/appmobile::bundlesBalance::" + params.num +"::" + params.Doaction +"::?ContentType=json", 
		     timeout : 30000,
		     dataType: 'json',  
		     success:  function (data) {
		    	 onSuccessBalance(data,params);
	          },
	          error: function () {
	        	  onErrorfunction();
	        	  $('.ui-loader').hide();
	          }, 
	          beforeSend: function(){
	        	  $('.ui-loader').show();
	          },
	          complete: function(){
	        	  $('.ui-loader').hide();
	          } 
		 });
		
		onSuccessBalance = function(data,params){
	
			var solde = data.content.Solde;
			
			$('.moncredit label').html(solde);
			setForfait(data.content.maxBundles,data.content.bundles); 
		}
		
		function setForfait(maxBundles,bundles){
			var forfait = ['.call.forfait', '.sms.forfait','.data.forfait'];
			
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
			var timeout = setTimeout(function(){
				setProress(maxVoice, voice, maxSms, sms, maxData, data);
				clearTimeout(timeout);
			}, 2000);
			
		}
		function setProress(maxVoice, voice, maxSms, sms, maxData, data){
			$('.summary .forfaits .forfait .progressBar').width($('.summary .forfaits .forfait .progressBar').width());
			//if( $('#call').length && $('#call').val() && $('#sms').length && $('#sms').val()  && $('#internet').val() && $('#internet').length)
			if( $('#call').length && $('#call').val())
			{ 
				myVodaProgress(maxVoice, voice, $('#callBar'));
				myVodaProgress(maxSms, sms, $('#smsBar'));
				myVodaProgress(maxData, data, $('#dataBar'));
					
			}
		}
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
		function myVodaProgress(max , forfait , element) {
			
			var ratio = element.width() / max; //console.log('width : ' + element.width());console.log('rasion : ' + ratio);
			var widthProgress = forfait * ratio;//console.log('widthProgress : ' + widthProgress);
			if(widthProgress < 0)
				widthProgress = 0;
			element.find('div').animate({ width: widthProgress }, 5000).html(forfait);

		}
		 return false;
	 };
	
})(jQuery);
