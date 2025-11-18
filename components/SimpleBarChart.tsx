import { View, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useThemeColors } from '../hooks/use-theme-colors';

interface SimpleBarChartProps {
  data: number[];
  height?: number;
  color?: string;
}

export default function SimpleBarChart({ data, height = 100, color }: SimpleBarChartProps) {
  const COLORS = useThemeColors();
  const barColor = color || COLORS.primary;
  const maxValue = Math.max(...data, 1);
  const barWidth = 100 / data.length;
  const spacing = 2;

  return (
    <View style={[styles.container, { height }]}>
      <Svg width="100%" height={height}>
        {data.map((value, index) => {
          const barHeight = (value / maxValue) * (height - 20);
          const x = (index * barWidth) + (barWidth * 0.1);
          const y = height - barHeight - 10;
          const width = barWidth * 0.8;

          return (
            <Rect
              key={index}
              x={`${x}%`}
              y={y}
              width={`${width}%`}
              height={barHeight}
              fill={barColor}
              rx={4}
            />
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});

