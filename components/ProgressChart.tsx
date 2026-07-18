import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';
import type { SetLog } from '@/types/supabase';

interface ProgressChartProps {
  data: SetLog[];
  width?: number;
  height?: number;
}

export function ProgressChart({ data, width = 300, height = 200 }: ProgressChartProps) {
  const sessionMax = new Map<string, { maxWeight: number; createdAt: string }>();
  for (const log of data) {
    const current = sessionMax.get(log.workout_log_id);
    if (!current || log.weight_kg > current.maxWeight) {
      sessionMax.set(log.workout_log_id, { maxWeight: log.weight_kg, createdAt: log.created_at });
    }
  }

  const points = Array.from(sessionMax.entries())
    .map(([id, p]) => ({ id, ...p }))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  if (points.length < 2) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>
          {data.length === 0
            ? 'No hay datos de progreso para este ejercicio'
            : 'Se necesitan al menos 2 sesiones para mostrar el progreso'}
        </Text>
      </View>
    );
  }

  const padding = { top: 20, bottom: 30, left: 45, right: 15 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxWeight = Math.max(...points.map(p => p.maxWeight));
  const minWeight = Math.min(...points.map(p => p.maxWeight));
  const range = maxWeight - minWeight || 1;
  const xStep = chartWidth / (points.length - 1);

  const linePoints = points.map((p, i) => ({
    x: padding.left + i * xStep,
    y: padding.top + chartHeight - ((p.maxWeight - minWeight) / range) * chartHeight,
    label: new Date(p.createdAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
    weight: p.maxWeight,
  }));

  const linePath = linePoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

  const yTicks = 4;
  const tickValues = Array.from({ length: yTicks + 1 }, (_, i) =>
    Math.round((minWeight + (range / yTicks) * i) * 10) / 10,
  );

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        {tickValues.map((val, i) => {
          const y = padding.top + chartHeight - ((val - minWeight) / range) * chartHeight;
          return (
            <g key={`tick-${i}`}>
              <Line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth={1}
              />
              <SvgText
                x={padding.left - 6}
                y={y + 4}
                fill="#9ca3af"
                fontSize={11}
                textAnchor="end"
              >
                {val}
              </SvgText>
            </g>
          );
        })}

        <Path d={linePath} stroke="#2563eb" strokeWidth={2} fill="none" strokeLinejoin="round" />

        {linePoints.map((p, i) => (
          <g key={`dot-${i}`}>
            <Circle cx={p.x} cy={p.y} r={4} fill="#2563eb" />
            <SvgText
              x={p.x}
              y={height - 6}
              fill="#6b7280"
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
  emptyText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 40,
  },
});
