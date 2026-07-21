import { ScrollView, StyleSheet } from 'react-native';
import { WelcomeHeader } from '@/components/WelcomeHeader';
import { StreakCard } from '@/components/StreakCard';
import { TodayExercisesSection } from '@/components/TodayExercisesSection';
import { RoutinesSection } from '@/components/RoutinesSection';
import { colors } from '@/constants/theme';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <WelcomeHeader />
      <StreakCard />
      <TodayExercisesSection />
      <RoutinesSection />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingBottom: 32,
  },
});
