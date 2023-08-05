import { Component, OnInit } from '@angular/core';
import { MenuController, ModalController, ToastController } from '@ionic/angular';
import { Cliente } from 'src/app/models';
import { FirebaseauthService } from '../../services/firebaseauth.service';
import { FirestoreService } from '../../services/firestore.service';
import { FirestorageService } from '../../services/firestorage.service';
import { Subscription } from 'rxjs';
import { GooglemapsComponent } from '../../googlemaps/googlemaps.component';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
})
export class PerfilComponent implements OnInit {

  cliente: Cliente = {
    uid: '',
    email: '',
    celular: '',
    foto: '',
    referencia: '',
    nombre: '',
    ubicacion: null,
  };

  newFile: any;

  uid = '';

  suscriberUserInfo: Subscription;

  ingresarEnable = false;

  constructor(
    public menucontroler: MenuController,
    public firebaseauthService: FirebaseauthService,
    public firestoreService: FirestoreService,
    public firestorageService: FirestorageService,
    private modalController: ModalController,
    private toastController: ToastController // Agregamos el servicio ToastController
  ) {
    this.firebaseauthService.stateAuth().subscribe(res => {
      if (res !== null) {
        this.uid = res.uid;
        this.getUserInfo(this.uid);
      } else {
        this.initCliente();
      }
    });
  }

  async ngOnInit() {
    const uid = await this.firebaseauthService.getUid();
    console.log(uid);
  }

  initCliente() {
    this.uid = '';
    this.cliente = {
      uid: '',
      email: '',
      celular: '',
      foto: '',
      referencia: '',
      nombre: '',
      ubicacion: null,
    };
    console.log(this.cliente);
  }

  openMenu() {
    console.log('open menu');
    this.menucontroler.toggle('principal');
  }

  async newImageUpload(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.newFile = event.target.files[0];
      const reader = new FileReader();
      reader.onload = ((image) => {
        this.cliente.foto = image.target.result as string;
      });
      reader.readAsDataURL(event.target.files[0]);
    }
  }

  async registrarse() {
    const credenciales = {
      email: this.cliente.email,
      password: this.cliente.celular,
    };
    const res = await this.firebaseauthService.registrar(credenciales.email, credenciales.password).catch(err => {
      console.log('error -> ', err);
      this.showToast('Error al registrar usuario'); // Mostrar mensaje de error al registrar usuario
    });
    const uid = await this.firebaseauthService.getUid();
    this.cliente.uid = uid;
    this.guardarUser();
  }

  async guardarUser() {
    const path = 'Clientes';
    const name = this.cliente.nombre;
    if (this.newFile !== undefined) {
      const res = await this.firestorageService.uploadImage(this.newFile, path, name);
      this.cliente.foto = res;
    }
    this.firestoreService.createDoc(this.cliente, path, this.cliente.uid).then(res => {
      console.log('guardado con éxito');
      this.showToast('Usuario registrado con éxito'); // Mostrar mensaje de éxito al registrar usuario
    }).catch(error => {
      console.log('error -> ', error);
      this.showToast('Error al guardar usuario'); // Mostrar mensaje de error al guardar usuario
    });
  }

  async salir() {
    this.firebaseauthService.logout();
    this.suscriberUserInfo.unsubscribe();
    this.showToast('Cierre de sesión exitoso'); // Mostrar mensaje de éxito al cerrar sesión
  }

  getUserInfo(uid: string) {
    console.log('getUserInfo');
    const path = 'Clientes';
    this.suscriberUserInfo = this.firestoreService.getDoc<Cliente>(path, uid).subscribe(res => {
      if (res !== undefined) {
        this.cliente = res;
      }
    });
  }

  async ingresar() {
    const credenciales = {
      email: this.cliente.email,
      password: this.cliente.celular,
    };
  
    try {
      await this.firebaseauthService.login(credenciales.email, credenciales.password);
      this.showToast('Ingreso exitoso'); // Mostrar mensaje de éxito en pantalla
    } catch (error) {
      console.log('Error al ingresar:', error);
      this.showToast('Error al ingresar'); // Mostrar mensaje de error en pantalla
    }
  }
  
  // Método para mostrar el toast
 
  

  async addDirection() {
    // ...
  }

  // Método para mostrar el toast
  async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });

    toast.present();
  }

}
