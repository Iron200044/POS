import { View, Text, Modal, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import React, { useRef, useState } from 'react';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '@/constants/Colors';

interface CameraModalProps {
  isVisible: boolean;
  onClose: () => void;
  onImageSelected: (uri: string) => void;
}

export default function CameraModal(props: CameraModalProps) {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  const flip = async () => {
    setFacing(facing === 'back' ? 'front' : 'back');
  };

  const take = async () => {
    try {
      let result = await cameraRef.current?.takePictureAsync({
        quality: 0.8,
        base64: true,
      });

      if (result?.uri) {
        setCapturedImage(result.uri);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
    }
  };

  const open = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        setCapturedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const confirmSelection = () => {
    if (capturedImage) {
      props.onImageSelected(capturedImage);
      setCapturedImage(null);
      props.onClose();
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
  };

  const requestCameraPermission = async () => {
    const { status } = await requestPermission();
    return status === 'granted';
  };

  if (!permission) {
    return (
      <Modal visible={props.isVisible} animationType="slide">
        <SafeAreaView style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Cargando cámara...</Text>
          <TouchableOpacity style={styles.button} onPress={props.onClose}>
            <Text style={styles.buttonText}>Cerrar</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    );
  }

  if (!permission.granted) {
    return (
      <Modal visible={props.isVisible} animationType="slide">
        <SafeAreaView style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Necesitamos permiso para usar la cámara</Text>
          <TouchableOpacity style={styles.button} onPress={requestCameraPermission}>
            <Text style={styles.buttonText}>Dar permiso</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={props.onClose}>
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal visible={props.isVisible} animationType="slide">
      <SafeAreaView style={styles.container}>
        {capturedImage ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: capturedImage }} style={styles.previewImage} />
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={confirmSelection}>
                <Text style={styles.buttonText}>Confirmar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={resetCapture}>
                <Text style={styles.buttonText}>Volver a tomar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
              <View style={styles.cameraOverlay}>
                <View style={styles.topButtonsContainer}>
                  <TouchableOpacity style={styles.closeButton} onPress={props.onClose}>
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.flipButton} onPress={flip}>
                    <Text style={styles.flipButtonText}>⟳</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.bottomButtonsContainer}>
                  <TouchableOpacity style={styles.captureButton} onPress={take}>
                    <View style={styles.captureButtonInner} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.galleryButton} onPress={open}>
                    <Text style={styles.galleryButtonText}>Galería</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </CameraView>
          </>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  topButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  bottomButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 30,
  },
  captureButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  galleryButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  galleryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 20,
  },
  flipButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipButtonText: {
    color: '#fff',
    fontSize: 20,
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  previewImage: {
    width: '100%',
    height: '70%',
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#888',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  permissionText: {
    fontSize: 18,
    color: colors.buttonText,
    textAlign: 'center',
    marginBottom: 20,
  },
});