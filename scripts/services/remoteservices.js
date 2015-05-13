angular.module("realrig",[]).
  factory("remoteservice",function($http){
    var remoteAPI = {};
    var context = "http://80.227.132.18:7777/realrig";
    var service = "/ShowMsg";
    remoteAPI.getDrivers = function (username,password){
      return $http({
        method:"XML",
        url:context+service +
      });
    }

    return remoteAPI;
  });
