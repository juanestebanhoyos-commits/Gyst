import { useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Plus, Copy, ChevronRight, ClipboardList } from 'lucide-react-native';
import { useRoutines } from '@/hooks/useRoutines';
import { useSession } from '@/hooks/useSession';
import { useCloneRoutine } from '@/hooks/useCloneRoutine';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorScreen } from '@/components/ErrorScreen';
import { ListSeparator } from '@/components/ListSeparator';
import { useAppTheme, spacing, borderRadius, typography } from '@/lib/theme';
import type { Routine } from '@/types/supabase';

export default function RoutinesScreen() {
  const { colors } = useAppTheme();
  const { user } = useSession();
  const { data: routines, isLoading, error } = useRoutines();
  const cloneMutation = useCloneRoutine();
  const [cloningId, setCloningId] = useState<string | null>(null);

  const handleClone = useCallback((routineId: string) => {
    setCloningId(routineId);
    cloneMutation.mutate(routineId, {
      onSuccess: (newRoutineId) => {
        setCloningId(null);
        router.push(`/(tabs)/routines/${newRoutineId}`);
      },
      onError: () => {
        setCloningId(null);
      },
    });
  }, [cloneMutation]);

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
      marginBottom: spacing.lg,
    },
    list: {
      paddingBottom: spacing.xl,
    },
    card: {
      backgroundColor: colors.bgWhite,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg,
    },
    category: {
      ...typography.small,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: spacing.xs,
    },
    cardName: {
      ...typography.h3,
      color: colors.text,
      marginBottom: spacing.sm,
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
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.bgLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    recordsText: {
      ...typography.caption,
      color: colors.textMuted,
      flex: 1,
      marginLeft: spacing.sm,
    },
    verButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: colors.bgLight,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.sm,
    },
    verText: {
      ...typography.captionBold,
      color: colors.text,
    },
    cloneBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      backgroundColor: colors.primary,
      borderRadius: borderRadius.sm,
      paddingVertical: spacing.sm,
      marginTop: spacing.md,
    },
    cloneBadgeText: {
      color: colors.textOnPrimary,
      ...typography.small,
      fontWeight: '600',
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
      marginTop: 32,
    },
  }), [colors]);

  const renderItem = useCallback(({ item }: { item: Routine }) => {
    const isOwner = user ? item.user_id === user.id : false;
    const showClone = !isOwner && item.is_public;
    const isCloning = cloningId === item.id;

    return (
      <View style={styles.card}>
        <Text style={styles.category}>Rutina</Text>
        <Text style={styles.cardName}>{item.name}</Text>
        {item.description ? (
          <Text style={styles.cardDescription}>{item.description}</Text>
        ) : null}
        <View style={styles.bottomRow}>
          <View style={styles.iconContainer}>
            <ClipboardList size={20} color={colors.primary} />
          </View>
          <Text style={styles.recordsText}>rutina personalizada</Text>
          <TouchableOpacity
            style={styles.verButton}
            activeOpacity={0.7}
            onPress={() => router.push(`/(tabs)/routines/${item.id}`)}
          >
            <Text style={styles.verText}>Ver</Text>
            <ChevronRight size={14} color={colors.text} />
          </TouchableOpacity>
        </View>
        {showClone ? (
          <TouchableOpacity
            style={styles.cloneBadge}
            activeOpacity={0.7}
            onPress={() => handleClone(item.id)}
            disabled={isCloning}
          >
            {isCloning ? (
              <ActivityIndicator size="small" color={colors.textOnPrimary} />
            ) : (
              <Copy color={colors.textOnPrimary} size={14} />
            )}
            <Text style={styles.cloneBadgeText}>
              {isCloning ? 'Clonando' : 'Clonar'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }, [styles, user, cloningId, handleClone, colors]);

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen message="Error al cargar rutinas" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rutinas</Text>
      <FlatList<Routine>
        data={routines}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={ListSeparator}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ClipboardList size={32} color={colors.textPlaceholder} />
            <Text style={styles.emptyText}>No hay rutinas disponibles</Text>
          </View>
        }
      />
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => router.push('/(tabs)/routines/new')}
      >
        <Plus color={colors.textOnPrimary} size={24} />
      </TouchableOpacity>
    </View>
  );
}
