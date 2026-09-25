import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'accent';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export const BrutalistButton: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  style,
  textStyle,
  disabled,
}) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return '#06B6D4'; // Vibrant Cyan
      case 'secondary':
        return '#F59E0B'; // Warm Amber
      case 'accent':
        return '#4F46E5'; // Indigo
      case 'outline':
      default:
        return 'transparent';
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'accent':
        return '#0B0F19';
      case 'outline':
      default:
        return '#F3F4F6';
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: variant === 'outline' ? '#374151' : getBackgroundColor(),
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          { color: getTextColor() },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export const BrutalistCard: React.FC<{
  children: React.ReactNode;
  style?: ViewStyle;
  highlight?: boolean;
}> = ({ children, style, highlight }) => {
  return (
    <View
      style={[
        styles.card,
        highlight && { borderColor: '#F59E0B' },
        style,
      ]}
    >
      {children}
    </View>
  );
};

export const BrutalistBadge: React.FC<{
  label: string;
  variant?: 'code' | 'live' | 'gold';
  style?: ViewStyle;
}> = ({ label, variant = 'code', style }) => {
  let bgColor = '#1E293B';
  let textColor = '#94A3B8';
  let borderColor = '#334155';

  if (variant === 'live') {
    bgColor = '#064E3B';
    textColor = '#34D399';
    borderColor = '#10B981';
  } else if (variant === 'gold') {
    bgColor = '#451A03';
    textColor = '#FBBF24';
    borderColor = '#F59E0B';
  }

  return (
    <View style={[styles.badge, { backgroundColor: bgColor, borderColor }, style]}>
      <Text style={[styles.badgeText, { color: textColor }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 4,
  },
  buttonText: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  card: {
    borderWidth: 1,
    borderColor: '#1F2937',
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 14,
    marginVertical: 6,
  },
  badge: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontFamily: 'System',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
