import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { sendRealEmail } from '../services/emailService';
// Combinamos Seguridad Supabase + Branding EmailJS

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  error: null,
  loading: false,
  pendingVerificationUser: null, // Email waiting for OTP

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
        // 1. Login Nativo Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        // 2. Obtener Perfil y Verificar Estado
        const userId = data.user.id;
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (profile?.is_verified === 0) {
             set({ pendingVerificationUser: email, loading: false });
             throw new Error("Por favor verifica tu cuenta con el código OTP.");
        }

        const fullUser = {
            id: userId,
            email: data.user.email,
            ...profile
        };

        console.log("Usuario Logueado:", fullUser.name);
        set({ user: fullUser, isAuthenticated: true, loading: false });

    } catch (e) {
      console.log(e);
      let msg = e.message;
      if (msg.includes("Invalid login")) msg = "Correo o contraseña incorrectos.";
      if (msg.includes("Email not confirmed")) msg = "Por favor confirma tu correo antes de entrar.";
      set({ error: msg, loading: false });
      alert(msg);
    }
  },

  register: async (name, email, password, avatar) => {
    set({ loading: true, error: null });
    try {
        // 1. Registro en Supabase
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) throw error;

        // 2. Generar OTP Localmente (Control Total)
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        if (data.user) {
            // Guardar Perfil con Código
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([{
                    id: data.user.id,
                    name,
                    email, // Guardamos email para busqueda segura
                    avatar: avatar || '👤',
                    is_verified: 0,
                    verification_code: code
                }]);

            if (profileError) console.error("Error creating profile:", profileError);

            // 3. ENVIAR CORREO PERSONALIZADO
            const otpSent = await sendRealEmail(email, "Código de Verificación - MediTrack 🏥", code, 'OTP');

            // 4. Bloquear acceso hasta verificar
            set({ pendingVerificationUser: email, loading: false });

            // Retornamos éxito para manejar UI en la pantalla
            return { success: true, email, otpSent };
        }
    } catch (e) {
        console.log("Register Error:", e);
        set({ error: e.message, loading: false });
        throw e; // Lanzar error para que la pantalla lo capture
    }
  },

  verifyEmail: async (email, code) => {
      set({ loading: true });
      try {
          // Buscar usuario por email en perfiles (join con auth no directo, buscamos manual)
          // Nota: No podemos buscar email en profiles si no lo guardamos. 
          // Auth tiene el email. Profiles tiene el código.
          // Necesitamos el ID.
          
          // Workaround: Obtener ID via trick o asumiendo el usuario ya tiene sesión parcial?
          // Si Supabase pide confirmacion, no hay sesión.
          // Entonces necesitamos consultar RPC o Function de Admin? No.
          // Mejor: Guardar 'email' en profiles también para búsquedas fáciles de OTP. (Redundante pero útil).
          // O buscar ID desde auth? Client no puede buscar usuarios por email.
          
          // SOLUCION: Guardar email en profiles.
          // Voy a asumir que el profile tiene email si actualizamos el insert arriba.
          // Arriba en register inserté: name, avatar, id. FALTA EMAIL.
          
          // Lo añadimos ahora al SELECT. 
          // Corrección volátil: Asumimos que pendingVerificationUser tiene el email.
          
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
             .eq('email', email) 
             .eq('verification_code', code)
             .single();
             
          if (!profile) throw new Error("Código incorrecto o expirado.");
          
          // Validar
          // Actualizar
          const { error: updError } = await supabase
            .from('profiles')
            .update({ is_verified: 1, verification_code: null })
            .eq('id', profile.id);
            
          if (updError) throw updError;
          
          // Auto-login: Refrescar sesión y perfil para entrar directo
          await get().checkSession();

          set({ pendingVerificationUser: null, loading: false });
          return true;
          
      } catch (e) {
          set({ loading: false, error: e.message });
          throw e;
      }
  },

  logout: async () => {
      await supabase.auth.signOut();
      set({ user: null, isAuthenticated: false });
  },

  // Inicializador para persistencia de sesión
  checkSession: async () => {
      try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
              const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
              
              if (error || !profile) {
                  // Sesión fantasma (Auth existe pero Datos no). Limpiamos.
                  console.warn("Sesión detectada sin perfil. Cerrando sesión...");
                  await supabase.auth.signOut();
                  set({ user: null, isAuthenticated: false });
                  return;
              }

              set({ 
                  user: { 
                      ...session.user, 
                      ...profile,
                      is_verified: !!session.user.email_confirmed_at 
                  }, 
                  isAuthenticated: true 
              });

              // Cargar Medicamentos inmediatamente
              const { useMedicationStore } = require('./useMedicationStore');
              useMedicationStore.getState().fetchMedications();
          }
      } catch (e) {
          console.error("Error checking session:", e);
          set({ isAuthenticated: false });
      }
  },

  updateUserAvatar: async (newAvatar) => {
    const { user } = get();
    if (!user) return;

    try {
        const { error } = await supabase
            .from('profiles')
            .update({ avatar: newAvatar })
            .eq('id', user.id);
            
        if (error) throw error;

        set({ user: { ...user, avatar: newAvatar } });
        console.log("Avatar actualizado:", newAvatar);
    } catch (e) {
        console.error("Error actualizando avatar:", e);
        alert("Error al actualizar imagen: " + e.message);
    }
  }
}));
