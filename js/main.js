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
    //
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
  $scope.citiesShort = {'London':'LND', 'New York': 'NYC', 'Shanghai': 'SHA' }

  $scope.map = "London"
  $scope.density = "London"
  $scope.buildings = "London"
  $scope.parks = "London"
  $scope.streets = "London"

  $scope.iteration

  $scope.rotate = true;

  var controls;

  // check for screen size change so that the dom can be updated conditionally
  $scope.isMobile = testIsMobile()

  function testIsMobile() {
    var width = $(window).width()
    var isMobile;
    if (width < 992) {
      isMobile = true
    } else {
      isMobile = false
    }
    return isMobile
  };

  // maybe this gets combined with replace city?
  $scope.chooseCity = function(input, city) {

      if (input == "map") {
        scene.remove( scene.getObjectByName( 'land' ));
        scene.remove( scene.getObjectByName( 'water' ));
        scene.remove( scene.getObjectByName( 'border' ));
        scene.remove( scene.getObjectByName( 'bridges' ));
        objLoader( city + '_land', 'land',  0x9c9c9c);
        objLoader( city + '_water', 'water',  0xb7cfde);
        objLoader( city + '_border', 'border',  0x656565);
        objLoader( city + '_bridges', 'bridges',  0xffffff);
      }

      $scope[input] = city;

      // d3 management of data.csv
      d3.csv('../kpfcitybot/csv/data.csv', function(dataset) {
        if (dataset.map == $scope.cities[$scope.map] && dataset.density == $scope.cities[$scope.density] && dataset.buildings == $scope.cities[$scope.buildings] && dataset.parks == $scope.cities[$scope.parks] && dataset.streets == $scope.cities[$scope.streets]) {
          $scope.iteration = dataset.iteration
          replaceModel($scope.iteration, $scope.cities[$scope.map]);
        }
      });
  };

  $scope.rotateToggle = function() {
      if ( controls.autoRotate ) {
        $scope.rotate = false;
        controls.autoRotate = false;
      } else {
        $scope.rotate = true;
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

    var ambient = new THREE.AmbientLight( 0xe8ecff, 1.6 );
    ambient.name = "ambientLight"
    scene.add( ambient );

    var directionalLight1 = new THREE.DirectionalLight( 0xfff1f1, .3 );
    directionalLight1.name = "directionalLight1"
    directionalLight1.position.set( -1, 1, 1 );
    scene.add( directionalLight1 );

    var directionalLight2 = new THREE.DirectionalLight( 0xe6f2ff, .2);
    directionalLight2.name = "directionalLight2"
    directionalLight2.position.set( 1, 1, -1 );
    scene.add( directionalLight2 );

    objLoader('london_land', 'land',  0x9c9c9c);
    objLoader('london_water', 'water',  0xb7cfde);
    objLoader('london_border', 'border',  0x656565);
    objLoader('london_bridges', 'bridges',  0xffffff);
    objLoader('london_landmark1', 'landmark1',  0xffd2c0);
    objLoader('london_landmark2', 'landmark2',  0xffd2c0);
    objLoader('london_landmark3', 'landmark3',  0xffd2c0);
    objLoader('london_landmark4', 'landmark4',  0xffd2c0);
    objLoader('buildings_' + pad(0, 5), 'buildings',  0xffffff);
    objLoader('parks_' + pad(0, 5), 'parks',  0x74ac73);
    objLoader('curbs_' + pad(0, 5), 'curbs',  0xc7c7c7);

    console.log(scene)

    // set up renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( (window.innerWidth), window.innerHeight );
    scene.background = new THREE.Color( 0x1a2050 );

    container.appendChild( renderer.domElement );

    // set up camera and controls
    camera = new THREE.PerspectiveCamera( 45, (window.innerWidth) / window.innerHeight, 20, 15000 );
    camera.position.set( -1000, 1400, -1800 );

    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.target.set( 0, 0, 0 );
    controls.maxDistance = 4000;
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

    $scope.isMobile = testIsMobile()
    $scope.$apply()

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

    //UPDATE TWEEN
    TWEEN.update();
    controls.update();

    // console.log(camera.position)
  }

  function render() {

    // this is important for autoRotate and Dampening to work
    controls.update();

    renderer.render( scene, camera );

  }

  // add the leading zeros
  function pad(num, size ) {
    var s = "00000" + num;
    return s.substr(s.length-size);
  }

  // load the models
  function objLoader (path, name, color) {

    var material = new THREE.MeshStandardMaterial();
    material.color = new THREE.Color( color );
    material.roughness = 1.0;
    material.side = THREE.DoubleSide;

    // instantiate the loader
    var loader = new THREE.OBJLoader2();

    // function called on successful load
    var callbackOnLoad = function ( event ) {
      group = event.detail.loaderRootNode
      group.name = name;

      group.traverse(function(obj) {
        obj.material = material;
      });

      scene.add( event.detail.loaderRootNode );
    };

    // load a resource from provided URL synchronously
    loader.setPath( 'obj/' );
    loader.setLogging( false, false );
    loader.load( path + '.obj', callbackOnLoad, null, null, null, false );
  }

  function getCenterPoint(mesh) {
    var middle = new THREE.Vector3();
    var geometry = mesh.geometry;

    geometry.computeBoundingBox();

    middle.x = (geometry.boundingBox.max.x + geometry.boundingBox.min.x) / 2;
    middle.y = 0;
    middle.z = (geometry.boundingBox.max.z + geometry.boundingBox.min.z) / 2;

    mesh.localToWorld( middle );
    return middle;
    console.log(middle)
  }

  // // old obj loader
  // function objLoad (path) {
  //   // texture
  //   var manager = new THREE.LoadingManager();
  //   manager.onProgress = function ( item, loaded, total ) {

  //     console.log( item, loaded, total );

  //   };

  //   var texture = new THREE.Texture();

  //   var mtlLoader = new THREE.MTLLoader();
  //   mtlLoader.setPath( 'obj/' );
  //   mtlLoader.load( path + '.mtl', function( materials ) {
  //     materials.preload();
  //     var objLoader = new THREE.OBJLoader();
  //     objLoader.setMaterials( materials );
  //     objLoader.setPath( 'obj/' );
  //     objLoader.load( path + '.obj', function ( object ) {
  //       object.position.y = 0;
  //       scene.add( object );
  //     });
  //   });
  // };

  var replaceModel = function (iteration, map) {
    scene.remove( scene.getObjectByName( 'buildings' ));
    scene.remove( scene.getObjectByName( 'parks' ));
    scene.remove( scene.getObjectByName( 'curbs' ));
    objLoader('buildings_' + pad(iteration, 5), 'buildings',  0xffffff);
    objLoader('parks_' + pad(iteration, 5), 'parks',  0x74ac73);
    objLoader('curbs_' + pad(iteration, 5), 'curbs',  0xc7c7c7);
  }

  // Tweening the camera to a perspective view
  $scope.tweenCameraView = function (cameraX,cameraY,cameraZ,targetX,targetY,targetZ) {

    if (controls.autoRotate) {
      controls.autoRotate = false;
    }

    var tween = new TWEEN.Tween(camera.position).to({ x: cameraX, y: cameraY, z: cameraZ }, 1500);
    // tween.delay(10);
    tween.start();
          tween.easing(TWEEN.Easing.Exponential.InOut);

    var tween = new TWEEN.Tween(controls.target).to({ x: targetX, y: targetY, z: targetZ }, 1500);
    // tween.delay(10);
    tween.start();
          tween.easing(TWEEN.Easing.Exponential.InOut);
  }


  // add the data.gui so we can make manual adjustments to the scene
  function addGui () {

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

    var gui = new dat.GUI({ autoplace: false });

    // place the gui in a more useful location
    gui.domElement.id = 'my-gui-container';

    var params = {
      backgroundColor: '#' + scene.background.getHexString(),
      colorAmbLight: '#' + scene.getObjectByName( 'ambientLight' ).color.getHexString(),
      colorDirLight1: '#' + scene.getObjectByName( 'directionalLight1' ).color.getHexString(),
      colorDirLight2: '#' + scene.getObjectByName( 'directionalLight2' ).color.getHexString(),
    };

    var objParams = {
      land: '#' + scene.getObjectByName( 'land' ).children[0].material.color.getHexString(),
      water: '#' + scene.getObjectByName( 'water' ).children[0].material.color.getHexString(),
      border: '#' + scene.getObjectByName( 'border' ).children[0].material.color.getHexString(),
      bridges: '#' + scene.getObjectByName( 'bridges' ).children[0].material.color.getHexString(),
      buildings: '#' + scene.getObjectByName( 'buildings' ).children[0].material.color.getHexString(),
      parks: '#' + scene.getObjectByName( 'parks' ).children[0].material.color.getHexString(),
      curbs: '#' + scene.getObjectByName( 'curbs' ).children[0].material.color.getHexString(),
    }

    var lghtng = gui.addFolder('Lighting');
    lghtng.addColor( params, 'colorAmbLight' )
      .onChange( function() { scene.getObjectByName( 'ambientLight' ).color.set( params.colorAmbLight ); } );
    lghtng.add( scene.getObjectByName( 'ambientLight' ), 'intensity', 0, 3);
    lghtng.addColor( params, 'colorDirLight1' )
      .onChange( function() { scene.getObjectByName( 'directionalLight1' ).color.set( params.colorDirLight1 ); } );
    lghtng.add( scene.getObjectByName( 'directionalLight1' ), 'intensity', 0, 3);
    lghtng.addColor( params, 'colorDirLight2' )
      .onChange( function() { scene.getObjectByName( 'directionalLight2' ).color.set( params.colorDirLight2 ); } );
    lghtng.add( scene.getObjectByName( 'directionalLight2' ), 'intensity', 0, 3);
    lghtng.open();

    var scn = gui.addFolder('Scene');
    scn.addColor( params, 'backgroundColor' )
      .onChange( function() { scene.background.set( params.backgroundColor ); } );

    scn.addColor( objParams, 'land' )
      .onChange( function() { scene.getObjectByName( 'land' ).traverse( function(child) {
      if (child instanceof THREE.Mesh) {
        child.material.color.set( objParams.land )
      }})
    });

    scn.addColor( objParams, 'water' )
      .onChange( function() { scene.getObjectByName( 'water' ).traverse( function(child) {
      if (child instanceof THREE.Mesh) {
        child.material.color.set( objParams.water )
      }})
    });

    scn.addColor( objParams, 'border' )
      .onChange( function() { scene.getObjectByName( 'border' ).traverse( function(child) {
      if (child instanceof THREE.Mesh) {
        child.material.color.set( objParams.border )
      }})
    });

    scn.addColor( objParams, 'bridges' )
      .onChange( function() { scene.getObjectByName( 'bridges' ).traverse( function(child) {
      if (child instanceof THREE.Mesh) {
        child.material.color.set( objParams.bridges )
      }})
    });

    scn.addColor( objParams, 'buildings' )
      .onChange( function() { scene.getObjectByName( 'buildings' ).traverse( function(child) {
      if (child instanceof THREE.Mesh) {
        child.material.color.set( objParams.buildings )
      }})
    });

    scn.addColor( objParams, 'parks' )
      .onChange( function() { scene.getObjectByName( 'parks' ).traverse( function(child) {
      if (child instanceof THREE.Mesh) {
        child.material.color.set( objParams.parks )
      }})
    });

    scn.addColor( objParams, 'curbs' )
      .onChange( function() { scene.getObjectByName( 'curbs' ).traverse( function(child) {
      if (child instanceof THREE.Mesh) {
        child.material.color.set( objParams.curbs )
      }})
    });

    scn.open();

    var cntrls = gui.addFolder('Controls');
    cntrls.add(controls, 'autoRotate');
    cntrls.add(controls, 'autoRotateSpeed', 0, 10);
    cntrls.add(controls, 'enableDamping');
    cntrls.add(controls, 'dampingFactor', 0, 1);
    cntrls.open();

    gui.add(options, 'stop');
    gui.add(options, 'reset');

  };

  document.addEventListener('keyup', function (event) {
    if (event.defaultPrevented) {
        return;
    }

    var key = event.key || event.keyCode;

    if (key === 'Escape' || key === 'Esc' || key === 27) {
        addGui();
    }
  });

});
