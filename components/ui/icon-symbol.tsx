// Android/web fallback for the iOS SF Symbols implementation.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Maps SF Symbol names being used by the app to equivalent Material Icons.
 * 
 * Because this file is used on Android and web, any new SF Symbol added
 * elsewhere in the app must also be added to this mapping.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
} as IconMapping;

/*
  Cross-platform fallback implementation of IconSymbol.

  iOS automatically uses `icon-symbol.ios.tsx`, which renders native 
  SF Symbols. Android and web use this file and render the mapped 
  Material Icons instead.

  The public icon names remain based on SF Symbols so callers can use
  the same API across platforms.
*/
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
