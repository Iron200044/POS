import { View, Text, Modal, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { CameraType, CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { auth, db } from '@/utils/firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

interface CameraModalProps {
  isVisible: boolean;
  onClose: () => void;
  onScanned?: (mesa: string) => void; // Nuevo callback opcional
}

export default function CameraModal({ isVisible, onClose, onScanned }: CameraModalProps) {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  const flip = () => {
    setFacing(facing === 'back' ? 'front' : 'back');
  };

  const handleQRCodeScanned = async (result: BarcodeScanningResult) => {
    if (scanned) return;

    const mesa = result.data.trim();
    setScanned(true);

    const user = auth.currentUser;

    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { mesa });
        Alert.alert('Mesa asignada', `Mesa ${mesa} guardada con éxito`);

        if (onScanned) {
          onScanned(mesa); // Llama al callback para que el padre lo use si quiere
        }

        onClose();
      } catch (error) {
        Alert.alert('Error', 'Hubo un problema al guardar la mesa');
        setScanned(false);
      }
    }
  };

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Se necesita permiso de cámara para escanear códigos QR.</Text>
      </View>
    );
  }

  return (
    <Modal visible={isVisible} animationType="slide">
      <View style={{ flex: 1 }}>
        <CameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          facing={facing}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={scanned ? undefined : handleQRCodeScanned}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              padding: 20,
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
          >
            <TouchableOpacity onPress={flip}>
              <Text style={{ color: '#fff' }}>Cambiar cámara</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setScanned(false);
                onClose();
              }}
            >
              <Text style={{ color: '#fff' }}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    </Modal>
  );
}
