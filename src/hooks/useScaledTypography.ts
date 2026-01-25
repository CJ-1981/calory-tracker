import { useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { fontSize, fontWeight, lineHeight } from '../theme/typography';

export const useScaledTypography = () => {
  const { fontScale } = useTheme();

  const scaledFontSize = useMemo(() => {
    return Object.entries(fontSize).reduce((acc, [key, value]) => {
      acc[key] = value * fontScale;
      return acc;
    }, {} as Record<string, number>);
  }, [fontScale]);

  const scaledLineHeight = useMemo(() => {
    return Object.entries(lineHeight).reduce((acc, [key, value]) => {
      acc[key] = value * fontScale;
      return acc;
    }, {} as Record<string, number>);
  }, [fontScale]);

  return {
    fontSize: scaledFontSize,
    fontWeight,
    lineHeight: scaledLineHeight,
    fontScale,
  };
};
