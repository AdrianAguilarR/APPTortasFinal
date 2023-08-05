import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';
import { Producto, Pedido, Cliente, ProductoPedido } from '../models';
import { FirebaseauthService } from './firebaseauth.service';
import { FirestoreService } from './firestore.service';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private pedido: Pedido;
  pedido$ = new Subject<Pedido>();
  path = 'carrito/';
  uid = '';
  cliente: Cliente;

  carritoSuscriber: Subscription;
  clienteSuscriber: Subscription;

  constructor(
    public firebaseauthService: FirebaseauthService,
    public firestoreService: FirestoreService,
    public router: Router,
    private toastController: ToastController
  ) {
    this.initCarrito();
    this.firebaseauthService.stateAuth().subscribe(res => {
      if (res !== null) {
        this.uid = res.uid;
        this.loadCLiente();
      }
    });
  }

  loadCarrito() {
    const path = 'Clientes/' + this.uid + '/' + 'carrito';
    if (this.carritoSuscriber) {
      this.carritoSuscriber.unsubscribe();
    }
    this.carritoSuscriber = this.firestoreService.getDoc<Pedido>(path, this.uid).subscribe(res => {
      if (res) {
        this.pedido = res;
        this.pedido$.next(this.pedido);
      } else {
        this.initCarrito();
      }
    });
  }

  initCarrito() {
    this.pedido = {
      id: this.uid,
      cliente: this.cliente,
      productos: [],
      precioTotal: null,
      estado: 'enviado',
      fecha: new Date(),
      valoracion: null,
    };
    this.pedido$.next(this.pedido);
  }

  loadCLiente() {
    const path = 'Clientes';
    this.clienteSuscriber = this.firestoreService.getDoc<Cliente>(path, this.uid).subscribe(res => {
      this.cliente = res;
      this.loadCarrito();
      this.clienteSuscriber.unsubscribe();
    });
  }

  getCarrito(): Observable<Pedido> {
    setTimeout(() => {
      this.pedido$.next(this.pedido);
    }, 100);
    return this.pedido$.asObservable();
  }

  addProducto(producto: Producto) {
    console.log('addProducto ->', this.uid);
    if (this.uid.length) {
      const item = this.pedido.productos.find(productoPedido => {
        return productoPedido.producto.id === producto.id;
      });
      if (item !== undefined) {
        item.cantidad++;
      } else {
        const add: ProductoPedido = {
          cantidad: 1,
          producto,
        };
        this.pedido.productos.push(add);
      }
      console.log('Pedido actualizado:', this.pedido);

      // Mostrar mensaje emergente "Agregado al carrito" utilizando ToastController
      this.showToast('Agregado al carrito');
    } else {
      this.router.navigate(['/perfil']);
      return;
    }
    this.pedido$.next(this.pedido);
    console.log('en add pedido -> ', this.pedido);
    const path = 'Clientes/' + this.uid + '/' + this.path;
    this.firestoreService.createDoc(this.pedido, path, this.uid).then(() => {
      console.log('añadido con éxito');
    });
  }

  removeProducto(producto: Producto) {
    console.log('removeProducto ->', this.uid);
    if (this.uid.length) {
      let position = 0;
      const item = this.pedido.productos.find((productoPedido, index) => {
        position = index;
        return productoPedido.producto.id === producto.id;
      });
      if (item !== undefined) {
        item.cantidad--;
        if (item.cantidad === 0) {
          this.pedido.productos.splice(position, 1);
        }
        console.log('en remove pedido -> ', this.pedido);
        const path = 'Clientes/' + this.uid + '/' + this.path;
        this.firestoreService.createDoc(this.pedido, path, this.uid).then(() => {
          console.log('removido con éxito');

          // Mostrar mensaje emergente "Producto eliminado del carrito" utilizando ToastController
          this.showToast('Producto eliminado del carrito');
        });
      }
    }
  }

  realizarPedido() {
    // Implementa la lógica para realizar el pedido aquí
  }

  clearCarrito() {
    const path = 'Clientes/' + this.uid + '/' + 'carrito';
    this.firestoreService.deleteDoc(path, this.uid).then(() => {
      this.initCarrito();
    });
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
