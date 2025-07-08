import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import messaging from '@react-native-firebase/messaging';
import { addDoc, collection, deleteDoc, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import i18n from '../../i18n';
import { auth, db } from '../modals/firebaseConfig';

interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
}

export default function AppointmentsScreen() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointmentTime, setAppointmentTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showApptTimePicker, setShowApptTimePicker] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [medName, setMedName] = useState('');
  const [medTime, setMedTime] = useState(new Date());
  const [showMedPicker, setShowMedPicker] = useState(false);

  useEffect(() => {
    requestFCMPermission();
    fetchAppointmentsFromFirestore();

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert(remoteMessage.notification?.title || '', remoteMessage.notification?.body || '');
    });

    return unsubscribe;
  }, []);

  const requestFCMPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      const fcmToken = await messaging().getToken();
      console.log('✅ FCM Token:', fcmToken);
      const uid = auth.currentUser?.uid;
      if (uid && fcmToken) {
        await setDoc(doc(db, 'users', uid), { fcmToken }, { merge: true });
      }
    } else {
      Alert.alert('Permission required', 'Enable notification permissions to receive reminders.');
    }
  };

  const fetchAppointmentsFromFirestore = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const snapshot = await getDocs(collection(db, 'users', uid, 'appointments'));
    const fetched = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Appointment, 'id'>)
    }));
    setAppointments(fetched);
  };

  const saveAppointment = async () => {
    if (!newTitle || !selectedDate || !appointmentTime) {
      Alert.alert(i18n.t('missingInfo'), i18n.t('fillTitleDate'));
      return;
    }
    const combinedDate = new Date(selectedDate);
    combinedDate.setHours(appointmentTime.getHours());
    combinedDate.setMinutes(appointmentTime.getMinutes());

    const dateStr = combinedDate.toISOString().split('T')[0];
    const timeStr = combinedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    if (isEditing && editingId) {
      await updateDoc(doc(db, 'users', uid, 'appointments', editingId), {
        title: newTitle,
        date: dateStr,
        time: timeStr
      });
      setAppointments(prev => prev.map(appt => appt.id === editingId ? { ...appt, title: newTitle, date: dateStr, time: timeStr } : appt));
      setIsEditing(false);
      setEditingId(null);
      Alert.alert(i18n.t('updated'), i18n.t('appointmentUpdated'));
    } else {
      const docRef = await addDoc(collection(db, 'users', uid, 'appointments'), {
        title: newTitle,
        date: dateStr,
        time: timeStr
      });
      const newAppt = { id: docRef.id, title: newTitle, date: dateStr, time: timeStr };
      setAppointments(prev => [...prev, newAppt]);
      Alert.alert(i18n.t('scheduled'), `Appointment added: ${newAppt.title} at ${timeStr} on ${newAppt.date}`);
    }
    setNewTitle('');
  };

  const editAppointment = (id: string) => {
    const appt = appointments.find(a => a.id === id);
    if (appt) {
      setNewTitle(appt.title);
      setSelectedDate(new Date(appt.date));
      const timeParts = appt.time.split(/[:\s]/);
      const hours = parseInt(timeParts[0]);
      const minutes = parseInt(timeParts[1]);
      const isPM = timeParts[2] === 'PM';
      const newTime = new Date();
      newTime.setHours(isPM && hours < 12 ? hours + 12 : hours);
      newTime.setMinutes(minutes);
      setAppointmentTime(newTime);
      setIsEditing(true);
      setEditingId(id);
    }
  };

  const deleteAppointment = (id: string) => {
    Alert.alert(i18n.t('delete'), i18n.t('deleteConfirm'), [
      { text: i18n.t('cancel'), style: 'cancel' },
      {
        text: i18n.t('delete'),
        style: 'destructive',
        onPress: async () => {
          const uid = auth.currentUser?.uid;
          if (uid) {
            await deleteDoc(doc(db, 'users', uid, 'appointments', id));
            setAppointments(prev => prev.filter(item => item.id !== id));
          }
        }
      }
    ]);
  };

  const scheduleMedication = async () => {
    if (!medName || !medTime) {
      Alert.alert('Missing Info', 'Please enter medication name and time.');
      return;
    }
    const uid = auth.currentUser?.uid;
    if (uid) {
      await addDoc(collection(db, 'users', uid, 'medications'), {
        name: medName,
        time: medTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }

    Alert.alert('Scheduled', `Daily reminder to take: ${medName}`);
    setMedName('');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ImageBackground source={require('../../assets/images/back.png')} style={styles.background} resizeMode="cover">
          <View style={styles.overlay}>
            <Text style={styles.headerTitle}>{i18n.t('appointments')}</Text>

            <Text style={styles.sectionTitle}>📅 {i18n.t('appointmentReminder')}</Text>
            <FlatList
              data={appointments}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.item}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemDate}>{item.date} {item.time ? `@ ${item.time}` : ''}</Text>
                  </View>
                  <TouchableOpacity onPress={() => editAppointment(item.id)}>
                    <MaterialIcons name="edit" size={24} color="orange" style={{ marginRight: 10 }} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteAppointment(item.id)}>
                    <MaterialIcons name="delete" size={24} color="red" />
                  </TouchableOpacity>
                </View>
              )}
            />

            <View style={styles.inputRow}>
              <TextInput placeholder={i18n.t('title')} value={newTitle} onChangeText={setNewTitle} style={styles.input} />
              <TouchableOpacity onPress={() => setShowDatePicker(true)} style={[styles.input, { justifyContent: 'center' }]}>
                <Text>{selectedDate.toISOString().split('T')[0]}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowApptTimePicker(true)} style={[styles.input, { justifyContent: 'center' }]}>
                <Text>{appointmentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addButton} onPress={saveAppointment}>
                <MaterialIcons name={isEditing ? 'check' : 'add'} size={24} color="white" />
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>💊 {i18n.t('medicationReminder')}</Text>
            <View style={styles.inputRow}>
              <TextInput placeholder="Medicine Name" value={medName} onChangeText={setMedName} style={styles.input} />
              <TouchableOpacity onPress={() => setShowMedPicker(true)} style={[styles.input, { justifyContent: 'center' }]}>
                <Text>{medTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addButton} onPress={scheduleMedication}>
                <MaterialIcons name="alarm" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {showDatePicker && <DateTimePicker value={selectedDate} mode="date" display="default" onChange={(event, date) => { setShowDatePicker(false); if (date) setSelectedDate(date); }} />}
            {showApptTimePicker && <DateTimePicker value={appointmentTime} mode="time" display="default" onChange={(event, time) => { setShowApptTimePicker(false); if (time) setAppointmentTime(time); }} />}
            {showMedPicker && <DateTimePicker value={medTime} mode="time" display="default" onChange={(event, time) => { setShowMedPicker(false); if (time) setMedTime(time); }} />}
          </View>
        </ImageBackground>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, opacity: 0.8 },
  overlay: { flex: 1, padding: 20 },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0066cc',
    textAlign: 'center',
    marginVertical: 20
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 5,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#444'
  },
  item: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2
  },
  itemTitle: { fontSize: 16, fontWeight: 'bold' },
  itemDate: { color: '#666' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 10,
    elevation: 2
  },
  addButton: {
    backgroundColor: '#0066cc',
    padding: 10,
    borderRadius: 10,
    elevation: 2
  }
});
