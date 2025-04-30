import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-rest',
  templateUrl: './rest.component.html',
  styleUrls: ['./rest.component.css']
})

export class RestComponent {
  url: string = "https://192.168.83.31/";
  http = inject(HttpClient);
  contacts$ = this.getContacts();
  selectedUserId: string | null = null;

  contactsForm = new FormGroup({
    name: new FormControl<string>(''),
    surname1: new FormControl<string>(''),
    surname2: new FormControl<string>(''),
    bday: new FormControl<Date | string>(''),
    phoneNumber: new FormControl<string>(''),
    email: new FormControl<string>(''),
    pass: new FormControl<string>(''),
    pass2: new FormControl<string>(''),
    image: new FormControl<string | null>(null)
  });

  onFormSubmit() {
    const userData = {
      Name: this.contactsForm.value.name,
      Surname1: this.contactsForm.value.surname1,
      Surname2: this.contactsForm.value.surname2,
      Bday: this.contactsForm.value.bday,
      PhoneNumber: this.contactsForm.value.phoneNumber,
      Email: this.contactsForm.value.email,
      Password: this.contactsForm.value.pass,
      Password2: this.contactsForm.value.pass2,
      ProfileImageFile: this.contactsForm.value.image
    };
    console.log(userData);

    if (this.selectedUserId) {
      // Actualizar usuario existente
      this.http.put(`${this.url}api/Account/Update/${this.selectedUserId}`, userData, { responseType: 'text' })
        .subscribe({
          next: (value) => {
            console.log('User updated successfully', value);
            alert('Usuario actualizado con éxito');
            this.contacts$ = this.getContacts(); // Refresca la lista de contactos
            this.contactsForm.reset(); // Resetea el formulario
            this.selectedUserId = null; // Limpia el ID seleccionado
          },
          error: (error) => {
            console.error('Error updating user', error);
            alert('Error al actualizar el usuario');
          }
        });
    } else {
      // Crear nuevo usuario
      this.http.post(this.url + 'api/Account/Register', userData, { responseType: 'text' })
        .subscribe({
          next: (value) => {
            console.log('User added successfully', value);
            this.contacts$ = this.getContacts(); // Refresca la lista de contactos
            this.contactsForm.reset(); // Resetea el formulario
          },
          error: (error) => {
            console.error('Error adding user', error);
            alert('Error al agregar el usuario');
          }
        });
    }
  }

  onDelete(id: string) {
    const confirmDelete = confirm('¿Estás seguro de que deseas eliminar este usuario?');
    if (confirmDelete) {
      this.http.delete(`${this.url}api/Account/Delete/${id}`, { responseType: 'text' })
      .subscribe({
        next: (value) => {
          console.log('User deleted successfully', value);
          alert('User deleted successfully');
          this.contacts$ = this.getContacts(); // Refresh the contacts list after deletion.
        },
        error: (error) => {
          console.error('Error deleting user', error);
          alert('Error deleting user');
        }
      });
    }
  }

  onUpdate(id: string) {
    // Busca los datos del usuario seleccionado
    this.http.get<any>(`${this.url}api/Account/GetUser/${id}`)
      .subscribe({
        next: (user) => {
          console.log('User data loaded for update', user);
          this.selectedUserId = id; // Guarda el ID del usuario seleccionado
          // Rellena el formulario con los datos del usuario
          this.contactsForm.patchValue({
            name: user.name,
            surname1: user.surname1,
            surname2: user.surname2,
            bday: user.bday,
            phoneNumber: user.phoneNumber,
            email: user.email,
            pass: '', // No se debe rellenar la contraseña por seguridad
            pass2: '',
            image: null // Maneja la imagen según sea necesario
          });
        },
        error: (error) => {
          console.error('Error loading user data', error);
          alert('Error al cargar los datos del usuario');
        }
      });
  }

  //   private getContacts(): Observable<Contact[]> {
  //     return this.http.get<Contact[]>('https://localhost:7035/api/Account/Users');
  // }
  private getContacts(): Observable<any> {
    return this.http.get(this.url + 'api/Account/Users');
  }
}