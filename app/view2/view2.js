"use strict";

angular
  .module("myApp.view2", ["ngRoute", "ui.bootstrap"])

  .config([
    "$routeProvider",
    function ($routeProvider) {
      $routeProvider.when("/view2", {
        templateUrl: "view2/view2.html",
        controller: "View2Ctrl",
      });
    },
  ])

  .controller("View2Ctrl", [
    "$scope",
    "$http",
    function ($scope, $http) {
      var options = {};
      options.text = {
        type: "text",
        options: [
          { name: "Starts With", type: "starts-with" },
          { name: "Ends With", type: "ends-with" },
          { name: "Contains", type: "contains" },
          { name: "Equals", type: "equals" },
        ],
      };

      options.date = {
        type: "date",
        options: [
          { name: "Greater Than", type: "greater-than" },
          { name: "Less Than", type: "less-than" },
          { name: "In Between", type: "between" },
        ],
      };

      options.choice = {
        type: "choice",
        options: [{ name: "Equals", type: "equals" }],
      };

      $scope.fieldOptions = [
        {
          fieldId: 1,
          name: "Movies",
          field: "movies",
          type: options.choice,
        },
        {
          fieldId: 2,
          name: "Countries",
          field: "countries",
          type: options.choice,
        },
        {
          fieldId: 3,
          name: "orderName",
          field: "orderName",
          type: options.text,
        },
        {
          fieldId: 4,
          name: "productName",
          field: "productName",
          type: options.text,
        },
        {
          fieldId: 5,
          name: "startDate",
          field: "startDate",
          type: options.date,
        },
        {
          fieldId: 6,
          name: "endDate",
          field: "endDate",
          type: options.date,
        },
      ];

      $scope.tokens = ["and", "or"];
      $scope.token = $scope.tokens[0];

      $scope.onSubmit = function () {
        var urlStr = "http://localhost:8080/solrQueryParams";
        // prepare headers for posting
        var config = {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json, */*",
          },
        };
        // do posting
        console.log($scope.tablerows);
        $http.post(urlStr, $scope.tablerows, config).then(
          function (response) {
            $scope.responseData = "";
            if (response.data) $scope.responseData = response.data;
          },
          function error(response) {
            $scope.postResultMessage = "Error Status: " + response.statusText;
          }
        );
      };

      $scope.newSubmit = function () {
        var url = "http://localhost:8080/criteria";

        var query = $scope.prepareQuery();
        console.log("Sending: ", query);
        $http.post(url, query).then(
          function (response) {
            $scope.responseData = "";
            if (response.data) $scope.responseData = response.data;
          },
          function () {
            alert("Error");
          }
        );
      };

      $scope.prepareQuery = function () {
        var obj = {
          type: "combination",
          token: $scope.token,
          expressions: [],
        };

        for (var row of $scope.tablerows) {
          obj.expressions.push({
            type: row.field.type.type,
            field: row.field.field,
            search: row.searchOption.type,
            min: row.data.min,
            max: row.data.max,
            text: row.data.text,
            choice: row.data.choice,
          });
        }

        return obj;
      };

      $scope.getSelectedReferenceData = function (val, referenceType) {
        if (referenceType === "movies") {
          return this.getMovies(val);
        }
        if (referenceType === "countries") {
          return this.getCountry(val);
        }
      };

      $scope.getCountry = function (val) {
        var urlStr = "https://restcountries.eu/rest/v2/name/" + val;
        var searchObj = [];
        return $http.get(urlStr).then(function (response) {
          for (var i of response.data) {
            searchObj.push(i.name);
          }
          return searchObj;
        });
      };

      $scope.getMovies = function (val) {
        var urlStr = "http://www.omdbapi.com/?apikey=fe7d171a&s=" + val;
        return $http.get(urlStr).then(function (response) {
          var searchObj = [];
          for (var i of response.data.Search) {
            var responseObj = {
              title: "",
              year: "",
            };
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
      };

      $scope.referenceTypeAheadLabel = function (referenceObj, referenceType) {
        var label = "";
        if (referenceType === "countries") {
          // if (referenceObj == null || referenceObj == undefined)
          //   return;
          //
          // if (referenceObj.name == '' || referenceObj.name == undefined) {
          //   return '';
          // }
          //label = referenceObj.name + " - " + referenceObj.capital;
          label = referenceObj;
        }
        if (referenceType === "movies") {
          if (referenceObj == null || referenceObj == undefined) return;

          if (referenceObj.title == "" || referenceObj.title == undefined) {
            return "";
          }
          label = referenceObj.title + " - " + referenceObj.year;
        }
        return label;
      };

      $scope.tablerows = [
        {
          field: $scope.fieldOptions[0],
        },
      ];

      $scope.filterText = function (index) {
        return function (item) {
          var itemType = item.type;

          if ($scope.tablerows[index].box1.type === "choice") {
            $scope.tablerows[index].criteriaList = $scope.searchOptions[1];
            return itemType.includes("choice");
          }
          if ($scope.tablerows[index].box1.type === "text") {
            return itemType.includes("text");
          }
          if ($scope.tablerows[index].box1.type === "date") {
            return itemType.includes("date");
          } else {
            return item;
          }
        };
      };

      $scope.addRow = function () {
        $scope.tablerows.push({
          field: $scope.fieldOptions[0],
        });
      };

      $scope.delete = function (val) {
        $scope.tablerows.splice(val, 1);
      };

      $scope.openPopupMin = function (i) {
        $scope.popupMax.opened = null;
        $scope.popupMin.opened = i;
      };

      $scope.openPopupMax = function (i) {
        $scope.popupMin.opened = null;
        $scope.popupMax.opened = i;
      };

      $scope.dateOptions = {
        dateDisabled: disabled,
        formatYear: "yy",
        maxDate: new Date(2022, 5, 22),
        minDate: new Date(),
        startingDay: 1,
      };
      // Disable weekend selection
      function disabled(data) {
        var date = data.date,
          mode = data.mode;
        return mode === "day" && (date.getDay() === 0 || date.getDay() === 6);
      }

      $scope.formats = [
        "dd-MMMM-yyyy",
        "yyyy/MM/dd",
        "dd.MM.yyyy",
        "shortDate",
      ];
      $scope.format = $scope.formats[0];
      $scope.altInputFormats = ["M!/d!/yyyy"];

      /**
       * is the minimum date field visible
       * _if_ it is not, then data.min is set to null for that row
       * @param row the row of the min/max field
       * @param selectedOption the selected option for the field (e.g. less-than, greater-than, etc)
       */
      $scope.isMinVisible = (row, selectedOption) => {
        if (["greater-than", "between"].includes(selectedOption.type)) {
          return true;
        } else {
          row.data.min = null;
          return false;
        }
      };

      /**
       * is the maximum date field visible
       * _if_ it is not, then data.max is set to null for that row
       * @param row the row of the min/max field
       * @param selectedOption the selected option for the field (e.g. less-than, greater-than, etc)
       */
      $scope.isMaxVisible = (row, selectedOption) => {
        if (["less-than", "between"].includes(selectedOption.type)) {
          return true;
        } else {
          row.data.max = null;
          return false;
        }
      };

      const popup = (name) => ({
        name: name,
        opened: null,
        isOpened: function (i) {
          var self = this;
          return {
            get isOpened() {
              return self.opened === i;
            },
            set isOpened(_val) {
              self.opened = null;
            },
          };
        },
      });

      $scope.popupMin = popup("min");

      $scope.popupMax = popup("max");
    },
  ]);

