import { useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Plus, Copy } from 'lucide-react-native';
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

  const renderItem = useCallback(({ item }: { item: Routine }) => {
    const isOwner = user ? item.user_id === user.id : false;
    const showClone = !isOwner && item.is_public;
    const isCloning = cloningId === item.id;

    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardContent}
          activeOpacity={0.7}
          onPress={() => router.push(`/(tabs)/routines/${item.id}`)}
        >
          <Text style={styles.cardName}>{item.name}</Text>
          {item.description ? (
            <Text style={styles.cardDescription}>{item.description}</Text>
          ) : null}
        </TouchableOpacity>
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
  }, [user, cloningId, handleClone]);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
    },
    title: {
      ...typography.h1,
      color: colors.text,
      marginBottom: spacing.lg,
    },
    list: {
      paddingBottom: 80,
    },
    card: {
      backgroundColor: colors.bgWhite,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    cardContent: {
      padding: spacing.lg,
    },
    cardName: {
      ...typography.h3,
      color: colors.text,
    },
    cardDescription: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: spacing.xs,
    },
    cloneBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      backgroundColor: colors.success,
      borderBottomLeftRadius: borderRadius.lg,
      borderBottomRightRadius: borderRadius.lg,
      paddingVertical: spacing.sm,
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
    emptyText: {
      ...typography.body,
      color: colors.textPlaceholder,
      textAlign: 'center',
      marginTop: 32,
    },
  }), [colors]);

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
          <Text style={styles.emptyText}>No hay rutinas disponibles</Text>
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

