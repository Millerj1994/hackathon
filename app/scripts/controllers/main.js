'use strict';

/**
 * @ngdoc function
 * @name danimalsApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the danimalsApp
 */
angular.module('danimalsApp')
  .controller('MainCtrl', function ($http, $mdDialog) {
  	var danimalsS3 = 'https://s3-us-west-2.amazonaws.com/danimals.io/';
  	var danimalsDataJSON = 'SyngentaPositions.json';
    var danimalsSpecialJSON = 'specialNews.json';
  	this.selectedPosition = null;
  	var self = this;
    $http.get(danimalsS3 + danimalsDataJSON).then(function(data){
    	var positions = data.data;
    	self.positions = positions.map(function(position){
    		Object.keys(position).forEach(function(key){
    			position[
    				key.toLowerCase()
    					.replace(' ', '')
    					.replace(' ', '')
    					.replace(' ', '')
    					.replace('/', '')
    			] = position[key];
    			delete position[key]
    		});
    		return position;
    	}).map(function(position){
    		position.keys = Object.keys(position);
    		return position;
    	})
    });

    var specialMessage = null;
    setInterval(function(){ 
      $http.get(
        danimalsS3 + danimalsSpecialJSON
      ).then(
        function(data){
          var message = data.data;
          if (!specialMessage){
            specialMessage = message;
          }
          console.log(message.fact, specialMessage.fact)
          if (message.fact!==specialMessage.fact){
            $mdDialog.show(
              $mdDialog.alert()
                .clickOutsideToClose(true)
                .title('Here\'s what i found!')
                .textContent(message.fact)
                .ariaLabel('Alert Dialog Demo')
                .ok('Got it!')
            );
          };
          console.log(data);
          specialMessage = message;
        }
      );}, 3000);
});
