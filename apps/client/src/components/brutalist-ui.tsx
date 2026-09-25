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
  variant?: 'primary' | 'secondary' | 'outline' | 'accent' | 'danger';
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
        return '#f2bf4b'; // Crackr Gold
      case 'secondary':
        return '#5c010e'; // Elevated Dark Crimson
      case 'accent':
        return '#ffa259'; // Warm Amber
      case 'danger':
        return '#8f1d1d'; // Critical Red
      case 'outline':
      default:
        return 'transparent';
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
      case 'accent':
        return '#310004'; // Dark Maroon on Gold/Amber
      case 'secondary':
        return '#f2bf4b'; // Gold on Crimson
      case 'danger':
        return '#ffdad8';
      case 'outline':
      default:
        return '#ffdad8';
    }
  };

  const getBorderColor = () => {
    switch (variant) {
      case 'primary':
        return '#f2bf4b';
      case 'secondary':
        return '#f2bf4b';
      case 'accent':
        return '#ffa259';
      case 'danger':
        return '#ff8585';
      case 'outline':
      default:
        return '#6b0e18';
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
          borderColor: getBorderColor(),
          opacity: disabled ? 0.5 : 1,
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
        highlight && { borderColor: '#f2bf4b', backgroundColor: '#5c010e' },
        style,
      ]}
    >
      {children}
    </View>
  );
};

export const BrutalistBadge: React.FC<{
  label: string;
  variant?: 'code' | 'live' | 'gold' | 'crimson';
  style?: ViewStyle;
}> = ({ label, variant = 'code', style }) => {
  let bgColor = '#480009';
  let textColor = '#cdc6b7';
  let borderColor = '#6b0e18';

  if (variant === 'live') {
    bgColor = '#1b4332';
    textColor = '#4ade80';
    borderColor = '#2e7d32';
  } else if (variant === 'gold') {
    bgColor = '#451a03';
    textColor = '#f2bf4b';
    borderColor = '#d97706';
  } else if (variant === 'crimson') {
    bgColor = '#6b0e18';
    textColor = '#ffdad8';
    borderColor = '#93000a';
  }

  return (
    <View style={[styles.badge, { backgroundColor: bgColor, borderColor }, style]}>
      <Text style={[styles.badgeText, { color: textColor }]}>{label}</Text>
    </View>
  );
};

export function getRankTitle(level: number): string {
  if (level < 3) return 'JEE NOVICE';
  if (level < 7) return 'CHAPTER CONQUEROR';
  if (level < 12) return 'FORMULA MASTER';
  if (level < 20) return 'RANK BOOSTER';
  return 'JEE MAESTRO';
}

export const XPLevelBar: React.FC<{
  xp: number;
  level: number;
  streak?: number;
  compact?: boolean;
  style?: ViewStyle;
}> = ({ xp, level, streak = 0, compact = false, style }) => {
  const xpInCurrentLevel = xp % 100;
  const progressPercent = Math.min(Math.max((xpInCurrentLevel / 100) * 100, 5), 100);
  const rankTitle = getRankTitle(level);

  if (compact) {
    return (
      <View style={[styles.compactContainer, style]}>
        <View style={styles.badgeRow}>
          <BrutalistBadge label={`LVL ${level}`} variant="gold" />
          <Text style={styles.compactXpText}>{xp} XP</Text>
        </View>
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.card, styles.xpCard, style]}>
      <View style={styles.xpHeader}>
        <View>
          <Text style={styles.rankTitle}>{rankTitle}</Text>
          <Text style={styles.levelLabel}>LEVEL {level}</Text>
        </View>
        <View style={styles.xpRightBadge}>
          {streak > 0 && (
            <BrutalistBadge label={`🔥 ${streak} STREAK`} variant="live" style={{ marginRight: 6 }} />
          )}
          <BrutalistBadge label={`${xp} TOTAL XP`} variant="gold" />
        </View>
      </View>

      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
      </View>

      <View style={styles.xpFooter}>
        <Text style={styles.xpFooterText}>{xpInCurrentLevel} / 100 XP to Level {level + 1}</Text>
        <Text style={styles.xpFooterText}>{100 - xpInCurrentLevel} XP REMAINING</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderWidth: 1.5,
    borderRadius: 8,
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
    borderWidth: 1.5,
    borderColor: '#6b0e18',
    backgroundColor: '#480009',
    padding: 16,
    borderRadius: 8,
    marginVertical: 6,
  },
  badge: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontFamily: 'System',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  compactContainer: {
    gap: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compactXpText: {
    color: '#f2bf4b',
    fontSize: 11,
    fontWeight: '800',
  },
  xpCard: {
    borderColor: '#f2bf4b',
    backgroundColor: '#310004',
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  rankTitle: {
    color: '#f2bf4b',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  levelLabel: {
    color: '#ffdad8',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  xpRightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#480009',
    borderColor: '#6b0e18',
    borderWidth: 1,
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#f2bf4b',
    borderRadius: 3,
  },
  xpFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  xpFooterText: {
    color: '#cdc6b7',
    fontSize: 10,
    fontWeight: '700',
  },
});
