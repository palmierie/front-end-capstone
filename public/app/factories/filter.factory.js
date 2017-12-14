(function(){
	"use strict";

	var filterFactory = function(){
			return {
			search: ""
		};
	};
	
	angular.module("SongSearchApp").factory("filterFactory", filterFactory);
	
})();