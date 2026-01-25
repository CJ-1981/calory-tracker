import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useTheme } from '../contexts/ThemeContext';
import { Spacing, BorderRadius, Typography } from '../theme';
import { scaledFontSize } from '../utils/fontUtils';

interface TrendChartProps {
  data: { value: number; label: string; date: string }[];
  goalValue?: number;
  color: string;
  title: string;
  unit: string;
  height?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const TrendChart: React.FC<TrendChartProps> = ({
  data,
  goalValue,
  color,
  title,
  unit,
  height = 200,
}) => {
  const { colors, fontScale } = useTheme();

  // Prepare data with points
  const lineData = data.map((item, index) => ({
    value: item.value,
    label: item.label,
    dataPointText: item.value.toFixed(0),
    date: item.date,
  }));

  // Add goal line if goalValue is provided
  const goalLineData = goalValue
    ? [
        {
          value: goalValue,
          dataPointText: `Goal: ${goalValue}`,
        },
      ]
    : [];

  const maxValue = Math.max(...data.map((d) => d.value), goalValue || 0);
  const yAxisMaxValue = maxValue > 0 ? Math.ceil(maxValue * 1.2) : 100;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, height }]}>
      <View style={styles.header}>
        <View style={[styles.indicator, { backgroundColor: color }]} />
        <View style={styles.titleContainer}>
          <View style={styles.titleRow}>
            <View style={styles.legendDot} />
            <Text style={[styles.title, { color: colors.text, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
              {title}
            </Text>
          </View>
          {goalValue && (
            <View style={styles.titleRow}>
              <View style={[styles.legendDot, { backgroundColor: colors.textSecondary }]} />
              <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.xs, fontScale) }]}>
                Goal: {goalValue} {unit}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.chartContainer}>
        {data.length > 0 && data.some((d) => d.value > 0) ? (
          <LineChart
            data={lineData}
            height={height - 60}
            width={SCREEN_WIDTH - Spacing.md * 4}
            maxValue={yAxisMaxValue}
            noOfSections={5}
            stepValue={Math.ceil(yAxisMaxValue / 5)}
            showVerticalLines
            verticalLinesColor={colors.border}
            horizontalRulesStyle={{ strokeDasharray: '5, 5' }}
            xAxisLabelTextStyle={{
              color: colors.textSecondary,
              fontSize: scaledFontSize(Typography.fontSize.xs, fontScale),
            }}
            yAxisTextStyle={{
              color: colors.textSecondary,
              fontSize: scaledFontSize(Typography.fontSize.xs, fontScale),
            }}
            yAxisColor={colors.border}
            xAxisColor={colors.border}
            initialSpacing={10}
            endSpacing={10}
            spacing={Math.max(30, (SCREEN_WIDTH - Spacing.md * 4 - 20) / 7)}
            color={color}
            thickness={2}
            dataPointsShape="circle"
            dataPointsWidth={6}
            dataPointsHeight={6}
            dataPointsColor={color}
            dataPointsRadius={4}
            focusedDataPointColor={colors.background}
            focusedDataPointRadius={6}
            focusedDataPointWidth={8}
            isAnimated
            animationDuration={800}
            animateOnDataChange
            adjustToWidth
            showValuesAsDataPointsText={false}
            hideDataPoints={false}
            textFontSize={scaledFontSize(Typography.fontSize.xs, fontScale)}
            textColor={colors.text}
            showXAxisIndices
            showYAxisIndices
            xAxisIndicesHeight={5}
            yAxisIndicesWidth={5}
            xAxisIndicesColor={colors.border}
            yAxisIndicesColor={colors.border}
            pointerConfig={{
              pointerStripColor: colors.textSecondary,
              pointerStripWidth: 1,
              pointerColor: color,
              pointerLabelWidth: 80,
              pointerLabelComponent: (items: any) => {
                return (
                  <View
                    style={{
                      backgroundColor: color,
                      paddingHorizontal: 8,
                      paddingVertical: 6,
                      borderRadius: 4,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.background,
                        fontSize: scaledFontSize(Typography.fontSize.xs, fontScale),
                        fontWeight: '600',
                      }}
                    >
                      {items[0]?.value?.toFixed(1)} {unit}
                    </Text>
                  </View>
                );
              },
              pointerViewContainerStyle: {
                backgroundColor: 'transparent',
              },
              activatePointersOnLongPress: true,
              showPointerStrip: true,
              pointerStripUptoDataPoint: true,
            } as any}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={[styles.noDataText, { color: colors.textSecondary, fontSize: scaledFontSize(Typography.fontSize.sm, fontScale) }]}>
              No data available
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  indicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: Spacing.sm,
  },
  titleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  title: {
    fontWeight: Typography.fontWeight.semibold,
  },
  subtitle: {
    fontWeight: Typography.fontWeight.normal,
  },
  chartContainer: {
    alignItems: 'center',
    flex: 1,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  noDataText: {
    textAlign: 'center',
  },
});
