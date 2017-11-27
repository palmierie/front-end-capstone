(function(){
	"use strict";

	var filterFactory = function(){
			return {
			search: ""
		};
	};
	
	// $inject

	angular.module("SongSearchApp").factory("filterFactory", filterFactory);
	
})();