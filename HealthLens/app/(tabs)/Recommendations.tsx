import {Text, View, StyleSheet, ScrollView, TouchableOpacity, Image} from "react-native";
import {router} from 'expo-router';

const productCategories = [
  {
    id: 'skin',
    label: 'Skin',
    products: [
      { id: 1 }, {/*placeholder data, replace*/},
      { id: 2 },
      { id: 3 },
    ],
  },
  {
    id: 'hair',
    label: 'Hair',
    products: [
      { id: 4 },
      { id: 5 },
      { id: 6 },
    ],
  },
  {
    id: 'nails',
    label: 'Nails',
    products: [
      { id: 7 },
      { id: 8 },
      { id: 9 },
    ],
  },
];

export default function Recommendations() {
  const handleSubmitAnother = () => {
    router.push('/(tabs)/Diagnose');
  };

  return (
    <View style={styles.container}>
      {/*header*/}
      <View style={styles.header}>
        <Text style={styles.title}>Recommendations</Text>
        <Text style={styles.subtitle}>
          Based on your conditions these are the products we recommend that you try!
        </Text>
      </View>

      {/*scrollable product list*/}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {productCategories.map((category) => (
          <View key={category.id} style={styles.categorySection}>
            <Text style={styles.categoryLabel}>{category.label} →</Text>
            <View style={styles.productRow}>
              {category.products.map((product) => (
                <View key={product.id} style={styles.productCard} />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/*button at the bottom*/}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmitAnother}>
        <Text style={styles.submitButtonText}>Submit another photo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#A8C5A0',
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: '#333',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
    color: '#222',
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  productCard: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: '#E8EDD5',
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: '#F5F5DC',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});