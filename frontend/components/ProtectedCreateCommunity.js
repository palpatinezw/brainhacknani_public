
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Button,
  Pressable,
  FlatList,
  Switch, KeyboardAvoidingView
} from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'
import { NavigationContainer } from '@react-navigation/native'
import tailwind, { create } from 'tailwind-rn'
import Spinner from 'react-native-loading-spinner-overlay';
// import { Header } from 'react-navigation-stack'

export default function ProtectedCreateCommunity ({ route, navigation }) {
	let { username, password } = route.params
	const [ name, setName ] = useState('')
	const [ prv, setprv ] = useState(false)
	const [ info, setInfo ] = useState('')
	const [flaire, setFlaire] = useState()
	const [ loading, setloading ] = useState(false)


	function flaire1(){
		console.log('here!!')
        if (flaire) {
            fetch('http://flyyee-brainhackserver.herokuapp.com/create_flair?flairCreate=1&flairAccept=0&flairPower=11&username='+username+'&password='+password+'&circleName='+name+'&flairName='+flaire)
    		.then(response => response.json())
    		.then(data => {
    			if (data.success == 1) {
    				console.log("weird")
    				setloading(false)

    				navigation.goBack()

    			} else {
    				console.log("create Error")
    				setloading(false)
    			}
    	})
    } else {
        setloading(false)
    }

}

	function create() {
		var prvstring = prv?'private':'public';
		setloading(true)
		fetch('http://flyyee-brainhackserver.herokuapp.com/create_circle?username='+username+'&password='+password+'&circleName='+name+'&circleVis='+prvstring+'&circleInfo='+info)
		.then(response => response.json())
		.then(data => {
			if (data.success == 1) {
				console.log(data)
				flaire1()


			} else {
				console.log("create Error")
				setloading(false)
			}
		})
	}

	return (
		<KeyboardAvoidingView keyboardVerticalOffset={1000} style={tailwind('flex-1 px-4 py-4')} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <Text style={tailwind('text-xl font-bold')}>Community Name</Text>
			<TextInput style={tailwind('border-2 border-gray-500 rounded text-xl mt-2 px-2 py-1')} value={name} onChangeText={(newText) => setName(newText)} />

            <Text style={tailwind('text-lg font-bold mt-4')}>Description</Text>
            <TextInput style = {tailwind('border-2 border-gray-500 rounded px-3 py-2 mt-2') } placeholder={'What is your community about?'} minHeight={120} textAlignVertical={'top'} multiline={true} onChangeText={(newText) => setInfo(newText)} />

            <Text style={tailwind('text-lg font-bold mt-4')}>Add a Flair</Text>
            <Text style={tailwind('text-xs text-gray-500')}>(Optional)</Text>
			<TextInput style = {tailwind('border-2 border-gray-500 rounded mt-2 px-2 py-1')} placeholder={'Create a role in your community.'} onChangeText={(newText) => setFlaire(newText)} />

            <Text style={tailwind('text-lg font-bold mt-4')}>Settings</Text>
            <View style={tailwind('flex flex-row items-center mt-2')}>
                <Text style={tailwind('pr-2')}>Private</Text>
                <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={prv ? "#1d4ed8" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={() => setprv(!prv)}
                    value={prv}
                />
                <Text style={tailwind('pl-2')}>Public</Text>
            </View>
            <TouchableOpacity>
                <Pressable style={tailwind('mt-6 py-1 bg-blue-600 border-2 border-blue-600 rounded')} onPress={create}>
                    <Text style={tailwind('text-center text-white')}>Create</Text>
                </Pressable>
            </TouchableOpacity>
			<Spinner visible={loading} textContent='Creating' textStyle={tailwind('text-white text-sm')}/>
		</KeyboardAvoidingView>
	)
}
