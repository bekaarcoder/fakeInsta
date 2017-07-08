const {remote} = require('electron');

angular.module('instaApp', ['ngRoute'])

.config(function($routeProvider) {
	$routeProvider.when('/', {
		templateUrl: `${__dirname}/home/home.html`,
		controller: 'HomeCtrl'
	}).when('/edit', {
		templateUrl: `${__dirname}/edit/edit.html`,
		controller: 'EditCtrl'
	}).otherwise({
		templateUrl: '404'
	});
})

.controller('HomeCtrl', ['$scope', '$location', 'imgPath', function($scope, $location, imgPath){

	$scope.openFile = function() {
		const {dialog} = remote;

		dialog.showOpenDialog({
			properties: ['openFile'],
			filters: [{
				name: 'Images',
				extensions: ['jpg', 'png', 'jpeg']
			}]
		}, function(file) {
			if(file) {
				console.log(file);
				var filePath = file[0];
				imgPath.setImagePath(filePath);
				var sizeOf = require('image-size'); //getting image dimensions
				var dimensions = sizeOf(filePath);
				imgPath.setImageDimension(dimensions);
				$location.path('/edit');
				$scope.$apply();
			}
		});
	};
	
}])

.controller('HeadCtrl', ['$scope', function($scope){

	var win = remote.getCurrentWindow();

	$scope.close = function(){
		win.close();
	};

	$scope.minimize = function(){
		win.minimize();
	};

	$scope.maximize = function(){
		win.isMaximized() ? win.unmaximize() : win.maximize();
	};

}])

.controller('EditCtrl', ['$scope', 'imgPath', '$location', function($scope, imgPath, $location){

	$scope.imageSrc = imgPath.getImagePath();

	var mainImg = document.getElementById("mainImg");

	$scope.effects = {
		'Brightness': {val: 100, min:0, max:200, delim:'%'},
		'Contrast': {val: 100, min:0, max:200, delim:'%'},
		'Invert': {val: 0, min:0, max:100, delim:'%'},
		'Hue-rotate': {val: 0, min:0, max:360, delim:'deg'},
		'Sepia': {val: 0, min:0, max:100, delim:'%'},
		'Grayscale': {val: 0, min:0, max:100, delim:'%'},
		'Saturate': {val: 100, min:0, max:200, delim:'%'},
		'Blur': {val: 0, min:0, max:5, delim:'px'},
	}

	$scope.setEffect = function() {
		// console.log($scope.effects);

		var generatedStyle = "";
		for(let i in $scope.effects) {
			generatedStyle += `${i}(${$scope.effects[i].val + $scope.effects[i].delim}) `;
		}
		console.log(generatedStyle);
		mainImg.style.filter = generatedStyle;
	}

	$scope.changeImg = function() {
		$location.path('/');
		$scope.$apply();
	}

	$scope.save = function() {
		var fileName = Date.now();
		console.log(fileName);
		var dimensions = imgPath.getImageDimension(); 
		let styles = mainImg.style.filter;
		const {BrowserWindow} = remote;
		let win = new BrowserWindow({
			frame: false,
			show: false,
			width: dimensions.width,
			height: dimensions.height,
			webPreferences: {
				webSecurity: false
			}
		});

		win.loadURL(`data:text/html,
			<style>*{margin:0;padding:0;}</style><img src="${$scope.imageSrc}" style="filter: ${styles}">
			<script>
				var screenshot = require('electron-screenshot');
				screenshot({
					filename: "${fileName}.png",
					delay: 1000
				});
			</script>
			`);
	}
	
}])

.service('imgPath', function(){
	var imagePath = "";
	var imgDimensions = [];

	this.setImagePath = function(path) {
		imagePath = path;
	};
	this.getImagePath = function() {
		return imagePath;
	};

	this.setImageDimension = function(dimension) {
		imgDimensions = dimension;
	};
	this.getImageDimension = function() {
		return imgDimensions;
	}
})