import { Component, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'Astralis';
  // url: string = "https://localhost:7035/";
  url: string = "https://88.25.64.124/";
  http = inject(HttpClient);
  contacts$ = this.getContacts();
  selectedUserId: string | null = null;

  loginFrom = new FormGroup({
    email: new FormControl<string>(''),
    pass: new FormControl<string>('')
  });

  onLoginFormSubmit() {
    const loginData = {
      Email: this.loginFrom.value.email,
      Password: this.loginFrom.value.pass
    };
    console.log(loginData);
    this.http.post(this.url + 'api/Account/Login', loginData, { responseType: 'text' })
      .subscribe({
        next: (value) => {
          console.log('Login successful', value);
          alert('Login successful');
        },
        error: (error) => {
          console.error('Login error', error);
          alert('Login error');
        }
      });
  }
  onLogout() {
    this.http.post(this.url + 'api/Account/Logout', {}, { responseType: 'text' })
      .subscribe({
        next: (value) => {
          console.log('Logout successful', value);
          alert('Logout successful');
        },
        error: (error) => {
          console.error('Logout error', error);
          alert('Logout error');
        }
      });
  }

  registerForm = new FormGroup({
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

  onRegisterFormSubmit() {
    const userData = {
      Name: this.registerForm.value.name,
      Surname1: this.registerForm.value.surname1,
      Surname2: this.registerForm.value.surname2,
      Bday: this.registerForm.value.bday,
      PhoneNumber: this.registerForm.value.phoneNumber,
      Email: this.registerForm.value.email,
      Password: this.registerForm.value.pass,
      Password2: this.registerForm.value.pass2,
      ProfileImageFile: this.registerForm.value.image
    };

    if (this.registerForm.value.pass !== this.registerForm.value.pass2) {
      alert('Las contraseñas no coinciden');
      return;
    }
    if (this.selectedUserId) {
      // Actualizar usuario existente
      console.log('Updating user :', userData);
      this.http.patch(`${this.url}api/Account/Update/${this.selectedUserId}`, userData, { responseType: 'text' })
      //this.http.patch(this.url + 'api/Account/Update/' + this.selectedUserId, userData, { responseType: 'text' })
        .subscribe({
          next: (value) => {
            console.log('User updated successfully', value);
            alert('Usuario actualizado con éxito');
            this.contacts$ = this.getContacts(); // Refresca la lista de contactos
            this.registerForm.reset(); // Resetea el formulario
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
            this.registerForm.reset(); // Resetea el formulario
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
          this.registerForm.patchValue({
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

  onRegister()
  {
    window.location.href = 'Register.html';
  }

  private getContacts(): Observable<any> {
    return this.http.get(this.url + 'api/Account/Users');
  }
}
