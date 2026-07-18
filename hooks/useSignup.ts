import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useSignup() {
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
    },
  });
}
