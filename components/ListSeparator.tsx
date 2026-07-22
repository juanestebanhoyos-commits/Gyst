import { memo } from 'react';
import { View } from 'react-native';
import { spacing } from '@/lib/theme';

export const ListSeparator = memo(function ListSeparator() {
  return <View style={{ height: spacing.sm }} />;
});
