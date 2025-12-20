import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../styles/colors';
import { ASPECT_RATIOS } from '../utils/cropMath';

/**
 * CropToolbar Component
 * Toolbar for crop mode with aspect ratio selection and actions
 * 
 * @param {string} selectedRatio - Currently selected aspect ratio key
 * @param {function} onRatioChange - Callback when aspect ratio changes
 * @param {function} onReset - Callback to reset crop to full image
 * @param {function} onCancel - Callback to cancel crop mode
 * @param {function} onApply - Callback to apply crop
 * @param {boolean} disabled - Whether toolbar is disabled
 */
export default function CropToolbar({
  selectedRatio,
  onRatioChange,
  onReset,
  onCancel,
  onApply,
  disabled = false,
}) {
  return (
    <View style={styles.container}>
      {/* Aspect Ratio Selection */}
      <View style={styles.ratioSection}>
        <Text style={styles.sectionLabel}>Aspect Ratio</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.ratioScroll}
        >
          {Object.entries(ASPECT_RATIOS).map(([key, config]) => (
            <AspectRatioButton
              key={key}
              ratioKey={key}
              config={config}
              selected={selectedRatio === key}
              onPress={() => onRatioChange(key)}
              disabled={disabled}
            />
          ))}
        </ScrollView>
      </View>
      
      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
          disabled={disabled}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.resetButton]}
          onPress={onReset}
          disabled={disabled}
        >
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.applyButton, disabled && styles.buttonDisabled]}
          onPress={onApply}
          disabled={disabled}
        >
          <Text style={styles.applyButtonText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/**
 * Individual Aspect Ratio Button
 */
function AspectRatioButton({ ratioKey, config, selected, onPress, disabled }) {
  const handlePress = () => {
    console.log('🎯 Aspect ratio button pressed:', ratioKey);
    console.log('🎯 Config:', config);
    console.log('🎯 onPress type:', typeof onPress);
    
    try {
      if (onPress) {
        console.log('🎯 Calling onPress...');
        onPress();
        console.log('✅ onPress completed');
      } else {
        console.error('❌ onPress is undefined!');
      }
    } catch (error) {
      console.error('❌ Error in button press:', error);
    }
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.ratioButton,
        selected && styles.ratioButtonSelected,
        disabled && styles.ratioButtonDisabled,
      ]}
      onPress={handlePress}
      disabled={disabled}
    >
      <Text style={styles.ratioIcon}>{config.icon}</Text>
      <Text style={[
        styles.ratioText,
        selected && styles.ratioTextSelected,
      ]}>
        {config.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 20,
  },
  ratioSection: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  ratioScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  ratioButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    minWidth: 70,
  },
  ratioButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  ratioButtonDisabled: {
    opacity: 0.5,
  },
  ratioIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  ratioText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  ratioTextSelected: {
    color: '#FFFFFF',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resetButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: colors.primary,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});