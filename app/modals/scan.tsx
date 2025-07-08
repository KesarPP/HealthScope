import { Camera, CameraType, CameraView } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function ScanScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePhoto = async () => {
    if (!cameraRef.current || loading) return;

    try {
      setLoading(true);
      const photo = await cameraRef.current.takePictureAsync({ skipProcessing: true });
      setCapturedUri(photo.uri); // Show preview

      const formData = new FormData();
      formData.append('file', {
        uri: photo.uri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      } as any);

      const response = await fetch('http://192.168.1.3:8081/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const result = await response.json();
      Alert.alert('Prediction', result.result);
    } catch (error: any) {
      console.error("Image upload failed:", error);
      Alert.alert('Error', 'Failed to capture or upload image');
    } finally {
      setLoading(false);
    }
  };

  const toggleCamera = () => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  const closePreview = () => {
    setCapturedUri(null);
  };

  if (hasPermission === null) return <View />;
  if (hasPermission === false)
    return <Text style={styles.permissionText}>No access to camera</Text>;

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        enableTorch={false}
      />

      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={takePhoto} disabled={loading}>
          <Text style={styles.buttonText}>
            {loading ? 'Scanning...' : 'Scan'}
          </Text>
          {loading && <ActivityIndicator color="#fff" style={{ marginTop: 5 }} />}
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={toggleCamera} disabled={loading}>
          <Text style={styles.buttonText}>Flip</Text>
        </TouchableOpacity>
      </View>

      {/* Image Preview Modal */}
      <Modal visible={!!capturedUri} animationType="fade" transparent>
        <View style={styles.previewContainer}>
          {capturedUri && (
            <Image source={{ uri: capturedUri }} style={styles.previewImage} />
          )}
          <TouchableOpacity onPress={closePreview} style={styles.closeButton}>
            <Text style={styles.closeText}>Close Preview</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  controls: {
    position: 'absolute',
    bottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#333',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  permissionText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  previewImage: {
    width: '90%',
    height: '70%',
    borderRadius: 20,
    resizeMode: 'contain',
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#444',
    borderRadius: 8,
  },
  closeText: {
    color: '#fff',
    fontSize: 16,
  },
});
