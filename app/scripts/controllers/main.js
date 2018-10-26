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
    var danimalsOrientationJSON = 'orientation.json';
  	this.selectedPosition = null;
  	var self = this;
    this.savedFacts = [];
    this.showAlert = function(ev) {
      // Appending dialog to document.body to cover sidenav in docs app
      // Modal dialogs should fully cover application
      // to prevent interaction outside of dialog
      $mdDialog.show(
        $mdDialog.alert()
          .clickOutsideToClose(true)
          .title('Saved Facts')
          .textContent(this.savedFacts.join('\n\n\n'))
          .ok('Got it!')
      );
    };
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

    function DialogController($scope, $mdDialog, fact) {
      $scope.fact = fact;
      $scope.hide = function() {
        $mdDialog.hide();
      };

      $scope.cancel = function() {
        $mdDialog.cancel();
      };

      $scope.answer = function(answer) {
        $mdDialog.hide({status:answer, fact:fact});
      };
    }

    setInterval(function(){ 
      $http.get(
        danimalsS3 + danimalsSpecialJSON
      ).then(
        function(data){
          var message = data.data;
          if (!specialMessage){
            specialMessage = message;
          }
          //console.log(message.fact, specialMessage.fact)
          if (message.fact!==specialMessage.fact){
            $mdDialog.show({
              controller: DialogController,
              locals: {fact: message.fact},
              templateUrl: '/views/dialog.html',
              clickOutsideToClose:false
            }).then(function(answer) {
                  if(answer.status){
                    self.savedFacts.push(answer.fact)
                  } else {
                    self.selectedIndex = self.selectedIndex + 5;
                  }
                }, function() {
                  $scope.status = 'You cancelled the dialog.';
                });
            /*var confirm = $mdDialog.alert()
              .title('Here\'s what i found!')
              .textContent(message.fact)
              .ok('Read More.')
            $mdDialog.show(
              confirm
            );*/
          };
          specialMessage = message;
        }
      );}, 2000);

    setInterval(function(){ 
      $http.get(
        danimalsS3 + danimalsOrientationJSON
      ).then(
        function(data){
          if(data.data.position === 'right'){
            self.selectedIndex = self.selectedIndex + 1;
          } else if (data.data.position === 'left' && self.selectedIndex!==0){
            self.selectedIndex = self.selectedIndex - 1;
          } 
        }
      );}, 500);
});
