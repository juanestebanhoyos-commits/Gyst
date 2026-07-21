import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';
import { useMemo } from 'react';
import { SegmentedControl } from '@/components/SegmentedControl';
import { useChartView, VIEW_OPTIONS, VIEW_TITLES, Y_AXIS_SUFFIX } from '@/hooks/useChartView';
import { colors } from '@/constants/theme';
import type { SetLog } from '@/types/supabase';

interface ProgressChartProps {
  data: SetLog[];
  width?: number;
  height?: number;
}

export function ProgressChart({ data, width = 300, height = 200 }: ProgressChartProps) {
  const {
    selectedView,
    setSelectedView,
    chartPoints,
    currentTitle,
    currentSuffix,
  } = useChartView(data);

  const padding = { top: 24, bottom: 30, left: 45, right: 15 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxValue = Math.max(...chartPoints.map(p => p.value));
  const minValue = Math.min(...chartPoints.map(p => p.value));
  const range = maxValue - minValue || 1;
  const xStep = chartWidth / (Math.max(chartPoints.length, 2) - 1);

  const linePoints = useMemo(
    () =>
      chartPoints.map((p, i) => ({
        x: padding.left + i * xStep,
        y: padding.top + chartHeight - ((p.value - minValue) / range) * chartHeight,
        label: new Date(p.createdAt).toLocaleDateString('es-ES', {
          month: 'short',
          day: 'numeric',
        }),
        value: p.value,
      })),
    [chartPoints, chartHeight, chartWidth, minValue, range],
  );

  if (chartPoints.length < 2) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{currentTitle}</Text>
        <SegmentedControl
          options={VIEW_OPTIONS}
          selectedIndex={selectedView}
          onChange={(i) => setSelectedView(i as 0 | 1 | 2)}
        />
        <Text style={styles.emptyText}>
          {data.length === 0
            ? 'No hay datos de progreso para este ejercicio'
            : 'Se necesitan al menos 2 sesiones para mostrar el progreso'}
        </Text>
      </View>
    );
  }

  const linePath = linePoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

  const yTicks = 4;
  const tickValues = Array.from({ length: yTicks + 1 }, (_, i) =>
    Math.round((minValue + (range / yTicks) * i) * 10) / 10,
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{currentTitle}</Text>
        <SegmentedControl
          options={VIEW_OPTIONS}
          selectedIndex={selectedView}
          onChange={(i) => setSelectedView(i as 0 | 1 | 2)}
        />
      <Svg width={width} height={height}>
        {tickValues.map((val, i) => {
          const y = padding.top + chartHeight - ((val - minValue) / range) * chartHeight;
          return (
            <g key={`tick-${i}`}>
              <Line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke={colors.borderLight}
                strokeWidth={1}
              />
              <SvgText
                x={padding.left - 6}
                y={y + 4}
                fill={colors.textPlaceholder}
                fontSize={11}
                textAnchor="end"
              >
                {Math.round(val)}{currentSuffix}
              </SvgText>
            </g>
          );
        })}

        <Path d={linePath} stroke={colors.primary} strokeWidth={2} fill="none" strokeLinejoin="round" />

        {linePoints.map((p, i) => (
          <g key={`dot-${i}`}>
            <Circle cx={p.x} cy={p.y} r={4} fill={colors.primary} />
            <SvgText
              x={p.x}
              y={height - 6}
              fill={colors.textMuted}
              fontSize={10}
              textAnchor="middle"
            >
              {p.label}
            </SvgText>
          </g>
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 40,
  },
});
