import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from './src/screens/Home';
import AppointmentScreen from './src/screens/AppointmentScreen';
import DietPlanScreen from './src/screens/DietPlanScreen';
import ChatbotScreen from './src/screens/ChatbotScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Appointments" component={AppointmentScreen} />
        <Tab.Screen name="Diet Plan" component={DietPlanScreen} />
        <Tab.Screen name="Chatbot" component={ChatbotScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
