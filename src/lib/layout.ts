// Helpers so screens adapt to the Fold's narrow cover screen and wide inner screen.
import { useWindowDimensions } from 'react-native';

/** Narrow (cover screen, ~370dp) vs wide (unfolded, ~700dp+). */
export function useIsWide() {
  const { width } = useWindowDimensions();
  return width >= 600;
}

/** How many cover-art columns fit on the current screen. */
export function useGridColumns(minItemWidth = 115) {
  const { width } = useWindowDimensions();
  return Math.max(2, Math.floor((width - 16) / minItemWidth));
}
