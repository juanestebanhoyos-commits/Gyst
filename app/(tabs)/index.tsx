import { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { WelcomeHeader } from '@/components/WelcomeHeader';
import { StreakCard } from '@/components/StreakCard';
import { TodayExercisesSection } from '@/components/TodayExercisesSection';
import { RoutinesSection } from '@/components/RoutinesSection';
import { useAppTheme } from '@/lib/theme';

export default function HomeScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        screen: {
          flex: 1,
          backgroundColor: colors.bg,
        },
        content: {
          paddingBottom: 32,
        },
      }),
    [colors],
  );
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <WelcomeHeader />
      <StreakCard />
      <RoutinesSection />
      <TodayExercisesSection />
    </ScrollView>
  );
}
