import { redirect } from 'next/navigation';

// Ruta de convención pública: el registro de comercios vive dentro de /login
// (toggle Iniciar Sesión / Crear Cuenta). Este redirect evita el 404 cuando
// alguien entra por /register directamente o desde un enlace antiguo.
export default function RegisterPage() {
  redirect('/login');
}
