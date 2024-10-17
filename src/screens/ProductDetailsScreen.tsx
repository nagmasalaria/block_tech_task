import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';

const ProductDetailsScreen: React.FC = ({route}: any) => {
  const {productId} = route.params;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axios.get(
          `https://dummyjson.com/products/${productId}`,
        );
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product details:', error);
      }
      setLoading(false);
    };
    fetchProductDetails();
  }, [productId]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.loaderContainer}>
        <Text>Product not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Product Image */}
      <View style={styles.productImageContainer}>
        <Image source={{uri: product.thumbnail}} style={styles.productImage} />
      </View>

      {/* Product Title */}
      <Text style={styles.productTitle}>{product.title}</Text>

      {/* Product Price */}
      <Text style={styles.productPrice}>${product.price}</Text>

      {/* Product Rating */}
      <View style={styles.ratingContainer}>
        <Text style={styles.productRating}>Rating: {product.rating}</Text>
        {/* Optional: Add star icons for better visuals */}
      </View>

      {/* Availability */}
      <Text style={styles.availability}>
        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
      </Text>

      {/* Product Description */}
      <Text style={styles.productDescription}>{product.description}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  productImageContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 16,
    shadowColor: '#000',
    elevation: 8,
    padding : 16,
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 1},
  },
  productImage: {
    width: '100%',
    height: 300,
    marginBottom: 20,
    resizeMode: 'cover', // Ensure the image covers the area nicely
  },
  container: {
    flex: 1,
    backgroundColor: '#f3f3f3',
    padding: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
 
  productTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  productPrice: {
    fontSize: 20,
    color: '#FF5722', // Highlight the price with orange
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  productRating: {
    fontSize: 16,
    color: '#777',
  },
  availability: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32', // Green color for "In Stock", can change for "Out of Stock"
    marginBottom: 20,
  },
  productDescription: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    marginBottom: 30,
  },
});

export default ProductDetailsScreen;
