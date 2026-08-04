import { useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Plus, Copy, Check, ChevronRight, ClipboardList, User, Globe } from 'lucide-react-native';
import { useRoutines } from '@/hooks/useRoutines';
import { useSession } from '@/hooks/useSession';
import { useCloneRoutine } from '@/hooks/useCloneRoutine';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorScreen } from '@/components/ErrorScreen';
import { ListSeparator } from '@/components/ListSeparator';
import { SegmentedControl } from '@/components/SegmentedControl';
import { SearchInput } from '@/components/SearchInput';
import { useAppTheme, spacing, borderRadius, typography } from '@/lib/theme';
import type { Routine } from '@/types/supabase';

const TABS = ['Mis rutinas', 'Explorar'] as const;

export default function RoutinesScreen() {
  const { colors } = useAppTheme();
  const { user } = useSession();
  const { data: routines, isLoading, error } = useRoutines();
  const cloneMutation = useCloneRoutine();
  const [cloningId, setCloningId] = useState<string | null>(null);
  const [clonedId, setClonedId] = useState<string | null>(null);
  const cloneResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [tabIndex, setTabIndex] = useState(0);

  const myRoutines = useMemo(
    () => routines?.filter((r) => r.user_id === user?.id) ?? [],
    [routines, user?.id],
  );

  const publicRoutines = useMemo(
    () => routines?.filter((r) => r.user_id !== user?.id && r.is_public) ?? [],
    [routines, user?.id],
  );

  const activeRoutines = tabIndex === 0 ? myRoutines : publicRoutines;

  const [debouncedSearch, setDebouncedSearch] = useState('');

  const filteredRoutines = useMemo(() => {
    if (!debouncedSearch) return activeRoutines;
    const q = debouncedSearch.toLowerCase().trim();
    return activeRoutines.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.description ?? '').toLowerCase().includes(q),
    );
  }, [activeRoutines, debouncedSearch]);

  const handleClone = useCallback((routineId: string) => {
    setCloningId(routineId);
    cloneMutation.mutate(routineId, {
      onSuccess: () => {
        setCloningId(null);
        setClonedId(routineId);
        if (cloneResetTimer.current) clearTimeout(cloneResetTimer.current);
        cloneResetTimer.current = setTimeout(() => setClonedId(null), 1600);
      },
      onError: () => {
        setCloningId(null);
      },
    });
  }, [cloneMutation]);

  const handleCardPress = useCallback((routine: Routine) => {
    router.push(`/(tabs)/routines/${routine.id}`);
  }, []);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
    },
    title: {
      ...typography.caption,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 1,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    segmentedWrapper: {
      marginBottom: spacing.lg,
    },
    list: {
      paddingBottom: spacing.xl,
    },
    card: {
      flexDirection: 'row',
      backgroundColor: colors.bgWhite,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    cardAccent: {
      width: 4,
    },
    cardContent: {
      flex: 1,
      padding: spacing.lg,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      alignSelf: 'flex-start',
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: borderRadius.sm,
      marginBottom: spacing.sm,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    cardName: {
      ...typography.h3,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    cardDescription: {
      ...typography.caption,
      color: colors.textMuted,
      marginBottom: spacing.md,
    },
    bottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.xs,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      flex: 1,
    },
    metaText: {
      ...typography.small,
      color: colors.textMuted,
    },
    verButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: colors.bgLight,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.sm,
      marginLeft: spacing.sm,
    },
    verText: {
      ...typography.captionBold,
      color: colors.text,
    },
    cloneButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.sm,
      marginLeft: spacing.sm,
    },
    cloneButtonText: {
      color: colors.textOnPrimary,
      ...typography.captionBold,
    },
    fab: {
      position: 'absolute',
      bottom: spacing.xl,
      right: spacing.lg,
      backgroundColor: colors.primary,
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    emptyContainer: {
      alignItems: 'center',
      marginTop: 32,
      gap: spacing.sm,
    },
    emptyText: {
      ...typography.body,
      color: colors.textPlaceholder,
      textAlign: 'center',
      marginTop: 16,
    },
    emptySubtext: {
      ...typography.caption,
      color: colors.textPlaceholder,
      textAlign: 'center',
      marginTop: 4,
    },
    emptyAction: {
      marginTop: spacing.md,
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.sm,
    },
    emptyActionText: {
      color: colors.textOnPrimary,
      ...typography.captionBold,
    },
  }), [colors]);

  const renderItem = useCallback(({ item }: { item: Routine }) => {
    const isOwner = user ? item.user_id === user.id : false;
    const isCloning = cloningId === item.id;
    const isCloned = clonedId === item.id;
    const scheduleDays = item.scheduled_days?.length ?? 0;

    const accentColor = isOwner ? colors.primary : colors.textMuted;
    const badgeBg = isOwner ? colors.primaryBg : colors.bgLight;
    const badgeTextColor = isOwner ? colors.primary : colors.textMuted;
    const Icon = isOwner ? User : Globe;

    const scheduleText = scheduleDays > 0
      ? `${scheduleDays} días/sem`
      : 'Sin horario';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => handleCardPress(item)}
      >
        <View style={[styles.cardAccent, { backgroundColor: accentColor }]} />
        <View style={styles.cardContent}>
          <View style={[styles.badge, { backgroundColor: badgeBg }]}>
            <Icon size={12} color={badgeTextColor} />
            <Text style={[styles.badgeText, { color: badgeTextColor }]}>
              {isOwner ? 'Personal' : 'Pública'}
            </Text>
          </View>
          <Text style={styles.cardName}>{item.name}</Text>
          {item.description ? (
            <Text style={styles.cardDescription} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
          <View style={styles.bottomRow}>
            <View style={styles.metaRow}>
              <ClipboardList size={14} color={colors.textMuted} />
              <Text style={styles.metaText}>{scheduleText}</Text>
            </View>
            {isOwner ? (
              <View style={styles.verButton}>
                <Text style={styles.verText}>Ver</Text>
                <ChevronRight size={14} color={colors.text} />
              </View>
            ) : (
              <TouchableOpacity
                style={styles.cloneButton}
                activeOpacity={0.7}
                onPress={(e) => {
                  e.stopPropagation();
                  handleClone(item.id);
                }}
                disabled={isCloning}
                accessibilityRole="button"
                accessibilityLabel={`Clonar rutina ${item.name}`}
              >
                {isCloning ? (
                  <ActivityIndicator size="small" color={colors.textOnPrimary} />
                ) : isCloned ? (
                  <>
                    <Check color={colors.textOnPrimary} size={14} />
                    <Text style={styles.cloneButtonText}>Clonada</Text>
                  </>
                ) : (
                  <>
                    <Copy color={colors.textOnPrimary} size={14} />
                    <Text style={styles.cloneButtonText}>Clonar</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [styles, user, cloningId, clonedId, handleClone, handleCardPress, colors]);

  if (isLoading) return <LoadingScreen />;
  // Offline: priorizar los datos de caché sobre el error del refetch.
  if (error && !routines) return <ErrorScreen message="Error al cargar rutinas" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rutinas</Text>
      <View style={styles.segmentedWrapper}>
        <SegmentedControl
          options={TABS}
          selectedIndex={tabIndex}
          onChange={setTabIndex}
        />
      </View>
      <SearchInput onSearch={setDebouncedSearch} placeholder="Buscar rutinas..." />
      <FlatList<Routine>
        data={filteredRoutines}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={ListSeparator}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ClipboardList size={32} color={colors.textPlaceholder} />
            <Text style={styles.emptyText}>
              {tabIndex === 0 ? 'Aún no tienes rutinas' : 'No hay rutinas públicas disponibles'}
            </Text>
            <Text style={styles.emptySubtext}>
              {tabIndex === 0
                ? 'Crea tu primera rutina para empezar'
                : 'Vuelve más tarde para descubrir nuevas rutinas'}
            </Text>
            {tabIndex === 0 && (
              <TouchableOpacity
                style={styles.emptyAction}
                activeOpacity={0.7}
                onPress={() => router.push('/(tabs)/routines/new')}
              >
                <Text style={styles.emptyActionText}>Crear rutina</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
      {tabIndex === 0 && (
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/routines/new')}
        >
          <Plus color={colors.textOnPrimary} size={24} />
        </TouchableOpacity>
      )}
    </View>
  );
}
