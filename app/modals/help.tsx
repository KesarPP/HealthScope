import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import i18n from '../../i18n';
import { useLanguage } from '../LanguageProvider';

export default function HelpScreen() {
  const router = useRouter();
  const { language } = useLanguage(); // 🔁 re-render on language change

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>{i18n.t('helpTitle')}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.question}>❓ {i18n.t('howToUpdateProfile')}</Text>
        <Text style={styles.answer}>{i18n.t('updateProfileAnswer')}</Text>

        <Text style={styles.question}>🔒 {i18n.t('howToChangePassword')}</Text>
        <Text style={styles.answer}>{i18n.t('changePasswordAnswer')}</Text>

        <Text style={styles.question}>📞 {i18n.t('needHelp')}</Text>
        <Text style={styles.answer}>
          {i18n.t('emailUsAt')}{' '}
          <Text style={{ fontWeight: 'bold' }}>support@healthscope.app</Text>
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#0066cc',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  section: {
    padding: 20,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    color: '#333',
  },
  answer: {
    fontSize: 15,
    marginTop: 5,
    color: '#666',
  },
});
