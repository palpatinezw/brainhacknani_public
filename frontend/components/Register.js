import React, { useState, useEffect } from "react";
import {
    Text, View, Button, TouchableOpacity, KeyboardAvoidingView, TextInput, Keyboard, Pressable
} from "react-native";
import Spinner from 'react-native-loading-spinner-overlay'
import { CommonActions } from '@react-navigation/native'

import tailwind from 'tailwind-rn'

const Register = ({ navigation, setUsername, setPassword }) => {

  const [formUsername, setFormUsername] = useState();
  const [formPassword, setFormPassword] = useState();
  const [isLoading, setIsLoading] = useState()

  function handleRegister(){
    setIsLoading(true)
    Keyboard.dismiss();
    fetch('https:/flyyee-brainhackserver.herokuapp.com/create?username='+formUsername+'&password='+formPassword)
    .then(response => response.json())
    .then(data => {
        setIsLoading(false)
        if ((data.info === "created user") || (data.info === "user already exists")) {
            navigation.dispatch(CommonActions.reset({
                index: 0,
                routes: [{ name: 'ProtectedHome', params:{formUsername, formPassword}}],
            }));
        }
    })
  }

  return (
    <View style={tailwind('flex justify-center items-center h-full')}>
      <Text style={tailwind('pt-2 pb-1 text-gray-700 text-4xl font-bold text-blue-700 border-t-4 border-b-4 border-blue-300')}>Σіgма</Text>

      <Text style={tailwind('mt-8 text-gray-700 text-left w-64')}>Set Username</Text>
      <TextInput
          style={tailwind('px-2 py-1 mt-2 border-2 border-gray-500 w-64 rounded')} placeholder = {'Username'} value = {null}
          onChangeText ={(text) => setFormUsername(text)}
      />

      <Text style={tailwind('mt-2 text-gray-700 text-left w-64')}>Set Password</Text>
      <TextInput
        secureTextEntry={true} style={tailwind('px-2 py-1 mt-2 border-2 border-gray-500 w-64 rounded')} placeholder={'Password'} value = {null}
        onChangeText ={(text) => setFormPassword(text)}
      />

      <View style={tailwind('flex flex-row mt-8 w-64')}>
          <Pressable style={tailwind('flex-grow py-1 bg-blue-500 border-2 border-blue-500 rounded')} onPress={() => handleRegister()}>
              <Text style={tailwind('text-center text-white')}>Register</Text>
          </Pressable>
          <Pressable
            style={tailwind('flex-grow ml-2 py-1 bg-white border-2 border-blue-500 rounded')}
            onPress={() => {
                navigation.dispatch(CommonActions.reset({index: 0, routes: [{ name: 'login'}],}))
            }}
          >
              <Text style={tailwind('text-center text-blue-500')}>Login</Text>
          </Pressable>
      </View>
      <Spinner visible={isLoading} textContent='Loading' textStyle={tailwind('text-white text-sm')}/>
    </View>
  )
}

export default Register
