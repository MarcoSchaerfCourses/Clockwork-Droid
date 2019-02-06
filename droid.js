// Constructor
DroidApp = function()
{
	Sim.App.call(this);
}

// Subclass Sim.App
DroidApp.prototype = new Sim.App();

// Custom initializer
DroidApp.prototype.init = function(param)
{
	// Call superclass init code to set up scene, renderer, default camera
	Sim.App.prototype.init.call(this, param);

  // Create a directional light to show off the Droid
	var light = new THREE.DirectionalLight( 0xeeeeff, 1);
	light.position.set(0, 0, 1);
	this.scene.add(light);
  //Camera position
	this.camera.position.z = 8.667;
  this.camera.position.y = 2.667;
  this.camera.position.x = -6.667;


    // Create the Droid and add it to our sim
    var droid = new Droid();
    droid.init();
    this.addObject(droid);


    //Droid rotation
    this.root.rotation.y = 0.0;
    this.root.rotation.z = 0.0;
    this.root.rotation.x = 0.0;


    this.droid = droid;


    this.animating = false;
    this.droid.subscribe("complete", this, this.onAnimationComplete)
}



DroidApp.prototype.update = function()
{
  TWEEN.update();
	// this.root.rotation.y += 0.005;
	Sim.App.prototype.update.call(this);
}

DroidApp.prototype.handleMouseUp = function(x, y)
{
	this.animating = !this.animating;
	this.droid.animate(this.animating);
}

DroidApp.prototype.onAnimationComplete = function()
{
	this.animating = false;
}

DroidApp.animation_time = 1111;

// Droid class
Droid = function()
{
	Sim.Object.call(this);
}

Droid.prototype = new Sim.Object();

Droid.prototype.init = function()
{
  // Create a group to hold the droid
	var bodygroup = new THREE.Object3D;
  // Tell the framework about our object
  this.setObject3D(bodygroup);


	var that = this;
	// Droid model
	var url = 'droid/droid.dae';
	var loader = new Sim.ColladaLoader;
	loader.load(url, function (data) {
		that.handleLoaded(data)
	});
  //Texture
	var map = THREE.ImageUtils.loadTexture("shield.jpg");
		map.wrapS = map.wrapT = true;
		var material = new THREE.MeshBasicMaterial(
				{ color: 0x80aaaa, opacity: .3, transparent: true, map : map } );
  //Make droid shield in cylinder form
	var geometry = new THREE.CylinderGeometry(2.8, 2.8, 10);
		var mesh = new THREE.Mesh(geometry, material);

		bodygroup.add(mesh);

		this.texture = map;

}

Droid.prototype.handleLoaded = function(data)
{
	if (data)
	{
	    var model = data.scene;
	    // This model in cm, we're working in meters, scale down
	    model.scale.set(.01, .01, .01);

	    this.object3D.add(model);

	    // Walk through model looking for known named parts
	    var that = this;
	    THREE.SceneUtils.traverseHierarchy(model, function (n) { that.traverseCallback(n); });

	    this.createAnimation();
	}
}

Droid.prototype.traverseCallback = function(n)
{
	// Function to find the parts we need to animate.
	switch (n.name)
	{
		case 'jambe_G' :
			this.left_leg = n;
			break;
		case 'jambe_D' :
			this.right_leg = n;
			break;
		case 'bras_G' :
			this.left_arm = n;
			break;
		case 'bras_D' :
			this.right_arm = n;
			break;
		case 'av_bras_G' :
			this.left_arm2 = n;
			break;
		case 'av_bras_D' :
			this.right_arm2 = n;
			break;
		case 'doigt_G1' :
			this.left_finger = n;
			break;
		case 'doigt_D1' :
			this.right_finger = n;
			break;
		case 'doigt_G2' :
			this.left_finger2 = n;
			break;
		case 'doigt_D2' :
			this.right_finger2 = n;
			break;
		case 'head_container' :
			this.head = n;
			break;
		case 'joint_antenne' :
	 		this.antenna = n;
	 		break;
		case 'clef' :
			this.key = n;
			break;
		default :
			break;
	}
}

Droid.prototype.createAnimation = function()
{
	this.animator = new Sim.KeyFrameAnimator;
	this.animator.init({
		interps:
			[
			    { keys:Droid.bodyRotationKeys, values:Droid.bodyRotationValues, target:this.object3D.rotation },
			    { keys:Droid.headRotationKeys, values:Droid.headRotationValues, target:this.head.rotation },
			    { keys:Droid.keyRotationKeys, values:Droid.keyRotationValues, target:this.key.rotation },
			    { keys:Droid.leftLegRotationKeys, values:Droid.leftLegRotationValues, target:this.left_leg.rotation },
			    { keys:Droid.rightLegRotationKeys, values:Droid.rightLegRotationValues, target:this.right_leg.rotation },
					{ keys:Droid.leftArmRotationKeys, values:Droid.leftArmRotationValues, target:this.left_arm.rotation },
			    { keys:Droid.rightArmRotationKeys, values:Droid.rightArmRotationValues, target:this.right_arm.rotation },
					{ keys:Droid.leftArm2RotationKeys, values:Droid.leftArm2RotationValues, target:this.left_arm2.rotation },
					{ keys:Droid.rightArm2RotationKeys, values:Droid.rightArm2RotationValues, target:this.right_arm2.rotation },
					{ keys:Droid.leftFingerRotationKeys, values:Droid.leftFingerRotationValues, target:this.left_finger.rotation },
					{ keys:Droid.rightFingerRotationKeys, values:Droid.rightFingerRotationValues, target:this.right_finger.rotation },
					{ keys:Droid.leftFinger2RotationKeys, values:Droid.leftFinger2RotationValues, target:this.left_finger2.rotation },
					{ keys:Droid.rightFinger2RotationKeys, values:Droid.rightFinger2RotationValues, target:this.right_finger2.rotation },
			    { keys:Droid.antennaRotationKeys, values:Droid.antennaRotationValues, target:this.antenna.rotation },
					{ keys:[0, 1], values:[ { y: 1}, { y: 0}, ], target:this.texture.offset },
          // { keys:Droid.positionKeys, values:Droid.positionValues, target:this.object3D.position }
			],
		loop: true,
		duration:DroidApp.animation_time
	});

	this.animator.subscribe("complete", this, this.onAnimationComplete);

	this.addChild(this.animator);
}

Droid.prototype.animate = function(on)
{
	if (on)
	{
	  this.animator.start();
	var newpos;
  var turnback;

	if (this.object3D.position.x < 0)
	{
		newpos = this.object3D.position.x + 12.667;
    //rotate droid on walking direction
    turnback = this.object3D.rotation.y = 15.5;
	}
	else
	{
		newpos = this.object3D.position.x - 12.667;
    //rotate droid on walking direction
		turnback = this.object3D.rotation.y = -19;
	}

	this.tween = new TWEEN.Tween(this.object3D.position)
		  .to( {
		      x: newpos
		  }, 2000).start();

	}
	else
	{
		this.animator.stop();
		var newpos;
		if (this.object3D.position.x < 0)
		{
			newpos = this.object3D.position.x + 12.667;
			//rotate droid on walking direction
			newpos = this.object3D.rotation.y = 15.5;
		}
		else
		{
			newpos = this.object3D.position.x - 12.667;
			//rotate droid on walking direction
			newpos = this.object3D.rotation.y = -19;
		}

		this.tween.stop();

	}
}

Droid.prototype.onAnimationComplete = function()
{
	this.publish("complete");
}

Droid.headRotationKeys = [0, .9, .5, .9, 1];
Droid.headRotationValues = [ { y: 0 },
                                { y: -Math.PI / 3 },
                                { y: 0 },
                                { y: Math.PI / 3 },
                                { y: 0 },
                                ];
Droid.antennaRotationKeys = [0, .25, .5, .75, 1];
Droid.antennaRotationValues = [ { z: 0 },
																{ z: -Math.PI / 45 },
																{ z: 0 },
																{ z: Math.PI / 45 },
																{ z: 0 },
																];
Droid.bodyRotationKeys = [0, .25, .5, .75, 1];
Droid.bodyRotationValues = [ { x: 0 },
                                { x: -Math.PI / 48 },
                                { x: 0 },
                                { x: Math.PI / 48 },
                                { x: 0 },
                                ];

Droid.keyRotationKeys = [0, .25, .5, .75, 1];
Droid.keyRotationValues = [ { x: 0 },
                                { x: Math.PI / 4 },
                                { x: Math.PI / 2 },
                                { x: Math.PI * 3 / 4 },
                                { x: Math.PI },
                                ];

Droid.leftLegRotationKeys = [0, .25, .5, .75, 1];
Droid.leftLegRotationValues = [ { z: 0 },
                                { z: Math.PI / 6},
                                { z: 0 },
                                { z: 0 },
                                { z: 0 },
                                ];

Droid.rightLegRotationKeys = [0, .25, .5, .75, 1];
Droid.rightLegRotationValues = [ { z: 0 },
                                { z: 0 },
                                { z: 0 },
                                { z: Math.PI / 6},
                                { z: 0 },
                                ];
Droid.leftArmRotationKeys = [0, .25, .5, .75, 1];
Droid.leftArmRotationValues = [ { z: 0 },
																{ z: Math.PI / 6},
																{ z: 0 },
																{ z: 0 },
																{ z: 0 },
																];

Droid.rightArmRotationKeys = [0, .25, .5, .75, 1];
Droid.rightArmRotationValues = [ { z: 0 },
																{ z: 0 },
																{ z: 0 },
																{ z: Math.PI / 6},
																{ z: 0 },
																];

Droid.leftArm2RotationKeys = [0, .25, .5, .75, 1];
Droid.leftArm2RotationValues = [ { z: 0 },
																{ z: -Math.PI / 6},
																{ z: 0 },
																{ z: 0 },
																{ z: 0 },
																];
Droid.rightArm2RotationKeys = [0, .25, .5, .75, 1];
Droid.rightArm2RotationValues = [ { z: 0 },
																{ z: 0 },
																{ z: 0 },
																{ z: -Math.PI / 6},
																{ z: 0 },
																];

Droid.leftFingerRotationKeys = [0, .25, .5, .75, 1];
Droid.leftFingerRotationValues = [ { z: 0 },
																{ z: Math.PI / 6},
																{ z: 0 },
																{ z: 0 },
																{ z: 0 },
																];

Droid.rightFingerRotationKeys = [0, .25, .5, .75, 1];
Droid.rightFingerRotationValues = [ { z: 0 },
																{ z: 0 },
																{ z: 0 },
																{ z: Math.PI / 6},
																{ z: 0 },
																];
Droid.leftFinger2RotationKeys = [0, .25, .5, .75, 1];
Droid.leftFinger2RotationValues = [ { z: 0 },
																{ z: -Math.PI / 3},
																{ z: 0 },
																{ z: 0 },
																{ z: 0 },
																];

Droid.rightFinger2RotationKeys = [0, .25, .5, .75, 1];
Droid.rightFinger2RotationValues = [ { z: 0 },
																{ z: 0 },
																{ z: 0 },
																{ z: -Math.PI / 3},
																{ z: 0 },
																];
// Droid.positionKeys = [0, -.5, .5, 1];
// Droid.positionValues = [ { x : 9, y: 0, z : 0},
//                         { x: -9, y: 0, z: 0},
//                         { x: 2, y: 0, z: 0},
//                         { x : 2, y: 0, z : 0}
//                         ];

// Droid.bodyRotationKeys = [0, .25, .5, .75, 1];
// Droid.bodyRotationValues = [ { z: 0 },
//                                 { z: -Math.PI / 96 },
//                                 { z: 0 },
//                                 { z: Math.PI / 96 },
//                                 { z: 0 },
//                                 ];
