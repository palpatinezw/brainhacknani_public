
import React, { useState, useEffect } from "react";
import {
    Text, View, Button, TouchableOpacity, KeyboardAvoidingView, TextInput, Keyboard,
} from "react-native";
import { CommonActions } from '@react-navigation/native';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import ProtectedProfile from './ProtectedProfile'
import ProtectedExplore from './ProtectedExplore'
import ProtectedHome from './ProtectedHome'

import Ionicons from 'react-native-vector-icons/Ionicons'

const Tab = createBottomTabNavigator()

const Protected = ({ route, navigation }) => {
    const { username, password } = route.params
    return (
        <>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused, color, size }) => {
                        let iconName;

                        if (route.name === 'Home') {
                            iconName = focused ? 'home' : 'home-outline';
                        } else if (route.name === 'Explore') {
                            iconName = focused ? 'planet' : 'planet-outline'
                        } else if (route.name === 'Profile') {
                            iconName = focused ? 'person-circle' : 'person-circle-outline';
                        } // person-circle-outline

                        // You can return any component that you like here!
                        return <Ionicons name={iconName} size={size} color={color} />;
                    },
                })}
            >
                <Tab.Screen name="Home" component={ProtectedHome} initialParams={{username, password}} />
                <Tab.Screen name="Explore" component={ProtectedExplore} initialParams={{username, password}} />
                <Tab.Screen name="Profile" component={ProtectedProfile} initialParams={{username, password}} />
            </Tab.Navigator>
        </>
    )
}

export default Protected
