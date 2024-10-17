import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import ProductListScreen from './src/screens/ProductListScreen';
import ProductDetailsScreen from './src/screens/ProductDetailsScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="ProductList"
        screenOptions={{
          headerBackTitleVisible: false,
          headerTitleAlign: 'center',
        }}>
        <Stack.Screen
          options={{
            headerTitle: 'Product List',
          }}
          name="ProductList"
          component={ProductListScreen}
        />
        <Stack.Screen
          options={{
            headerTitle: 'Product Details',
          }}
          name="ProductDetails"
          component={ProductDetailsScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
