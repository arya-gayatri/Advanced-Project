import React, { Component } from 'react';
import * as THREE from 'three';
import ReactDOM from 'react-dom';




export class AnimatedSphere extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.renderer =new THREE.WebGLRenderer();
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    //  document.body.appendChild( renderer.domElement );
    this.scene = new THREE.Scene();
    this.camera =  new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);


    // construct the position vector here, because if we use 'new' within render,
    // React will think that things have changed when they have not.

    this.state = {
      sphereRotation: new THREE.Euler(),
      phiStart: 0,
      phiLength:0,
      thetaStart: 0,
      thetaLength: 0,
      wireframe:true,
      color: 0x035096,
    };
    this.state.geometry = new THREE.SphereGeometry(5,19,13,this.state.phiStart,this.state.phiLength,this.state.thetaStart,this.state.thetaLength);
    this.edgesGeometry = new THREE.EdgesGeometry(this.state.geometry);
    this.LINE = new THREE.LineSegments(this.edgesGeometry, new THREE.LineBasicMaterial({color: 0xffffff}));

    this.state.material = new THREE.MeshDepthMaterial( { color: 0x00ff00 } );
    this.sphere = new THREE.Mesh(this.state.geometry,this.state.material );

}
    _onAnimate = () => {
      // we will get this callback every frame
      // pretend cubeRotation is immutable.
      // this helps with updates and pure rendering.
      // React will be sure that the rotation has now updated.
      this.setState({wireframe:false})
      this.setState({sphereRotation: new THREE.Euler(this.state.sphereRotation.x,this.state.sphereRotation.y),
      phiStart: this.state.phiStart+.01, phiLength: this.state.phiLength+.01, thetaStart: this.state.thetaStart + .01, thetaLength:this.state.thetaLength+.01,
      color: this.state.color+100+10+1,
      })
    }


    animate = () => {
      requestAnimationFrame(this.animate);
      this._onAnimate();
      this.renderer.render(this.scene,this.camera);
    }



  render() {
    const canwidth = window.innerWidth; // canvas width
    const canheight = window.innerHeight; // canvas height
    this.scene.add(this.sphere);
    this.animate();
    return (
      <canvas style={{width:canwidth, height:canheight}}/>   );
  }
}
