import { Component, OnInit, ViewChild, ElementRef, HostListener, Host } from '@angular/core';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { CrowboxdbService } from 'src/app/services/crowbox/crowboxdb.service';
import { PublicService } from 'src/app/services/public/public.service';
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

@Component({
  selector: 'app-worldview',
  templateUrl: './worldview.component.html',
  styleUrls: ['./worldview.component.css']
})
export class WorldviewComponent implements OnInit {
  
  countries$?:Observable<any>;

  @ViewChild('globeCanvas') cReference!: ElementRef;

  countryName! : string | null;

  displayType! : string;
  
  top! : string;
  left! : string;

  renderer = new THREE.WebGLRenderer;
  scene! : THREE.Scene;
  camera! : THREE.PerspectiveCamera;
  controls! : OrbitControls;
  globe! : THREE.Mesh;
  mainLight! : THREE.Light;

  windowWidth! : number;
  windowHeight! : number;

  listOfCountries: any[] = [];
  
  raycaster!: THREE.Raycaster;
  mouse! : THREE.Vector2;

    
  private get aspectRatio(): number {
    return this.windowWidth / this.windowHeight;
  }

  private get canvas(): HTMLCanvasElement {
    return this.cReference.nativeElement;
  }



  constructor(private countryService: PublicService) { 

    
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, this.windowWidth/this.windowHeight, 0.1, 1000);

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.countryName = null;
    this.displayType = "none";

    this.top = "0px";
    this.left = "0px";

  }

  ngOnInit(): void {

    this.countries$ = this.countryService.getAllCountryData()
    .snapshotChanges()
    .pipe(
      map(value => 
        value.map(v => (
          {key: v.payload.key, ...v.payload.val()}
        )))
    );

    this.countries$.pipe(first())
    .subscribe(result => {
      console.log(result);
      this.listOfCountries = result;
      console.log(this.listOfCountries);
      this.initGlobe();
    });

  
    this.countries$
    .subscribe(result => {
      this.listOfCountries = result;
      this.initPoints();
    });

  }

  initPoints(){
    //this.setScene();
    this.setAllPoints();
  }

  initGlobe() {
    this.setCamera();
    this.setCamera();
    this.setRenderer();
    this.setControls();

    this.createLightGroup();
    this.createGlobe();

    this.animate();
  }

  setScene(){
    const loader = new THREE.TextureLoader();
    //image from: https://line.17qq.com/articles/thrtescx.html
    const texture = loader.load(
      '../../assets/images/spaceEqui.png', 
      () => {
        const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
        rt.fromEquirectangularTexture(this.renderer, texture);
        this.scene.background = rt.texture;
      }); 
  }

  
  setCamera() {
    this.camera.aspect = this.aspectRatio;
    this.camera.updateProjectionMatrix();
	  this.camera.position.set( 35, 0, 0 ); 
	  this.camera.lookAt( this.scene.position );
  }

  setRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true
    });

    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.windowWidth, this.windowHeight);
  }

  setControls() {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.autoRotate = false;
    this.controls.enableZoom = true;
    this.controls.enablePan = false;
    this.controls.minDistance = 12;
    this.controls.maxDistance = 60;
    this.controls.update();
  }

  
  createLightGroup() {
    this.mainLight = new THREE.AmbientLight( 0xffffff);
	  this.mainLight.position.set( 0, 0, 50 );
    this.scene.add(this.mainLight);
  }

  
  createGlobe() {
    //maps from: https://www.solarsystemscope.com/textures/
    let Emap = new THREE.TextureLoader().load('../../assets/images/2k_earth_daymap.jpg');
  
    const sphere = new THREE.SphereGeometry(10,50,50);
    const material = new THREE.MeshPhongMaterial({
        map : Emap});

    this.globe = new THREE.Mesh(sphere, material);
    this.scene.add(this.globe);

    this.createCountryNames();
  }

  createCountryNames() {
    let Cmap = new THREE.TextureLoader().load('../../assets/images/WorldMap.png');
    const sphere = new THREE.SphereGeometry(10.2,50,50);
    const material = new THREE.MeshPhongMaterial({
        map : Cmap,
        transparent: true,
        opacity : 1});

    let countryNames = new THREE.Mesh(sphere, material);

    this.scene.add(countryNames);
  }

  
  render () {
    this.renderer.render(this.scene, this.camera);
  }
  
  animate() {
    window.requestAnimationFrame(() => this.animate());

    this.mainLight.quaternion.copy(this.camera.quaternion);
    this.render();
    this.controls.update();
  }

  addCoordinatePoint (country:string, latitude: number, longitude: number, coins_deposited:number, crows_landed_on_perch:number) {

    //radius of the globe
    const radius = 10;

    //convert degrees to radians
    let globeLatRads = latitude * (Math.PI / 180);
    let globeLongRads = -longitude * (Math.PI / 180);

    console.log("GlobeLatRads = " + globeLatRads);
    console.log("Coins deposited = " + coins_deposited);

    //get x, y and z coordinates
    let x = Math.cos(globeLatRads) * Math.cos(globeLongRads) * radius;
    let y = Math.cos(globeLatRads) * Math.sin(globeLongRads) * radius;
    let z = Math.sin(globeLatRads) * radius;

    
    //credit: https://stackoverflow.com/questions/51800598/threejs-make-meshes-perpendicular-to-the-sphere-face-its-sitting-on
    //for cylinder barchart
    
    let height = coins_deposited/18;
    let poi2 = new THREE.CylinderGeometry(0.1,0.1,height,64);
    poi2.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI/2));

    let poi2Material = new THREE.MeshBasicMaterial();

    let point2 = new THREE.Mesh(poi2, poi2Material);
    point2.position.set( x, z, y);
    point2.lookAt(0,0,0);
    point2.userData.Country = country;
    point2.userData.LiteracyRate = coins_deposited;

    point2.material.color.set(0xFF2C05);

    this.globe.add(point2); 

/*     let pointOfInterest = new THREE.SphereGeometry(.1, 32, 32);
    
    let material = new THREE.MeshBasicMaterial({color:"#ff0000"});

    let mesh = new THREE.Mesh(
      pointOfInterest,
      material
    );

  
    mesh.position.set(x,z,y); 

    mesh.rotation.set(0.0, -globeLongRads, globeLatRads-Math.PI*0.5);

    this.globe.add(mesh); */
}

setAllPoints() {

  //remove all children if any and add new ones
/*   while(this.globe.children.length) {
    this.globe.remove(this.globe.children[0]);
  } */

  for (let i = 0; i < this.listOfCountries.length; i++) {

    console.log(this.listOfCountries[i].key, this.listOfCountries[i].latitude, this.listOfCountries[i].longitude, this.listOfCountries[i].coins_deposited);


    this.addCoordinatePoint(this.listOfCountries[i].key, this.listOfCountries[i].latitude, this.listOfCountries[i].longitude, this.listOfCountries[i].coins_deposited, this.listOfCountries[i].crows_landed_on_perch);       
  }
}


@HostListener('click',['$event'])
onMouseClick(event : any) {
  event.preventDefault();

  this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  this.raycaster.setFromCamera(this.mouse, this.camera);

  const intersects = this.raycaster.intersectObjects(this.globe.children);

  if (intersects.length == 0) {
    this.displayType = "none";
    this.countryName = null;
  }

  for (let i = 0; i < intersects.length; i++) {
    console.log(intersects[0]);

    //show the textbox
    this.displayType = "flex";
    //position the textbox
    this.top = (event.clientY - 100) + 'px';
    this.left = (event.clientX + 20) + 'px';

    //@ts-ignore
    intersects[ 0 ].object.material.color.set( 0x52307c );
    this.countryName = intersects[0].object.userData.Country;
  }
}


  
  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;
    this.camera.aspect = this.aspectRatio;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.windowWidth, this.windowHeight);
  }


}
