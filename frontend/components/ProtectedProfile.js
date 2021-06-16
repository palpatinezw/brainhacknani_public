import React, { useState } from 'react'
import { View, Text, TouchableOpacity, KeyboardAvoidingView, TextInput, Keyboard, Pressable } from "react-native";
import tailwind from 'tailwind-rn'
import Ionicons from 'react-native-vector-icons/Ionicons'

const ProtectedProfile = ({ route, navigation }) => {
    const { username, password } = route.params

    const [isEditing, setIsEditing] = useState(false)

    return (
        <View style={tailwind('px-6 py-4')}>

            <View style = {tailwind('flex flex-row items-center')}>
               <Ionicons name='person-circle' size={120} color='#6B7280'/>
                <View style={tailwind('flex flex-col flex-grow')}>
                    <TextInput style = {tailwind('text-gray-800 text-lg border-b-2 pb-1 w-full')} placeholder={"Your name..."} onFocus={() => setIsEditing(true)}></TextInput>
                    <Text style = {tailwind('text-gray-800 text-sm')}>@{username}</Text>
                    { isEditing ? (
                        <Pressable style={tailwind('mt-1 py-0.5 bg-blue-500 rounded')} onPress={() => {Keyboard.dismiss(); setIsEditing(false)}}>
                            <Text style={tailwind('text-center text-white text-sm')}>Save</Text>
                        </Pressable>
                    ) : (null)}
                </View>

            </View>

            <Text style = {tailwind('text-xl font-bold')}>About Me</Text>
            <TextInput style = {tailwind('border-2 rounded-lg px-3 py-2 mt-4') } placeholder={'A short bio...'} minHeight={120} textAlignVertical={'top'} multiline={true} onFocus={() => setIsEditing(true)}>
            </TextInput>

            <Text style = {tailwind('text-xl font-bold mt-6')}>Socials</Text>
            <View style = {tailwind('flex flex-row items-center mt-4')}>
                <Text style = {tailwind('w-20')}>Instagram</Text>
                <TextInput style = {tailwind('flex-grow ml-4 py-0.5 px-2 border-2 border-gray-500 rounded')} placeholder = {'Insert URL...'} onFocus={() => setIsEditing(true)}>
                </TextInput>
            </View>
            <View style = {tailwind('flex flex-row items-center mt-2')}>
                <Text style = {tailwind('w-20')}>Facebook</Text>
                <TextInput style = {tailwind('flex-grow ml-4 py-0.5 px-2 border-2 border-gray-500 rounded')} placeholder = {'Insert URL...'} onFocus={() => setIsEditing(true)}>
                </TextInput>
            </View>
        </View>
    );
}

export default ProtectedProfile
