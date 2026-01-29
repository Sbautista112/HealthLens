import { Fontisto } from '@expo/vector-icons';
import { CameraCapturedPicture } from 'expo-camera';
import React, { useState } from 'react'
import { TouchableOpacity, Image, StyleSheet, View, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { uploadImageToFirebase } from '@/uploadImage';

const PhotoPreviewSection = ({
    photo,
    handleRetakePhoto,
    onUploadComplete
}: {
    photo: CameraCapturedPicture;
    handleRetakePhoto: () => void;
    onUploadComplete: () => void;
}) => {
    const [uploaded, setUploaded] = useState(false);

    const handleUpload = async () => {
        if (uploaded) return;
        
        setUploaded(true);
        onUploadComplete();
        
        uploadImageToFirebase(photo.uri).then(result => {
            if (result.success) {
                setTimeout(() => {
                    Alert.alert('Success!', 'Image uploaded successfully');
                }, 500);
            }
        }).catch(error => {
            console.error('Upload error:', error);
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.box}>
                <Image
                    style={styles.previewContainer}
                    source={{uri: photo.uri}}
                    resizeMode="contain"
                />
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity 
                    style={styles.button} 
                    onPress={handleRetakePhoto}
                >
                    <Fontisto name='trash' size={36} color='black' />
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.button, styles.uploadButton]} 
                    onPress={handleUpload}
                >
                    <Fontisto name='cloud-up' size={36} color='white' />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: 'black',
        alignItems: 'center',
        justifyContent: 'center',
    },
    box: {
        borderRadius: 15,
        padding: 10,
        width: '95%',
        flex: 1,
        backgroundColor: 'darkgray',
        justifyContent: 'center',
        alignItems: "center",
        marginVertical: 20,
    },
    previewContainer: {
        width: '100%',
        height: '100%',
        borderRadius: 15,
    },
    buttonContainer: {
        marginTop: '4%',
        flexDirection: 'row',
        justifyContent: "space-around",
        width: '100%',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    button: {
        backgroundColor: 'gray',
        borderRadius: 25,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadButton: {
        backgroundColor: '#4CAF50',
    }
});

export default PhotoPreviewSection;