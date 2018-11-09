/**
 * AngularJS Tutorial 1
 * @author Nick Kaye <nick.c.kaye@gmail.com>
 */

/**
 * Main AngularJS Web Application
 */
var app = angular.module('tutorialWebApp', [
  'ngRoute'
]);

/**
 * Configure the Routes
 */
app.config(['$routeProvider', function ($routeProvider) {
  $routeProvider
    // Home
    .when("/", {templateUrl: "partials/home.html", controller: "PageCtrl"})
    // Pages
    .when("/about", {templateUrl: "partials/about.html", controller: "PageCtrl"})
    // else 404
    .otherwise("/404", {templateUrl: "partials/404.html", controller: "PageCtrl"});
}]);

/**
 * Controls all other Pages
 */
app.controller('PageCtrl', function ($scope) {
  console.log("Page Controller reporting for duty.");

  $scope.cities = {'London':0,'New York':1,'Shanghai':2}

  $scope.map = "choose a map"
  $scope.density = "choose a density"
  $scope.buildings = "choose buildings"
  $scope.streets = "choose street widths"
  $scope.parks = "choose parks"

  $scope.imageList = []

  var controls;

  $scope.images = ["axon_00001","plan_00001","skyline_00001"]

  $scope.chooseCity = function(input, city) {

      if ($scope[input].includes("choose")) {
        $scope.map = city;
        $scope.density = city;
        $scope.buildings = city;
        $scope.streets = city;
        $scope.parks = city;
      } else {
        $scope[input] = city;
      }

  };

  $scope.rotateToggle = function() {
      if ( controls.autoRotate ) {
        controls.autoRotate = false;
      } else {
        controls.autoRotate = true;
      }
  }

  // Activates Tooltips for Social Links
  $('.tooltip-social').tooltip({
    selector: "a[data-toggle=tooltip]"
  })

  // threejs 
  if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

  var container, stats, controls;
  var camera, scene, renderer;
  var clock = new THREE.Clock();
  var mixers = [];
  var plane;

  init();

  function init() {

    container = document.getElementById( 'scene-viewer' );
    document.body.appendChild( container );

    // scene
    scene = new THREE.Scene();

    var ambient = new THREE.AmbientLight( 0xffc3ff, .9 );
    scene.add( ambient );

    var directionalLight = new THREE.DirectionalLight( 0xfff1f1, .1 );
    directionalLight.position.set( -1, 1, 1 );
    scene.add( directionalLight );

    var directionalLight2 = new THREE.DirectionalLight( 0xe6f2ff, .2);
    directionalLight2.position.set( 1, 1, -1 );
    scene.add( directionalLight2 );

    // texture
    var manager = new THREE.LoadingManager();
    manager.onProgress = function ( item, loaded, total ) {

      console.log( item, loaded, total );

    };

    var texture = new THREE.Texture();

    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath( 'obj/' );
    mtlLoader.load( 'Shanghai.mtl', function( materials ) {
      materials.preload();
      var objLoader = new THREE.OBJLoader();
      objLoader.setMaterials( materials );
      objLoader.setPath( 'obj/' );
      objLoader.load( 'Shanghai.obj', function ( object ) {
        object.position.y = 0;
        scene.add( object );
      });
    });

    // set up renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( (window.innerWidth), window.innerHeight );
    scene.background = new THREE.Color( 0xaa6caa );

    container.appendChild( renderer.domElement );

    // set up camera and controls
    camera = new THREE.PerspectiveCamera( 45, (window.innerWidth) / window.innerHeight, 20, 15000 );
    camera.position.set( 2500, 2500, -2500 );
    
    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.target.set( 0, 0, 0 );
    controls.maxDistance = 3000;
    controls.autoRotate = true;
    controls.autoRotateSpeed = .1;
    controls.enableDamping = true;
    controls.dampingFactor = 0.4;
    controls.update();

    window.addEventListener( 'resize', onWindowResize, false );

      // scene.fog = new THREE.FogExp2( 0xffffff, 0.00015 );

    animate();

  }

  function onWindowResize() {

    camera.aspect = (window.innerWidth) / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( (window.innerWidth), window.innerHeight );

  }

  //

  function animate() {

    requestAnimationFrame( animate );

    if ( mixers.length > 0 ) {

      for ( var i = 0; i < mixers.length; i ++ ) {

        mixers[ i ].update( clock.getDelta() );

      }

    }

    render();

  }

  function render() {

    // this is important for autoRotate and Dampening to work
    controls.update();

    renderer.render( scene, camera );
    
  }

  // Options to be added to the GUI

  var options = {
    stop: function() {
    },
    reset: function() {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.1;
      controls.enableDamping = true;
      controls.dampingFactor = 0.4;
    }
  };

  var gui = new dat.GUI();

  var params = {
    color: 0xff00ff,
    colorLight: 0xff00ff
  };

  var lghtng = gui.addFolder('Lighting');
  lghtng.addColor( params, 'colorLight' )
      .onChange( function() { scene.children[0].color.set( params.colorLight ); } );
  lghtng.open();

  var scn = gui.addFolder('Scene');
  scn.addColor( params, 'color' )
      .onChange( function() { scene.background.set( params.color ); } );
  scn.open();

  var cntrls = gui.addFolder('Controls');
  cntrls.add(controls, 'autoRotate');
  cntrls.add(controls, 'autoRotateSpeed', 0, 10);
  cntrls.add(controls, 'enableDamping');
  cntrls.add(controls, 'dampingFactor', 0, 1);
  cntrls.open();

  gui.add(options, 'stop');
  gui.add(options, 'reset');

});

