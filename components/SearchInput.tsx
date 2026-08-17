import { memo, useState, useEffect, useRef } from 'react';
import { View, TextInput } from 'react-native';
import { Search } from 'lucide-react-native';
import { useAppTheme, spacing, borderRadius, typography } from '@/lib/theme';

interface SearchInputProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export const SearchInput = memo(function SearchInput({
  onSearch,
  placeholder = 'Buscar...',
}: SearchInputProps) {
  const [value, setValue] = useState('');
  const { colors } = useAppTheme();
  const onSearchRef = useRef(onSearch);

  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    const t = setTimeout(() => onSearchRef.current(value), 300);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bgWhite,
        borderWidth: 1,
        borderColor: colors.borderLight,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        marginBottom: spacing.lg,
        gap: spacing.sm,
      }}
    >
      <Search color={colors.textPlaceholder} size={20} />
      <TextInput
        style={{
          flex: 1,
          paddingVertical: spacing.md,
          color: colors.text,
          ...typography.body,
        }}
        placeholder={placeholder}
        placeholderTextColor={colors.textPlaceholder}
        value={value}
        onChangeText={setValue}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
    </View>
  );
});
