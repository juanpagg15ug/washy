import { Stack } from 'expo-router';
import { useReconciliation } from '../src/shared/hooks/useReconciliation';

// Exportando el Error Boundary por defecto de Expo Router
export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  useReconciliation();
  
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
