import { Text, View, StyleSheet, TouchableOpacity, Alert, Platform } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useState, useRef } from "react";
import PhotoPreviewSection from "./PhotoPreviewSection";

export default function Diagnose() {
  const [facing, setFacing] = useState<CameraType>("front");
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<any>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const cameraRef = useRef<CameraView | null>(null);

  const handleStartCamera = async () => {
    if (!permission || !permission.granted) {
      const result = await requestPermission();
      if (!result || !result.granted) {
        Alert.alert("Permission Denied", "Camera permission is required to take photos.");
        return;
      }
    }

    setShowCamera(true);
  };

  const handleTakePhoto = async () => {
    if (cameraRef.current) {
      try {
        const options = {
          quality: 0.7,
          base64: false,
          exif: false,
        };
        const takenPhoto = await cameraRef.current.takePictureAsync(options);
        console.log("Photo taken:", takenPhoto);
        setPhoto(takenPhoto);
        setShowCamera(false);
      } catch (error) {
        console.error("Error taking photo:", error);
        Alert.alert("Error", "Failed to take photo: " + (error as Error).message);
      }
    } else {
      Alert.alert("Error", "Camera is not ready. Please try again.");
    }
  };

  const handleUploadComplete = () => {
    setPhoto(null);
    setShowCamera(false);
  };

  const handleRetakePhoto = () => {
    setPhoto(null);
    setShowCamera(true);
  };

  const handleCameraReady = () => {
    console.log("Camera is ready");
    setCameraError(null);
  };

  const handleCameraError = (error: any) => {
    console.error("Camera error:", error);
    setCameraError("Camera failed to start. Please check permissions and try again.");
  };

  if (photo) {
    return (
      <PhotoPreviewSection
        photo={photo}
        handleRetakePhoto={handleRetakePhoto}
        onUploadComplete={handleUploadComplete}
      />
    );
  }

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        {cameraError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{cameraError}</Text>
            <TouchableOpacity style={styles.redButton} onPress={() => setShowCamera(false)}>
              <Text style={styles.buttonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.cameraWrapper}>
              <CameraView
                style={styles.camera}
                facing={facing}
                ref={cameraRef}
                onCameraReady={handleCameraReady}
                onMountError={handleCameraError}
              />
            </View>
            <View style={styles.cameraButtonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowCamera(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.captureButton} onPress={handleTakePhoto}>
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Ready to take a photo?</Text>
      <TouchableOpacity style={styles.redButton} onPress={handleStartCamera}>
        <Text style={styles.buttonText}>Take Pic</Text>
      </TouchableOpacity>
      {Platform.OS === "web" && (
        <Text style={styles.hintText}>Make sure to allow camera access when prompted</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 30,
    textAlign: "center",
  },
  hintText: {
    fontSize: 14,
    color: "#666",
    marginTop: 20,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  redButton: {
    backgroundColor: "#e74c3c",
    paddingHorizontal: 50,
    paddingVertical: 20,
    borderRadius: 15,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  cameraWrapper: {
    flex: 1,
    width: "100%",
    maxWidth: Platform.OS === "web" ? 800 : "100%",
    alignSelf: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  cameraButtonContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  cancelButton: {
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#fff",
  },
  captureButtonInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#e74c3c",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 20,
  },
  errorText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
  },
});
