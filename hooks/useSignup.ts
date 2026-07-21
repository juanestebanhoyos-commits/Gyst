import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface SignupOptions {
  data?: Record<string, unknown>;
}

export function useSignup() {
  return useMutation({
    mutationFn: async ({
      email,
      password,
      options,
    }: {
      email: string;
      password: string;
      options?: SignupOptions;
    }) => {
      const { error } = await supabase.auth.signUp({ email, password, options });
      if (error) throw error;
    },
  });
}
