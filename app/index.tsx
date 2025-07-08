import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from 'react-native';
import { auth, db } from './modals/firebaseConfig'; // adjust path as needed

export default function SignupScreen() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    height: '',
    weight: '',
    allergies: '',
    bloodType: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleSignup = async () => {
    const { email, password, confirmPassword, age, height, weight, allergies, bloodType } = form;

    if (!email || !password || !confirmPassword || !age || !height || !weight || !bloodType) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, 'users', uid), {
        email,
        age: parseInt(age),
        height,
        weight,
        bloodType,
        allergies
      });

      // Redirect to login after signup
      router.replace('/modals/login');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        Alert.alert(
          'Account Exists',
          'An account with this email already exists. Redirecting to login...',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/modals/login'),
            },
          ]
        );
      } else {
        console.error('Signup Error:', err);
        Alert.alert('Signup Failed', err.message || 'Something went wrong.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/images/back.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Sign Up</Text>

        {[
          { key: 'email', placeholder: 'Email', keyboardType: 'email-address' },
          { key: 'password', placeholder: 'Password', secureTextEntry: true },
          { key: 'confirmPassword', placeholder: 'Confirm Password', secureTextEntry: true },
          { key: 'age', placeholder: 'Age', keyboardType: 'numeric' },
          { key: 'height', placeholder: 'Height (e.g., 170cm)' },
          { key: 'weight', placeholder: 'Weight (e.g., 65kg)' },
          { key: 'bloodType', placeholder: 'Blood Type (e.g., O+)' },
          { key: 'allergies', placeholder: 'Diseases/Allergies (Optional)' }
        ].map(({ key, ...props }) => (
          <TextInput
            key={key}
            style={styles.input}
            placeholder={props.placeholder}
            placeholderTextColor="white"
            secureTextEntry={props.secureTextEntry}
            keyboardType={props.keyboardType as any}
            value={form[key as keyof typeof form]}
            onChangeText={(text) => handleChange(key as keyof typeof form, text)}
          />
        ))}

        <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </TouchableOpacity>
          <Text style={styles.tile}>Already have an account?</Text>
        <TouchableOpacity style={styles.button}  onPress={() => router.push('/modals/login')} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    opacity: 0.9,
    height: '100%',
    width: '100%',
    justifyContent: 'center'
  },
  container: {
    paddingTop: 100,
    paddingLeft:40,
    paddingRight:20
  },
  title: {
    fontSize: 32,
    color: 'white',
    textAlign: 'center',
    marginBottom: 24
  },
  tile:
  {
    fontSize:25,
    color: 'white',
    textAlign:'center'
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    color: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.2)'
  },
  button: {
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12
  },
  buttonText: {
    color: 'white',
    fontSize: 18
  }
});
