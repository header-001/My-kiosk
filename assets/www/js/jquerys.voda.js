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
	
	$.myModaLoad = function(options){
		var defauts = {
			"url"		: "",
			"doaction"	: "",
			"resendPin"	:false,
			"datas"		:""
		};
		
		var url = server + "/" + MyVoda.currentLang + "/ezjscore/call/appmobile::login::" + options.doaction +"::?ContentType=json";
		var params = $.extend(defauts, options);

		console.log(url);
		//Lance la requete server
		ajaxQuery(url,params);
		return false;
	};
	
	$.bundlesBalance = function(options){
		var defauts={
			"Doaction"	: "",
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
			"contentType":"json",
	     };
		
		var parametres=$.extend(defauts, options);
		
		var url =  server + "/" + MyVoda.currentLang + "/ezjscore/call/vodashop::fetchProductItems::" + 
					parametres.limit + "::" + parametres.offset + "::" + parametres.sort + "::" + 
					parametres.order + "::?ContentType=" + parametres.contentType + "&image_alias=line_offre";
		
		console.log(url);
		
		//fetch from server
		queryCatalog(url,parametres);
		
		
	};
	
	/*
	 *  Constitution et execution de la réquete
	 */
	ajaxQuery = function(url,params){
		$.ajax({  
			 type: 'POST',
			 url: url, 
			 data: params.datas,
		     timeout : 30000,
		     dataType: 'json',  
		     success:  function(result){
		    	 onSuccessFunction(result,params);
		     },
		     error: function(){
		    	 onSuccessFunction(params);
		     },
		     beforeSend: function(){
	        	  $('.ui-loader').show();
		     },
		     complete: function(){
		    	 onCompleteFunction(params);
		     }
		 });
	};

	queryCatalog = function(url,parametres){
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
	
	onSuccessFunction= function(result,params){
		
		switch(params.doaction){
		 
		 	case "SetSession":
		 		if(result.content.error || result.error){
	 				var err = result.content.msg;
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
			 			$.mobile.changePage( params.url + "&n=" + result.content.num + "&s=" + result.content.session , {}); 
		 		} 
		 	break;
		 	
		 	case "FetchInfo":
		 		__setDataContent(result.content);
		 	break;
		 	
		 	case "GetBal" :
		 		__onSuccessBalance(result,params)
		 	break;
		 	
		 	case "Logout":
		 		if(data.content.result || result.error){
		        	$('.ui-loader').hide();
		        	$.showAlert(result.content.msg);
		        	vibrate();
		 		}else{
		 			$('.ui-loader').hide();
		        	$.showAlert($.msg.Notification[$.lang].Deconnexion);
		 			$.mobile.changePage( params.Url , {});
		 		}
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
	};
	
	onErrorFunction = function(params){
  	  $.vibrate();
	  $('.ui-loader').hide();
	};
	
	onCompleteFunction= function(params){
  	  if(params.Doaction !="FetchInfo")
		  $('.ui-loader').hide();
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
      	  	$('.ui-loader').hide();
		 }else{
			$(".info .num").html(datas.n);
			$(".info .nom").html(datas.compte.prenom + " " + datas.compte.nom);
			$(".info .email").html(datas.compte.email);
			//$(".info .profil").html(datas.compte.type_profil);
			 
		 }
	}
	__onSuccessBalance = function(data,params){
		
		var solde = data.content.Solde;
		
		$('.moncredit label').html(solde);
		setForfait(data.content.maxBundles,data.content.bundles); 
	};
	
	setForfait = function(maxBundles,bundles){
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
	
})(window.jQuery);