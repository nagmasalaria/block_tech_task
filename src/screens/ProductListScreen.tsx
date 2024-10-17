import {
  ActivityIndicator,
  Dimensions,
  Image,
  LayoutAnimation,
  NativeScrollEvent,
  NativeSyntheticEvent,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import {RefreshControl, TextInput} from 'react-native-gesture-handler';
import {angleDown, favoriteFilledIcon, favoriteIcon} from '../assets';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const screenWidth = Dimensions.get('screen').width;
const screenHeight = Dimensions.get('screen').height;

//constants
const GET_PRODUCTS = `https://dummyjson.com/products`;
const GET_CATEGORIES = `${GET_PRODUCTS}/categories`;
const GET_PRODUCTS_BY_CATEGORIES = `${GET_PRODUCTS}/category/:category_name`;
const SEARCH_PRODUCTS = `${GET_PRODUCTS}/search`;

interface SectionHeaderPropTypes {
  openedSections?: string[];
  title?: string;
  slug?: string;
  onPress?: (v: any) => void;
}
const SectionHeader = ({
  openedSections = [],
  title = '',
  slug = '',
  onPress = () => {},
}: SectionHeaderPropTypes) => (
  <TouchableOpacity
    activeOpacity={1}
    onPress={() => onPress(slug)}
    style={styles.sectionHeaderContainer}>
    <Text style={styles.sectionHeader}>{title}</Text>
    <Image
      source={angleDown}
      style={{
        transform: openedSections.includes(slug)
          ? [{rotate: '180deg'}]
          : [{rotate: '0deg'}],
        height: 22,
        width: 22,
        tintColor: 'white',
      }}
    />
  </TouchableOpacity>
);

interface SectionContentPropTypes {
  data?: any;
  onPress?: (a: any) => void;
  onFavoriteClick?: (a: any) => void;
  favorites?: any;
}

const SectionContent = ({
  data = [],
  onPress = () => {},
  onFavoriteClick = () => {},
  favorites = [],
}: SectionContentPropTypes) => {
  const isFavorite = (product: any) =>
    favorites.some((fav: any) => fav.id === product.id);
  return data.length > 0 ? (
    data.map((item: any) => (
      <TouchableOpacity
        key={item.id}
        onPress={() => onPress(item)}
        style={styles.productItem}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View style={styles.productImageContainer}>
            <Image source={{uri: item.thumbnail}} style={styles.productImage} />
          </View>
          <View>
            <Text numberOfLines={1} style={styles.productTitle}>
              {item.title}
            </Text>
            <Text style={styles.productPrice}>${item.price}</Text>
            <View style={styles.productInfoRow}>
              <Text style={styles.productRating}>Rating: {item.rating}</Text>
              <TouchableOpacity onPress={() => onFavoriteClick(item)}>
                {isFavorite(item) ? (
                  <Image
                    source={favoriteFilledIcon}
                    style={styles.favoriteIconFilled}
                  />
                ) : (
                  <Image source={favoriteIcon} style={styles.favoriteIcon} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    ))
  ) : (
    <></>
  );
};

const ProductListScreen = () => {
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<any>([]);
  const [productsAll, setProductsAll] = useState<any>([]);
  const [categories, setCategories] = useState<any>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [categoriesFetched, setCategoriesFetched] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isInternetConnected, setIsInternetConnected] =
    useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [hasScrolled, setHasScrolled] = useState<boolean>(false);

  const navigation: any = useNavigation();
  // Enable Layout Animation for SectionList Transitions
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  const loadFavorites = async () => {
    const savedFavorites = await AsyncStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  };

  const handleEndReached = () => {
    if (!loading && hasMore && hasScrolled) {
      fetchCatgories(page + 1);
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;
    const isAtBottom =
      contentOffset.y + layoutMeasurement.height >= contentSize.height - 50;

    if (isAtBottom && !hasScrolled) {
      setHasScrolled(true);
    }
  };

  // Toggle Favorite
  const toggleFavorite = async (product: any) => {
    let updatedFavorites = [...favorites];
    if (favorites.some(fav => fav.id === product.id)) {
      updatedFavorites = updatedFavorites.filter(fav => fav.id !== product.id);
    } else {
      updatedFavorites.push(product);
    }
    setFavorites(updatedFavorites);
    await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites)); // Save to AsyncStorage
  };

  //fetch all categories
  const fetchCatgories = async (page = 1) => {
    if (loading) return;
    try {
      setLoading(true);
      const response = await axios.get(`${GET_CATEGORIES}?skip=${page * 7}`);
      if (response.status === 200) {
        setCategories(response.data);
        if (response.data.length === categories.length) {
          setHasMore(false);
        }
      }
      setLoading(false);
    } catch (error) {
      console.log('Error while fetching categories.', error);
      setLoading(false);
    }
  };

  const fetchProductsByCategory = async (category: string, page = 1) => {
    if (loading || !category) return; //if already serving a request

    try {
      setLoading(true);

      const response = await axios.get(
        GET_PRODUCTS_BY_CATEGORIES.replace(':category_name', category),
      );

      if (response.status === 200) {
        setProducts(response.data.products);
      }
      setLoading(false);
    } catch (error) {
      console.log('Error while fetching products by category.', error);
      setLoading(false);
    }
  };

  const toggleSection = async (category: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (expandedSections.includes(category)) {
      const updatedSections = expandedSections.filter(
        section => section !== category,
      );
      setExpandedSections(updatedSections);
    } else {
      setExpandedSections((prev: any) => [...prev, category]);
      setProducts([]);
      fetchProductsByCategory(category);
    }
  };

  const loadPersistedData = async () => {
    const savedCategories = await AsyncStorage.getItem('persistedCategories');
    const savedProducts = await AsyncStorage.getItem('persistedProducts');
    if (savedCategories && savedProducts) {
      setCategories(JSON.parse(savedCategories));
      setProducts(JSON.parse(savedProducts));
      loadFavorites();
    }
  };

  const filterProductsOnSearch = async (query: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`${SEARCH_PRODUCTS}?q=${query}`);
      if (response.status === 200) {
        const filtered: any = response.data.products.map(
          (p: any) => p.category,
        );
        const filteredCategories: any = [...new Set(filtered)];
        const savedCats: any = await AsyncStorage.getItem(
          'persistedCategories',
        );
        const categoriesFetched = JSON.parse(savedCats).filter((c: any) =>
          filteredCategories.includes(c.slug),
        );
        setCategories(categoriesFetched);
        setExpandedSections(filteredCategories);
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error('Error searching products:', error);
    }
    setLoading(false);
  };

  // inital functions
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        fetchCatgories();
      } else {
        loadPersistedData();
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      const cat_slug = products.map((p: any) => p.category)[0];
      const isExist = productsAll.some((ap: any) => ap.category === cat_slug);
      if (!isExist) {
        setProductsAll((prev: any) => [...prev, ...products]);
      }
    }
  }, [products]);

  // inital functions
  useEffect(() => {
    async function savePersistData() {
      if (productsAll.length < 0) {
        await AsyncStorage.setItem(
          'persistedProducts',
          JSON.stringify(productsAll),
        );
      }
      if (categories.length < 0) {
        await AsyncStorage.setItem(
          'persistedCategories',
          JSON.stringify(categories),
        );
      }
    }
    savePersistData();
  }, [productsAll]);

  const sections = useMemo(() => {
    const sectionsData = categories.map((category: any) => ({
      title: category.name,
      slug: category.slug,
      data:
        expandedSections.length > 0 && expandedSections.includes(category.slug)
          ? searchQuery && searchQuery.length > 0
            ? productsAll.filter((p: any) => p.category === category.slug)
            : products.filter((p: any) => p.category === category.slug)
          : [],
    }));
    return sectionsData;
  }, [categories, searchQuery, productsAll, products, expandedSections]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCatgories();
    setRefreshing(false);
  };

  return (
    <View style={{padding: 16}}>
      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search products..."
        placeholderTextColor="#bbbbbb"
        onChangeText={async (txt: string) => {
          if (txt && txt.length > 0) {
            const tmOut = setTimeout(async () => {
              filterProductsOnSearch(txt.trim());
              setProducts([]);
              clearTimeout(tmOut);
            }, 100);
          } else {
            setExpandedSections([]);
            setProducts([]);
            fetchCatgories();
          }
        }}
      />
      <SectionList
        sections={sections}
        renderItem={({section}) => <></>}
        renderSectionHeader={({section: {slug, title, data}}: any) => (
          <View
            style={{
              flex: 1,
            }}>
            <SectionHeader
              openedSections={expandedSections}
              title={title}
              slug={slug}
              onPress={category_slug => toggleSection(category_slug)}
            />
            <View
              style={{
                backgroundColor: 'lightgrey',
                marginTop: data.length > 0 ? -16 : 0,
                marginBottom: 10,
                padding: data.length > 0 ? 12 : 0,
                zIndex: 5,
              }}>
              <SectionContent
                data={data}
                favorites={favorites}
                onFavoriteClick={item => toggleFavorite(item)}
                onPress={product => {
                  navigation.navigate('ProductDetails', {
                    productId: product.id,
                  });
                }}
              />
            </View>
          </View>
        )}
        onScroll={handleScroll}
        onEndReached={handleEndReached}
        onEndReachedThreshold={1}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListFooterComponent={
          loading ? <ActivityIndicator size="large" color="#000" /> : null
        }
      />
    </View>
  );
};

export default ProductListScreen;

const styles = StyleSheet.create({
  productImageContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginRight: 18,
    borderColor: '#d5d5d5',
    borderWidth: 1,
  },
  productImage: {
    height: 60,
    width: 60,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  sectionHeaderContainer: {
    backgroundColor: '#0c63e7',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 9,
    marginBottom: 10,
    padding: 14,
    zIndex: 10,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  productItem: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginVertical: 10,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    width: screenWidth - 150,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FF5722',
    marginTop: 5,
  },
  productInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingRight: 16,
  },
  productRating: {
    fontSize: 14,
    color: '#777',
  },
  favoriteIcon: {
    width: 20,
    height: 20,
  },
  favoriteIconFilled: {
    width: 20,
    height: 20,
    tintColor: '#dc3545',
  },
  searchBar: {
    backgroundColor: '#fff',
    padding: 16,
    color: '#222',
    fontSize: 16,
    borderRadius: 10,
    marginBottom: 15,
    borderColor: '#d5d5d5',
    borderWidth: 1,
  },
});
