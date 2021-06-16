import { setStatusBarBackgroundColor, StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import {
    Text, View, Button, TouchableOpacity, KeyboardAvoidingView, TextInput, Keyboard, Pressable
} from "react-native";
import Spinner from 'react-native-loading-spinner-overlay';
import { CommonActions } from '@react-navigation/native';

import tailwind from 'tailwind-rn'

const Login = ({ navigation }) => {

  const [password, setPassword] = useState()
  const [username, setUsername] = useState()
  const [isLoading, setIsLoading] = useState()

  function handleLogin(){

    setIsLoading(true)
    Keyboard.dismiss()
    fetch('https:/flyyee-brainhackserver.herokuapp.com/login?username='+username+'&password='+password)
    .then(response => response.json())
    .then(data => {
        console.log(username)
        console.log(password)
        setIsLoading(false)
        if (data.success === 1) {
            navigation.dispatch(CommonActions.reset({
                index: 0,
                routes: [{ name: 'ProtectedHome', params:{username, password}}],
            }))
        } else {
            console.log(false)
        }
    })
  }

  return (
    <View style={tailwind('flex justify-center items-center h-full')}>
      <Text style={tailwind('pt-2 pb-1 text-gray-700 text-4xl font-bold text-blue-700 border-t-4 border-b-4 border-blue-300')}>Σіgма</Text>

      <Text style={tailwind('mt-8 text-gray-700 text-left w-64')}>Username</Text>
      <TextInput style={tailwind('px-2 py-1 mt-2 border-2 border-gray-500 w-64 rounded')} value = {null}  placeholder={'Enter your username'}
        onChangeText ={(text) => setUsername(text)} />

      <Text style={tailwind('mt-2 text-gray-700 text-left w-64')}>Password</Text>
      <TextInput secureTextEntry={true} style={tailwind('px-2 py-1 mt-2 border-2 border-gray-500 w-64 rounded')} placeholder={'Enter your password'} value = {null}
      onChangeText ={(text) => setPassword(text)} />

      <View style={tailwind('flex flex-row mt-8 w-64')}>
          <Pressable style={tailwind('flex-grow py-1 bg-blue-500 border-2 border-blue-500 rounded')} onPress={() => handleLogin()}>
              <Text style={tailwind('text-center text-white')}>Login</Text>
          </Pressable>
          <Pressable
            style={tailwind('flex-grow ml-2 py-1 bg-white border-2 border-blue-500 rounded')}
            onPress={() => {
                navigation.dispatch(CommonActions.reset({index: 0, routes: [{ name: 'register'}],}))
            }}
          >
              <Text style={tailwind('text-center text-blue-500')}>Register</Text>
          </Pressable>
          <Spinner visible={isLoading} textContent='Loading...' textStyle={tailwind('text-white text-sm')}/>
      </View>

    </View>
  )
}

export default Login
