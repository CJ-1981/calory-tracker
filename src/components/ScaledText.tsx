import React from 'react';
import { Text, TextStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface ScaledTextProps {
  children: React.ReactNode;
  style?: TextStyle;
  fontSize?: number;
  [key: string]: any;
}

export const ScaledText: React.FC<ScaledTextProps> = ({
  children,
  style,
  fontSize,
  ...props
}) => {
  const { fontScale } = useTheme();

  const scaledStyle: TextStyle = {
    ...(style as TextStyle),
  };

  if (fontSize) {
    scaledStyle.fontSize = fontSize * fontScale;
  }

  return (
    <Text style={scaledStyle} {...props}>
      {children}
    </Text>
  );
};
