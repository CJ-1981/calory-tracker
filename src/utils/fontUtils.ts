import { Typography } from '../theme';

/**
 * Helper function to scale font sizes
 * Usage: scaledFontSize(Typography.fontSize.md, fontScale)
 */
export const scaledFontSize = (
  fontSize: number,
  fontScale: number
): number => {
  return fontSize * fontScale;
};

/**
 * Create a style object with scaled font size
 * Usage: { ...Typography.fontSize.md, fontSize: scaledFontSizeStyle(Typography.fontSize.md, fontScale) }
 */
export const scaledFontSizeStyle = (
  fontSize: number,
  fontScale: number
) => {
  return { fontSize: fontSize * fontScale };
};
