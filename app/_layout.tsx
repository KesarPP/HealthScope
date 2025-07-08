import { Slot } from 'expo-router';
import { LanguageProvider } from './LanguageProvider'; // adjust if needed

export default function Layout() {
  return (
    <LanguageProvider>
      <Slot />
    </LanguageProvider>
  );
}
