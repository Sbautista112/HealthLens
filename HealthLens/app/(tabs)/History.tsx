import { Text, View, StyleSheet, Image, ScrollView, Dimensions, ActivityIndicator } from "react-native";
import { useState, useEffect } from 'react';
import { getImagesFromFirebase } from "@/uploadImage";

export default function History() {
  const screenHeight = Dimensions.get('window').height;
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadImages = async () => {
      try {
        const fetchedImages = await getImagesFromFirebase();
        console.log('Fetched images:', fetchedImages);
        setImages(fetchedImages);
      } catch (error) {
        console.error('Error loading images:', error);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, []); // Empty dependency array - only runs once

  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <Text style={styles.title}>User's Name</Text>
        <Text style={styles.subtitle}>Based on your recent results, you most likely have x disease.</Text>
      </View>

      <View style={styles.confidenceSection}>
        <Text>Confidence (X%)</Text>
        <View style={styles.confidenceBar}></View>
      </View>

      <View style={styles.historySection}>
        <Text style={styles.historyTitle}>Recent History</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
        ) : images.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No images yet. Take your first photo!</Text>
          </View>
        ) : (
          <ScrollView style={[styles.historyList, { height: screenHeight * 0.3 }]}>
            {images.map((item, index) => (
              <View key={item.id || index} style={styles.component}>
                <Image 
                  source={{ uri: item.imageUrl }} 
                  style={styles.thumbnail}
                />
                <View style={styles.componentInfo}>
                  <Text style={styles.componentText}>
                    {new Date(item.timestamp?.seconds * 1000).toLocaleDateString()}
                  </Text>
                  <Text style={styles.componentSubtext}>
                    {new Date(item.timestamp?.seconds * 1000).toLocaleTimeString()}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 60, 
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20, 
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  confidenceSection: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  historySection: {
    alignItems: 'center',
    width: '100%',
    flex: 1, 
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  historyList: {
    backgroundColor: '#E0D7D7',
    width: '100%',
    borderRadius: 8,
    padding: 10,
  },
  component: {
    backgroundColor: '#DEDCDC',
    width: '100%',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    backgroundColor: '#ccc',
  },
  componentInfo: {
    flex: 1,
  },
  componentText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  componentSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  confidenceBar: {
    width: '100%',
    backgroundColor: '#E0D7D7',
    height: 30,
  },
  loader: {
    marginTop: 20,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});