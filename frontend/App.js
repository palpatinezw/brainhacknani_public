import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";

import Login from './components/Login'
import Register from './components/Register'

import Protected from './components/Protected'

const Stack = createStackNavigator()

export default function App() {

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="login">
        <Stack.Screen name='login' component = {Login} options={{ title: 'Login' }}/>
        <Stack.Screen name='register' component = {Register} options={{ title: 'Register' }}/>

        <Stack.Screen name='ProtectedHome' component = {Protected} options={{ title: 'Sigma' }} headerLeft={()=> null}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
