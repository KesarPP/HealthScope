import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Pedometer } from 'expo-sensors';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import i18n from '../../i18n';


const { width } = Dimensions.get('window');

const dailyChallengesList = [
  'challenge_walk',
  'challenge_water',
  'challenge_no_screen',
  'challenge_stretching',
  'challenge_fruit',
  'challenge_breathing',
  'challenge_no_junk'
];


export default function HomeScreen() {
  const router = useRouter();
  const [language, setLanguage] = useState(i18n.locale);
  const [dailyData, setDailyData] = useState({
    steps: 0,
    calories: 0,
    stressLevel: 'Low'
  });

   const [isChallengeCompleted, setIsChallengeCompleted] = useState(false);
  const [recommendations] = useState([
    i18n.t('rec_walk_hourly'),
    i18n.t('rec_eye_exercise'),
    i18n.t('rec_meditation')
  ]);

  const todayIndex = new Date().getDay();
  const todayChallenge = i18n.t(dailyChallengesList[todayIndex]);

  useEffect(() => {
    const loadChallengeStatus = async () => {
      const key = `challenge-${todayIndex}`;
      const value = await AsyncStorage.getItem(key);
      if (value === 'done') {
        setIsChallengeCompleted(true);
      }
    };
    loadChallengeStatus();

    const subscription = Pedometer.watchStepCount(result => {
      setDailyData(prev => {
        const updatedSteps = prev.steps + result.steps;
        const updatedCalories = parseFloat((updatedSteps * 0.04).toFixed(2));
        return { ...prev, steps: updatedSteps, calories: updatedCalories };
      });
    });

    return () => subscription.remove();
  }, []);

  const handleMarkDone = async () => {
    const key = `challenge-${todayIndex}`;
    await AsyncStorage.setItem(key, 'done');
    setIsChallengeCompleted(true);
  };

  const handleLanguageChange = () => {
    const next = language === 'en' ? 'hi' : language === 'hi' ? 'mr' : 'en';
    i18n.locale = next;
    setLanguage(next);
  };

  return (
    <ImageBackground
      source={require('../../assets/images/back.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <ScrollView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{i18n.t('homeTitle')}</Text>
            <TouchableOpacity onPress={handleLanguageChange} style={styles.langButton}>
              <MaterialIcons name="language" size={24} color="#fff" />
              <Text style={styles.langText}>{language.toUpperCase()}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <MaterialIcons name="directions-walk" size={30} color="#2196F3" />
              <Text style={styles.statNumber}>{dailyData.steps}</Text>
              <Text style={styles.statLabel}>{i18n.t('steps')}</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialIcons name="local-fire-department" size={30} color="#FF5722" />
              <Text style={styles.statNumber}>{dailyData.calories}</Text>
              <Text style={styles.statLabel}>{i18n.t('calories')}</Text>
            </View>
          </View>

          <View style={styles.challengeCard}>
            <Text style={styles.sectionTitle}>{i18n.t('todayChallenge')}</Text>
            <View style={styles.challengeContent}>
              <MaterialIcons
                name={isChallengeCompleted ? "check-circle" : "flag"}
                size={22}
                color={isChallengeCompleted ? "#4CAF50" : "#FF9800"}
              />
              <Text style={[
                styles.challengeText,
                isChallengeCompleted && { textDecorationLine: 'line-through', color: '#888' }
              ]}>
                {todayChallenge}
              </Text>
            </View>
            {!isChallengeCompleted && (
              <TouchableOpacity onPress={handleMarkDone} style={styles.challengeButton}>
                <Text style={styles.challengeButtonText}>{i18n.t('markDone')}</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.recommendationsContainer}>
            <Text style={styles.sectionTitle}>{i18n.t('recommendations')}</Text>
            {recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationItem}>
                <MaterialIcons name="lightbulb-outline" size={20} color="#FFC107" />
                <Text style={styles.recommendationText}>{rec}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.monitorButton}
            onPress={() => router.push('../modals/scan')}
          >
            <MaterialIcons name="visibility" size={24} color="white" />
            <Text style={styles.monitorButtonText}>{i18n.t('monitor')}</Text>
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, opacity: 0.85 },
  overlay: { flex: 1, backgroundColor: 'rgba(255,255,255,0.85)' },
  container: { flex: 1 },
  header: {
    backgroundColor: '#0066cc',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white'
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#004a99',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20
  },
  langText: {
    color: 'white',
    marginLeft: 6,
    fontWeight: 'bold'
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginVertical: 20
  },
  statCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    elevation: 2
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5
  },
  challengeCard: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    elevation: 3
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15
  },
  challengeContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  challengeText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333'
  },
  challengeButton: {
    marginTop: 10,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'flex-start'
  },
  challengeButtonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  recommendationsContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    elevation: 3
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  recommendationText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#333'
  },
  monitorButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    padding: 15,
    borderRadius: 25,
    elevation: 3
  },
  monitorButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10
  }
});
