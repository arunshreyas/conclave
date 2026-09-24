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
        return '#ffffff';
      case 'secondary':
        return '#f2bf4b';
      case 'accent':
        return '#5c010e';
      case 'outline':
      default:
        return 'transparent';
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return '#130f16';
      case 'secondary':
        return '#261a00';
      case 'accent':
        return '#ffffff';
      case 'outline':
      default:
        return '#ffdad8';
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
          borderColor: variant === 'secondary' ? '#f2bf4b' : '#4b463b',
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
        highlight && { borderColor: '#f2bf4b' },
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
  let bgColor = '#270003';
  let textColor = '#cdc6b7';
  let borderColor = '#4b463b';

  if (variant === 'live') {
    bgColor = '#5c010e';
    textColor = '#ffffff';
    borderColor = '#ffdad8';
  } else if (variant === 'gold') {
    bgColor = '#261a00';
    textColor = '#f2bf4b';
    borderColor = '#f2bf4b';
  }

  return (
    <View style={[styles.badge, { backgroundColor: bgColor, borderColor }, style]}>
      <Text style={[styles.badgeText, { color: textColor }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderWidth: 1,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 4,
    shadowColor: '#4b463b',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.9,
    shadowRadius: 0,
    elevation: 3,
  },
  buttonText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  card: {
    borderWidth: 1,
    borderColor: '#4b463b',
    backgroundColor: '#310004',
    padding: 16,
    borderRadius: 0,
    marginVertical: 8,
  },
  badge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 0,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
