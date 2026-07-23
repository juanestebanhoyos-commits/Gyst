import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/hooks/useSession';
import { useUpdateProfile } from '@/hooks/useUpdateProfile';

export function useTheme() {
  const { user } = useSession();
  const updateProfile = useUpdateProfile();

  const { data: themePreference, isLoading } = useQuery<string>({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('theme_preference')
        .eq('id', user!.id)
        .single();
      if (error) throw error;
      return data.theme_preference;
    },
    enabled: !!user?.id,
  });

  function setThemePreference(value: string) {
    if (!user?.id) return;
    updateProfile.mutate({ id: user.id, theme_preference: value });
  }

  return { themePreference: themePreference ?? 'dark', setThemePreference, isLoading };
}
