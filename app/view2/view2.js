'use strict';

angular.module('myApp.view2', ['ngRoute', 'ui.bootstrap'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/view2', {
            templateUrl: 'view2/view2.html',
            controller: 'View2Ctrl'
        });
    }])

    .controller('View2Ctrl', ['$scope', '$http', function($scope, $http) {
        $scope.arrlist = [{
            "userid": 1,
            "name": "Movies",
            "type": "choice",
            "referenceType": "movies"
        }, {
            "userid": 2,
            "name": "Countries",
            "type": "choice",
            "referenceType": "countries"
        }, {
            "userid": 3,
            "name": "orderName",
            "type": "text"
        }, {
            "userid": 4,
            "name": "productName",
            "type": "text"
        }, {
            "userid":5,
            "name": "startDate",
            "type": "date"
        }, {
            "userid":6,
            "name": "endDate",
            "type": "date"
        }];

        $scope.arrlist2 = [{
            "userid": 1,
            "name": "contains",
            "type": "text"
        }, {
            "userid": 2,
            "name": "equals",
            "type": "choice, text, date"
        }, {
            "userid": 3,
            "name": "starts with",
            "type": "text"
        }, {
            "userid": 4,
            "name": "ends with",
            "type": "text"
        }, {
            "userid": 5,
            "name": "greater than",
            "type": "date"
        }, {
            "userid": 6,
            "name": "less than",
            "type": "date"
        }, {
            "userid": 7,
            "name": "in between",
            "type": "date"
        }]

        $scope.onSubmit = function () {
            var urlStr = "http://localhost:8080/solrQueryParams";
            // prepare headers for posting
            var config = {
                headers : {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json, */*'
                }
            }
            // do posting
            $http.post(urlStr, $scope.tablerows, config).then(function (response) {
                $scope.responseData = "";
                if (response.data)
                    $scope.responseData = response.data;
            }, function error(response) {
                $scope.postResultMessage = "Error Status: " +  response.statusText;
            });
        }

        $scope.getSelectedReferenceData = function (val, referenceType) {
            if(referenceType === 'movies') {
                return this.getMovies(val);
            }
            if(referenceType === 'countries') {
                return this.getCountry(val);
            }
        }

        $scope.getCountry = function (val) {
            var urlStr = "https://restcountries.eu/rest/v2/name/" + val;
            var searchObj = [];
            return $http.get(urlStr).then(function (response) {
                for(var i of response.data) {
                    searchObj.push(i.name);
                }
                return searchObj;
            });
        };

        $scope.getMovies = function (val) {
            var urlStr = "http://www.omdbapi.com/?apikey=fe7d171a&s=" + val;
            return $http.get(urlStr).then(function (response) {
                var searchObj = [];
                for(var i of response.data.Search) {
                    var responseObj = {
                        title:"",
                        year:""
                    }
                    responseObj.title = i.Title;
                    responseObj.year = i.Year;
                    searchObj.push(responseObj);
                }
                return searchObj;
            });
            // var testArr = [];
            // for (var i=0; i<20000; i++) {
            //   testArr.push({Title: "title", Year: i});
            // }
            // return testArr;
        }

        $scope.referenceTypeAheadLabel = function(referenceObj, referenceType) {
            var label = ''
            if(referenceType === 'countries') {
                // if (referenceObj == null || referenceObj == undefined)
                //   return;
                //
                // if (referenceObj.name == '' || referenceObj.name == undefined) {
                //   return '';
                // }
                //label = referenceObj.name + " - " + referenceObj.capital;
                label = referenceObj;
            }
            if(referenceType === 'movies') {
                if (referenceObj == null || referenceObj == undefined)
                    return;

                if (referenceObj.title == '' || referenceObj.title == undefined) {
                    return '';
                }
                label = referenceObj.title + " - " + referenceObj.year;
            }
            return label;
        }

        $scope.tablerows = [{box1:$scope.arrlist[0], criteriaList:$scope.arrlist2[0]}]

        $scope.filterText = function(index) {
            return function(item) {
                var itemType = item.type.split(",");

                if($scope.tablerows[index].box1.type === "choice") {
                    $scope.tablerows[index].criteriaList = $scope.arrlist2[1];
                    return itemType.includes("choice");
                }
                if($scope.tablerows[index].box1.type === "text") {
                    return itemType.includes("text");
                }
                if($scope.tablerows[index].box1.type === "date") {
                    return itemType.includes("date");
                }
                else {
                    return item;
                }
            }
        }

        $scope.addRow = function() {
            $scope.tablerows.push({box1:$scope.arrlist[0], criteriaList:$scope.arrlist2[0]});
        }

        $scope.delete = function (val) {
            $scope.tablerows.splice(val,1);
        };

        $scope.open1 = function() {
            $scope.popup1.opened = true;
        };

        $scope.open2 = function() {
            $scope.popup2.opened = true;
        };

        $scope.dateOptions = {
            dateDisabled: disabled,
            formatYear: 'yy',
            maxDate: new Date(2022, 5, 22),
            minDate: new Date(),
            startingDay: 1
        };
        // Disable weekend selection
        function disabled(data) {
            var date = data.date,
                mode = data.mode;
            return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
        }

        $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
        $scope.format = $scope.formats[0];
        $scope.altInputFormats = ['M!/d!/yyyy'];

        $scope.popup1 = {
            opened: false
        };

        $scope.popup2 = {
            opened: false
        };

    }]);