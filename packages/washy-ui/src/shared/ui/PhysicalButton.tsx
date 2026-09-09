import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';

export type PhysicalButtonVariant = 'primary' | 'secondary' | 'danger';

interface PhysicalButtonProps {
  label: string;
  onPress: () => void;
  variant?: PhysicalButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

/**
 * PhysicalButton (Átomo)
 * Diseñado siguiendo la Ley de Fitts: áreas táctiles masivas (chunky).
 * Micro-copy debe ser accionable físicamente.
 */
export function PhysicalButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  style,
}: PhysicalButtonProps) {
  
  const getContainerStyle = () => {
    if (disabled) return styles.disabledContainer;
    switch (variant) {
      case 'primary': return styles.primaryContainer;
      case 'secondary': return styles.secondaryContainer;
      case 'danger': return styles.dangerContainer;
      default: return styles.primaryContainer;
    }
  };

  const getTextStyle = () => {
    if (disabled) return styles.disabledText;
    switch (variant) {
      case 'primary': return styles.primaryText;
      case 'secondary': return styles.secondaryText;
      case 'danger': return styles.dangerText;
      default: return styles.primaryText;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.baseContainer, getContainerStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#171717' : '#ffffff'} />
      ) : (
        <>
          {icon && icon}
          <Text style={[styles.baseText, getTextStyle()]}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  baseContainer: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16, // Bordes amigables, menos agresivos
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    minHeight: 64, // Touch target masivo
  },
  baseText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  // PRIMARY (Llamado a la acción principal)
  primaryContainer: { backgroundColor: '#ffffff' },
  primaryText: { color: '#171717' },

  // SECONDARY (Backlog, Captura Ciega)
  secondaryContainer: { backgroundColor: '#262626' },
  secondaryText: { color: '#ffffff' },

  // DANGER (Panic Button, Abort)
  dangerContainer: { backgroundColor: '#f43f5e' },
  dangerText: { color: '#ffffff' },

  // DISABLED (Lavadora en uso, WIP Max)
  disabledContainer: { backgroundColor: '#262626', opacity: 0.7 },
  disabledText: { color: '#737373' },
});
