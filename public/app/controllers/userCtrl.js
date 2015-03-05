/**
* userCtrl Module
*
* user controller module
*/
angular.module('userCtrl', ['userService'])

  // user controller for the main page
  // inject the user factory
  .controller('userController', function(User){

    var vm = this;

    // set a processing variable to show loading things
    vm.processing = true;

    // grab all the users at page load
    User.all()
     .success(function(data) {

        // when all the users come back, remove the processing variable
        vm.processing = false;

        // bind the users that come back to vm.users
        vm.users = data;
     });

    vm.deleteUser = function(id) {
      vm.processing = true;

      // accepts the user id as a parameter
      User.delete(id)
        .success(function(data) {

          // get all users to update the table with api return
          vm.processing = false;
          vm.users = data.users;
        })
    }

  })

  // Controller applied to user creation page
  .controller('userCreateController', function(User) {
    var vm = this;

    // variable to hide/show elements of the views
    // deffenriates between create of edit pages
    vm.type = 'create';

    // function to create a user
    vm.saveUser = function() {
      vm.processing = true;

      // clear the message
      vm.message = "";

      // use the create function in the userService
      User.create(vm.userData)
        .success(function(data) {
          vm.processing = false;

          // clear the form
          vm.userData = {};
          vm.message = data.message;
        });
    };

  })

  .controller('userEditController', function($routeParams, User) {
    var vm = this;

    vm.type = "edit";

    User.get($routeParams.user_id)
      .success(function(data) {
        vm.userData = data;
      });

    vm.saveUser = function() {
      vm.processing = true;
      vm.message = "";

      User.update($routeParams.user_id, vm.userData)
        .success(function(data) {
          vm.processing = false;
          vm.userData = {};
          vm.message = data.message;
        });
    };

  });