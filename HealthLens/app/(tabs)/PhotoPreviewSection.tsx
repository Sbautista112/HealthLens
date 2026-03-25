import { Fontisto } from "@expo/vector-icons";
import { CameraCapturedPicture } from "expo-camera";
import React, { useState } from "react";
import { TouchableOpacity, Image, StyleSheet, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { uploadImageToFirebase } from "@/api/uploadImage";

const PhotoPreviewSection = ({
  photo,
  handleRetakePhoto,
  onUploadComplete,
}: {
  photo: CameraCapturedPicture;
  handleRetakePhoto: () => void;
  onUploadComplete: () => void;
}) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (uploading) return;
    setUploading(true);

    try {
      await uploadImageToFirebase(photo.uri);
      Alert.alert("Success", "Image uploaded successfully");
      onUploadComplete();
    } catch {
      Alert.alert("Error", "Upload failed");
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.box}>
        <Image source={{ uri: photo.uri }} style={styles.previewContainer} resizeMode="contain" />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleRetakePhoto}>
          <Fontisto name="trash" size={36} color="black" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.uploadButton]}
          onPress={handleUpload}
          disabled={uploading}
        >
          <Fontisto name="cloud-up" size={36} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },
  box: {
    borderRadius: 15,
    padding: 10,
    width: "95%",
    flex: 1,
    backgroundColor: "darkgray",
    marginVertical: 20,
  },
  previewContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 15,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "gray",
    borderRadius: 25,
    padding: 10,
  },
  uploadButton: {
    backgroundColor: "#4CAF50",
  },
});

export default PhotoPreviewSection;
