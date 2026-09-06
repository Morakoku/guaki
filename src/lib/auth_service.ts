import { AuthResponse, UserRole, UserSession } from '@/types/auth';
import { eventBus } from '@/lib/event_bus';
import { getSupabaseClient } from '@/lib/supabase';
import { getTrustedRole } from '@/lib/authorization';

export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) AuthService.instance = new AuthService();
    return AuthService.instance;
  }

  public async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await getSupabaseClient().auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.toLowerCase().includes('invalid login credentials')) {
          return { user: null, token: null, error: 'Correo o contraseña incorrectos. Verifica tus datos.' };
        }
        if (error.message.toLowerCase().includes('email not confirmed')) {
          return { user: null, token: null, error: 'Debes confirmar tu correo electrónico antes de ingresar. Revisa tu bandeja de entrada o carpeta de spam.' };
        }
        // Catch-all: nunca mostrar el error crudo de Supabase al usuario final.
        return { user: null, token: null, error: 'No pudimos iniciar sesión. Verifica tu conexión e intenta de nuevo; si persiste, escríbenos por WhatsApp.' };
      }
      if (!data.user || !data.session) return { user: null, token: null, error: 'AUTH_SESSION_MISSING' };

      const user = this.toUserSession(data.user);
      await eventBus.emit({
        eventType: 'user.login.success',
        userId: user.id,
        payload: { role: user.role },
      });
      return { user, token: data.session.access_token };
    } catch {
      return { user: null, token: null, error: 'AUTH_PROVIDER_UNAVAILABLE' };
    }
  }

  public async register(email: string, password: string, fullName: string, role: UserRole = 'client'): Promise<AuthResponse> {
    if (role !== 'client') {
      return { user: null, token: null, error: 'PROVIDER_PROVISIONING_REQUIRED' };
    }
    try {
      const { data, error } = await getSupabaseClient().auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      if (error) {
        // Si el usuario ya fue creado en un intento previo o se excedió el rate limit de emails, intentamos login directo
        if (
          error.message.toLowerCase().includes('already registered') ||
          error.message.toLowerCase().includes('rate limit') ||
          error.message.toLowerCase().includes('over_email')
        ) {
          const directLogin = await this.login(email, password);
          if (directLogin.token) {
            return directLogin;
          }
          if (directLogin.error && directLogin.error.includes('confirmar tu correo')) {
            return directLogin;
          }
        }
        if (error.message.toLowerCase().includes('already registered')) {
          return { user: null, token: null, error: 'Este correo electrónico ya está registrado. Por favor inicia sesión.' };
        }
        if (error.message.toLowerCase().includes('rate limit') || error.message.toLowerCase().includes('over_email')) {
          return {
            user: null,
            token: null,
            error: 'Límite de correos alcanzado. Tu usuario ya fue creado: por favor haz clic en "Iniciar Sesión" con tu contraseña.',
          };
        }
        if (error.message.toLowerCase().includes('password')) {
          return { user: null, token: null, error: 'La contraseña debe tener al menos 6 caracteres.' };
        }
        if (
          error.message.toLowerCase().includes('email address') && error.message.toLowerCase().includes('invalid') ||
          error.message.toLowerCase().includes('invalid_email') ||
          error.message.toLowerCase().includes('email_address_invalid')
        ) {
          return {
            user: null,
            token: null,
            error: 'El correo electrónico no es válido. Verifica que esté bien escrito (ej. nombre@tuempresa.com) e intenta de nuevo.',
          };
        }
        if (error.message.toLowerCase().includes('signup requires a valid password')) {
          return { user: null, token: null, error: 'Ingresa una contraseña válida para crear tu cuenta.' };
        }
        // Catch-all: nunca mostrar el error crudo de Supabase al usuario final.
        return { user: null, token: null, error: 'No pudimos completar el registro. Revisa tus datos e intenta de nuevo; si persiste, escríbenos por WhatsApp.' };
      }
      if (!data.user) return { user: null, token: null, error: 'No se pudo crear el usuario. Intenta de nuevo.' };

      const user = this.toUserSession(data.user);
      await eventBus.emit({
        eventType: 'user.register.success',
        userId: user.id,
        payload: { role: user.role },
      });

      let token = data.session?.access_token;
      if (!token) {
        // Intento automático de inicio de sesión si signUp requiere confirmación o no entregó sesión inmediata
        const loginRes = await getSupabaseClient().auth.signInWithPassword({ email, password });
        if (loginRes.data?.session?.access_token) {
          token = loginRes.data.session.access_token;
        }
      }

      if (!token) {
        return {
          user,
          token: null,
          error: 'CONFIRMATION_REQUIRED',
        };
      }

      return { user, token };
    } catch {
      return { user: null, token: null, error: 'AUTH_PROVIDER_UNAVAILABLE' };
    }
  }

  private toUserSession(user: {
    id: string;
    email?: string;
    created_at?: string;
    user_metadata?: Record<string, unknown>;
    app_metadata?: Record<string, unknown>;
  }): UserSession {
    const role = getTrustedRole(user);
    return {
      id: user.id,
      email: user.email ?? '',
      role,
      fullName: typeof user.user_metadata?.full_name === 'string'
        ? user.user_metadata.full_name
        : (user.email?.split('@')[0] ?? 'Usuario'),
      status: 'active',
    };
  }
}

export const authService = AuthService.getInstance();
