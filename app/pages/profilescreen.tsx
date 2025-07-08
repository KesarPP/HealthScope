import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import i18n from '../../i18n';
import { useLanguage } from '../LanguageProvider';
import { auth, db } from '../modals/firebaseConfig';

type UserInfo = {
  name: string;
  email: string;
  photoURL: string;
  age: number;
  height: string;
  weight: string;
  bloodType: string;
};

type EditableField = 'age' | 'height' | 'weight' | 'bloodType';

export default function ProfileScreen() {
  const router = useRouter();
  const { language } = useLanguage(); // re-renders component on language change

  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    email: '',
    photoURL: '',
    age: 0,
    height: '',
    weight: '',
    bloodType: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const uid = auth.currentUser?.uid;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!uid) return;
      try {
        const docRef = doc(db, 'users', uid);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          const data = snapshot.data() as UserInfo;
          setUserInfo({
            name: data.name || auth.currentUser?.displayName || '',
            email: data.email || auth.currentUser?.email || '',
            photoURL: data.photoURL || auth.currentUser?.photoURL || '',
            age: data.age || 0,
            height: data.height || '',
            weight: data.weight || '',
            bloodType: data.bloodType || '',
          });
        } else if (auth.currentUser) {
          const { displayName, email, photoURL } = auth.currentUser;
          setUserInfo({
            name: displayName || '',
            email: email || '',
            photoURL: photoURL || '',
            age: 0,
            height: '',
            weight: '',
            bloodType: '',
          });
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
    };

    fetchProfile();
  }, [uid]);

  const handleSave = async () => {
    if (!uid) {
      Alert.alert(i18n.t('error'), i18n.t('notLoggedIn'));
      return;
    }

    try {
      await setDoc(doc(db, 'users', uid), userInfo);
      Alert.alert(i18n.t('success'), i18n.t('profileUpdated'));
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
      Alert.alert(i18n.t('error'), i18n.t('updateFailed'));
    }
  };

  const editableFields: EditableField[] = ['age', 'height', 'weight', 'bloodType'];

  const handleLogout = () => {
    Alert.alert(i18n.t('logout'), i18n.t('logoutConfirm'), [
      { text: i18n.t('cancel'), style: 'cancel' },
      {
        text: i18n.t('logout'),
        style: 'destructive',
        onPress: () => {
          router.replace('/modals/login');
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/back.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.header}>
          {userInfo.photoURL ? (
            <Image source={{ uri: userInfo.photoURL }} style={styles.avatar} />
          ) : (
            <MaterialIcons name="person" size={60} color="#fff" />
          )}
          <Text style={styles.name}>{userInfo.name}</Text>
          <Text style={styles.email}>{userInfo.email}</Text>
          <TouchableOpacity style={styles.editButton} onPress={isEditing ? handleSave : () => setIsEditing(true)}>
            <MaterialIcons name={isEditing ? 'save' : 'edit'} size={20} color="#0066cc" />
            <Text style={styles.editButtonText}>
              {isEditing ? i18n.t('save') : i18n.t('editProfile')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.t('healthInformation')}</Text>
          {editableFields.map((field) => (
            <View style={styles.infoRow} key={field}>
              <Text style={styles.infoLabel}>{i18n.t(field)}</Text>
              {isEditing ? (
                <TextInput
                  style={styles.infoInput}
                  value={userInfo[field]?.toString()}
                  keyboardType={field === 'age' ? 'numeric' : 'default'}
                  onChangeText={(value) =>
                    setUserInfo((prev) => ({
                      ...prev,
                      [field]: field === 'age' ? parseInt(value) || 0 : value,
                    }))
                  }
                />
              ) : (
                <Text style={styles.infoValue}>
                  {field === 'age' ? `${userInfo.age} ${i18n.t('years')}` : userInfo[field]}
                </Text>
              )}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.t('settings')}</Text>
          <View style={styles.settingRow}>
            <MaterialIcons name="notifications" size={24} color="#FF9800" />
            <Text style={styles.settingLabel}>{i18n.t('pushNotifications')}</Text>
            <Switch value={notifications} onValueChange={setNotifications} />
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={24} color="white" />
          <Text style={styles.logoutButtonText}>{i18n.t('logout')}</Text>
        </TouchableOpacity>
      </ImageBackground>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1 },
  header: {
    alignItems: 'center',
    backgroundColor: '#0066cc',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  email: {
    fontSize: 16,
    color: '#ddd',
    marginBottom: 10,
  },
  editButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  editButtonText: {
    marginLeft: 6,
    color: '#0066cc',
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 10,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  infoInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#0066cc',
    textAlign: 'right',
    minWidth: 80,
    color: '#000',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  logoutButton: {
    margin: 20,
    backgroundColor: '#f44336',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 25,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
  },
});
