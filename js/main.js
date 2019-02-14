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
  var landmarks = {
    'London': [
      {
        'name':'landmark1',
        'center': [275,0,648],
        'rotation': 153,
        'visible': true
      },
      {
        'name':'landmark2',
        'center': [617,0,-335],
        'rotation': 177,
        'visible': true
      },
      {
        'name':'landmark3',
        'center': [670,0,-478],
        'rotation': 23,
        'visible': true
      },
      {
        'name':'landmark4',
        'center': [-583,0,-367],
        'rotation': 7,
        'visible': true
      }
    ],
    'New York': [
      {
        'name':'landmark1',
        'center': [-282,0,378],
        'rotation': 150,
        'visible': false
      },
      {
        'name':'landmark2',
        'center': [315,0,-122],
        'rotation': 151,
        'visible': false
      },
      {
        'name':'landmark3',
        'center': [-195,0,-413],
        'rotation': 152,
        'visible': false
      },
      {
        'name':'landmark4',
        'center': [11,0,-139],
        'rotation': -119,
        'visible': false
      },
    ],
    'Shanghai': [
      {
        'name':'landmark1',
        'center': [275,0,-648],
        'rotation': 153,
        'visible': false
      },
      {
        'name':'landmark2',
        'center': [617,0,335],
        'rotation': 177,
        'visible': false
      },
      {
        'name':'landmark3',
        'center': [670,0,478],
        'rotation': 23,
        'visible': false
      },
      {
        'name':'landmark4',
        'center': [-583,0,367],
        'rotation': 7,
        'visible': false
      }
    ]
  };

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

      // change the map underlay if map is changed
      if (input == "map") {
        if (scene.getObjectByName( $scope.map + '_land' )) {
          scene.getObjectByName( $scope.map + '_land' ).visible = false;
        }
        if (scene.getObjectByName( $scope.map + '_water' )) {
          scene.getObjectByName( $scope.map + '_water' ).visible = false;
        }
        if (scene.getObjectByName( $scope.map + '_border' )) {
          scene.getObjectByName( $scope.map + '_border' ).visible = false;
        }
        if (scene.getObjectByName( $scope.map + '_bridges' )) {
          scene.getObjectByName( $scope.map + '_bridges' ).visible = false;
        }

        if (scene.getObjectByName( city + '_land' )) {
          scene.getObjectByName( city + '_land' ).visible = true;
        }
        if (scene.getObjectByName( city + '_water' )) {
          scene.getObjectByName( city + '_water' ).visible = true;
        }
        if (scene.getObjectByName( city + '_border' )) {
          scene.getObjectByName( city + '_border' ).visible = true;
        }
        if (scene.getObjectByName( city + '_bridges' )) {
          scene.getObjectByName( city + '_bridges' ).visible = true;
        }

        // loop through landmarks and update their location and rotation
        for (i=0; i<4; i++) {
          scene.getObjectByName($scope.buildings + '_landmark' + String(i+1)).rotation.y = THREE.Math.degToRad(landmarks[city][i].rotation)
          px = landmarks[city][i].center[0]
          py = landmarks[city][i].center[1]
          pz = landmarks[city][i].center[2]
          scene.getObjectByName($scope.buildings + '_landmark' + String(i+1)).position.set(px, py, pz)
        }
      }

      // if buildings are updated change the landmarks
      if (input == "buildings") {
        console.log('update buildings')

        // loop through landmarks and update their location and rotation
        for (i=0; i<4; i++) {
          scene.getObjectByName(city + '_landmark' + String(i+1)).rotation.y = THREE.Math.degToRad(landmarks[$scope.map][i].rotation)
          px = landmarks[$scope.map][i].center[0]
          py = landmarks[$scope.map][i].center[1]
          pz = landmarks[$scope.map][i].center[2]
          scene.getObjectByName(city + '_landmark' + String(i+1)).position.set(px, py, pz)
        }

        // import all landmarks and place in correct location
        for (i=0; i<landmarks[$scope[input]].length; i++) {
          scene.getObjectByName($scope[input] + '_landmark' + String(i+1)).visible = false
        }
        for (i=0; i<landmarks[city].length; i++) {
          scene.getObjectByName(city + '_landmark' + String(i+1)).visible = true
        }
      }

      $scope[input] = city;

      // d3 management of data.csv
      d3.csv('../csv/data.csv', function(dataset) {
        if (dataset.map == $scope.cities[$scope.map] && dataset.density == $scope.cities[$scope.density] && dataset.buildings == $scope.cities[$scope.buildings] && dataset.parks == $scope.cities[$scope.parks] && dataset.streets == $scope.cities[$scope.streets]) {
          $scope.iteration = dataset.iteration
          replaceModel($scope.iteration, $scope.map);
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

    var ambient = new THREE.AmbientLight( 0xe8ecff, 1.4 );
    ambient.name = "ambientLight"
    scene.add( ambient );

    var directionalLight1 = new THREE.DirectionalLight( 0xfff1f1, .7);
    directionalLight1.name = "directionalLight1"
    directionalLight1.position.set( -1000, 400, 1000 );
    directionalLight1.castShadow = true;
    scene.add( directionalLight1 );

    directionalLight1.shadowCameraRight =  1000;
    directionalLight1.shadowCameraLeft = -1000;
    directionalLight1.shadowCameraTop =  1000;
    directionalLight1.shadowCameraBottom = -1000;
    directionalLight1.shadow.camera.near = 600;
    directionalLight1.shadow.camera.far = 3000;
    directionalLight1.shadowDarkness = 0.5;
    // directionalLight1.shadow.camera.fov = 2000;

    var shadowCameraHelper = new THREE.CameraHelper(directionalLight1.shadow.camera);
    shadowCameraHelper.visible = false;
    shadowCameraHelper.name = "directionalLight1Helper"
    scene.add( shadowCameraHelper );

    var directionalLight2 = new THREE.DirectionalLight( 0x87c0ff, .2);
    directionalLight2.name = "directionalLight2"
    directionalLight2.position.set( 1, 1, -1 );
    scene.add( directionalLight2 );

    // var geometry = new THREE.BoxGeometry( 100, 100, 100 );
    // var material = new THREE.MeshStandardMaterial();
    // material.color = new THREE.Color( 0x00ff00 );
    // material.roughness = 0
    // var cube = new THREE.Mesh( geometry, material );
    // cube.castShadow = true;
    // cube.receiveShadow = true;
    // scene.add( cube );
    // console.log(cube)

    // load London map and make visible
    objLoader('london_land', 'London_land',  0x9c9c9c, 1, [0,0,0], 0, true, false, true);
    objLoader('london_water', 'London_water',  0xb7cfde, 0.7, [0,0,0], 0, true, false, true);
    objLoader('london_border', 'London_border',  0x656565, 1, [0,0,0], 0, true, false, false);
    objLoader('london_bridges', 'London_bridges',  0xffffff, 1, [0,0,0], 0, true, true, true);

    // load New York map
    objLoader('new york_land', 'New York_land',  0x9c9c9c, 1, [0,0,0], 0, false, false, true);
    objLoader('new york_border', 'New York_border',  0x656565, 1, [0,0,0], 0, false, false, false);

    // load Shanghai Map
    objLoader('shanghai_land', 'Shanghai_land',  0x9c9c9c, 1, [0,0,0], 0, false, false, true);
    objLoader('shanghai_water', 'Shanghai_water',  0xb7cfde, 0.7, [0,0,0], 0, false, false, true);
    objLoader('shanghai_border', 'Shanghai_border',  0x656565, 1, [0,0,0], 0, false, false, false);

    // load first set of geometry
    objLoader('buildings_' + pad(0, 5), 'buildings',  0xffffff, 1, [0,0,0], 0, true, true, true);
    objLoader('parks_' + pad(0, 5), 'parks',  0x74ac73, 1, [0,0,0], 0, true, false, true);
    objLoader('curbs_' + pad(0, 5), 'curbs',  0xc7c7c7, 1, [0,0,0], 0, true, false, true);

    // testing git update
    // import all landmarks and place in correct location
    for (var city in landmarks) {
      for (i=0; i<landmarks[city].length; i++) {
        px = landmarks.London[i].center[0]
        py = landmarks.London[i].center[1]
        pz = landmarks.London[i].center[2]
        angle = THREE.Math.degToRad(landmarks.London[i].rotation)
        visibility = landmarks[city][i].visible
        // visibility = true
        console.log(city.toLowerCase() + '_landmark' + String(i+1))
        objLoader(city.toLowerCase() + '_landmark' + String(i+1), city + '_landmark' + String(i+1),  0xffd2c0, 1, [px,py,pz], angle, visibility, true, true);
      }
    }

    console.log(scene)

    // set up renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( (window.innerWidth), window.innerHeight );
    renderer.shadowMapEnabled = true;
    renderer.shadowMapType = THREE.PCFSoftShadowMap;
    scene.background = new THREE.Color( 0x1a2050 );
    scene.fog = new THREE.Fog( 0x1a2050, 10000, 10000);

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

  // load OBJ models. there must be only a single mesh per obj
  function objLoader (path, name, color, roughness, position, rotation, visibility, castShadow, receiveShadow) {

    var material = new THREE.MeshStandardMaterial();
    material.color = new THREE.Color( color );
    material.roughness = roughness;
    // material.side = THREE.DoubleSide;

    // instantiate the loader
    var loader = new THREE.OBJLoader2();

    // function called on successful load
    var callbackOnLoad = function ( event ) {
      mesh = event.detail.loaderRootNode.children[0]
      mesh.name = name;
      mesh.material = material;
      mesh.visible = visibility;
      mesh.rotation.y = rotation
      mesh.position.set(position[0],position[1],position[2])
      mesh.castShadow = castShadow
      mesh.receiveShadow = receiveShadow

      scene.add( mesh );
    };

    // load a resource from provided URL synchronously
    loader.setPath( 'obj/' );
    loader.setLogging( false, false );
    loader.load( path + '.obj', callbackOnLoad, null, null, null, false );
  }

  // function placeLandmarks('landmark1','landmark2','landmark3','landmark4') {
  //
  // }

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
    // remove city
    scene.remove( scene.getObjectByName( 'buildings' ));
    scene.remove( scene.getObjectByName( 'parks' ));
    scene.remove( scene.getObjectByName( 'curbs' ));

    // add new city
    objLoader('buildings_' + pad(iteration, 5), 'buildings',  0xffffff, 1, [0,0,0], 0, true, true, true);
    objLoader('parks_' + pad(iteration, 5), 'parks', 0x74ac73, 1, [0,0,0], 0, true, true, true);
    objLoader('curbs_' + pad(iteration, 5), 'curbs', 0xc7c7c7, 1, [0,0,0], 0, true, true, true);

    // loop through landmarks and update their location and rotation
    for (i=1; i<5; i++) {
      scene.getObjectByName($scope.buildings + '_landmark' + String(i)).scale.set(1,1,1)
    }
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
      colorFog: '#' + scene.fog.color.getHexString(),
    };

    var objParams = {
      land: '#' + scene.getObjectByName( 'London_land' ).material.color.getHexString(),
      water: '#' + scene.getObjectByName( 'London_water' ).material.color.getHexString(),
      border: '#' + scene.getObjectByName( 'London_border' ).material.color.getHexString(),
      bridges: '#' + scene.getObjectByName( 'London_bridges' ).material.color.getHexString(),
      buildings: '#' + scene.getObjectByName( 'buildings' ).material.color.getHexString(),
      parks: '#' + scene.getObjectByName( 'parks' ).material.color.getHexString(),
      curbs: '#' + scene.getObjectByName( 'curbs' ).material.color.getHexString(),
    }

    var lghtng = gui.addFolder('Lighting');
    lghtng.addColor( params, 'colorAmbLight' )
      .onChange( function() { scene.getObjectByName( 'ambientLight' ).color.set( params.colorAmbLight ); } );
    lghtng.add( scene.getObjectByName( 'ambientLight' ), 'intensity', 0, 3);
    lghtng.addColor( params, 'colorDirLight1' )
      .onChange( function() { scene.getObjectByName( 'directionalLight1' ).color.set( params.colorDirLight1 ); } );
    lghtng.add( scene.getObjectByName( 'directionalLight1' ), 'intensity', 0, 3);
    lghtng.add( scene.getObjectByName( 'directionalLight1' ).position, 'x', -2000, 2000);
    lghtng.add( scene.getObjectByName( 'directionalLight1' ).position, 'y', 0, 2000);
    lghtng.add( scene.getObjectByName( 'directionalLight1' ).position, 'z', -2000, 2000);
    lghtng.add( scene.getObjectByName( 'directionalLight1Helper' ), 'visible');
    lghtng.addColor( params, 'colorDirLight2' )
      .onChange( function() { scene.getObjectByName( 'directionalLight2' ).color.set( params.colorDirLight2 ); } );
    lghtng.add( scene.getObjectByName( 'directionalLight2' ), 'intensity', 0, 3);
    lghtng.addColor( params, 'colorFog' )
      .onChange( function() { scene.fog.color.set( params.colorFog ); } );
    lghtng.add( scene.fog, 'near', -10000, 10000);
    lghtng.add( scene.fog, 'far', -10000, 10000);
    lghtng.open();

    var scn = gui.addFolder('Scene');
    scn.addColor( params, 'backgroundColor' )
      .onChange( function() { scene.background.set( params.backgroundColor ); } );

    scn.addColor( objParams, 'land' )
      .onChange( function() { scene.getObjectByName( 'London_land' ).traverse( function(child) {
      if (child instanceof THREE.Mesh) {
        child.material.color.set( objParams.land )
      }})
    });

    scn.addColor( objParams, 'water' )
      .onChange( function() { scene.getObjectByName( 'London_water' ).traverse( function(child) {
      if (child instanceof THREE.Mesh) {
        child.material.color.set( objParams.water )
      }})
    });

    scn.addColor( objParams, 'border' )
      .onChange( function() { scene.getObjectByName( 'London_border' ).traverse( function(child) {
      if (child instanceof THREE.Mesh) {
        child.material.color.set( objParams.border )
      }})
    });

    scn.addColor( objParams, 'bridges' )
      .onChange( function() { scene.getObjectByName( 'London_bridges' ).traverse( function(child) {
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
