import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, Image, Modal, FlatList, Alert } from "react-native";
import Spinner from 'react-native-loading-spinner-overlay';
import tailwind from 'tailwind-rn'

export default function CircleInfoScreen( {route, navigation} ) {
    const [ info, setInfo ] = useState({})
	const [ loading, setloading ] = useState(true)
    const [ isMod, setisMod ] = useState(false)
    const [ ModalVisible, setModalVisible ] = useState(false)
    const [ loadingFlairs, setloadingFlairs ] = useState(true)
    const [ loadingCur, setloadingCur ] = useState(true)
    const [ allFlairs, setAllFlairs ] = useState([])
    const [ curFlairs, setCurFlairs ] = useState([])
    const [ assignFlair, setassignFlair ] = useState(false)

    const { username, password, name } = route.params

    function loadCircleInfo() {
        setloading(true)
        fetch('http://flyyee-brainhackserver.herokuapp.com/get_circle_data?username='+username+'&password='+password+'&circleName='+name)
		.then(response => response.json())
		.then(data => {
			if (data.success == 1) {
				console.log(data)
				setInfo(data.circle)
				setloading(false)
			} else console.log("load info Error")
		})
    }
    function loadModInfo() {
        fetch('http://flyyee-brainhackserver.herokuapp.com/create_flair_info?username='+username+'&password='+password+'&circleName='+name)
		.then(response => response.json())
		.then(data => {
			if (data.success == 1) {
				console.log(data)
				if (data.power <= 2) setisMod(true)
			} else console.log("load mod Error")
		})
    }
    function loadFlairInfo() {
        setloadingFlairs(true)
        fetch('http://flyyee-brainhackserver.herokuapp.com/assign_flair_info?username='+username+'&password='+password+'&circleName='+name+'&newuser=0')
		.then(response => response.json())
		.then(data => {
			if (data.success == 1) {
				console.log(data)
				setAllFlairs(data.availableFlairs)
                setloadingFlairs(false)
			} else console.log("load available flairs Error")
		})
    }
    function loadMyFlair() {
        setloadingCur(true)
        fetch('http://flyyee-brainhackserver.herokuapp.com/get_members?username='+username+'&password='+password+'&circleName='+name)
		.then(response => response.json())
		.then(data => {
			if (data.success == 1) {
				console.log(data)
				if (data.members[username]) setCurFlairs(data.members[username])
                else console.log("member not found Error")
                setloadingCur(false)
			} else console.log("load current flairs Error")
		})
    }
    useEffect(() => {
        loadCircleInfo()
        loadModInfo()
        loadFlairInfo()
        loadMyFlair()
    }, [])

    function leaveCircle() {
        fetch('http://flyyee-brainhackserver.herokuapp.com/leave_circle?username='+username+'&password='+password+'&circleName='+name)
		.then(response => response.json())
		.then(data => {
			if (data.success == 1) {
				navigation.navigate("Protected Home Main", {username, password});
			} else console.log("leave Error")
		})
    }

    function toggleFlair(flair) {
        setassignFlair(true)
        if (flair=="Owner") {
            Alert.alert("Cannot unassign", "You remove yourself as the owner")
            setassignFlair(false)
            return
        }
        console.log('http://flyyee-brainhackserver.herokuapp.com/assign_flair?username='+username+'&password='+password+'&circleName='+name+'&flairNames='+flair+'&targetUsernames='+username)
        fetch('http://flyyee-brainhackserver.herokuapp.com/assign_flair?username='+username+'&password='+password+'&circleName='+name+'&flairNames='+flair+'&targetUsernames='+username)
		.then(response => response.json())
		.then(data => {
			if (data.success == 1) {
                console.log(data)
				setModalVisible(false)
                loadModInfo()
                loadFlairInfo()
                loadMyFlair()
                setassignFlair(false)
			} else {
                console.log("Assign Error")
                Alert.alert("Error")
                setassignFlair(false)
            }
		})
    }

    function renderFlair({item}) {
        return (
            <TouchableOpacity onPress={() => toggleFlair(item.name)}>
                <View style={tailwind(`mt-2 py-1 px-2 rounded-lg border-2 border-blue-500 ${curFlairs.includes(item.name) ? 'bg-blue-500' : 'bg-white'}`)}>
    				<Text style={tailwind(`w-5/6 ml-2 ${curFlairs.includes(item.name) ? 'text-white' : 'text-blue-500'}`)}>{item.name}</Text>
    			</View>
            </TouchableOpacity>
        )
    }

    return (
		<View style={tailwind('px-4 py-4')}>
            <View style={tailwind('flex flex-row items-center')}>
                <Text style={tailwind('text-3xl')}>{name}</Text>
                <Text style={tailwind('text-xs ml-4 py-1 px-2 bg-gray-500 text-white rounded')}>{info.vis === 'private' ? 'Private' : 'Public'}</Text>
            </View>

            <Text style={tailwind('text-xl font-bold mt-8')}>Description</Text>
            <Text style={tailwind('mt-2 text-lg')}>{(!loading) && info.infoText}</Text>

            <Text style={tailwind('text-xl font-bold mt-4 mb-2')}>My Flairs</Text>
            <FlatList data={allFlairs} extraData={curFlairs} renderItem={renderFlair} keyExtractor={(item, index) => index.toString()}/>

            <Spinner visible={loading} textContent='Loading...' textStyle={tailwind('text-white text-sm')}/>
            <Spinner visible={assignFlair} textContent='Changing your flair' textStyle={tailwind('text-white text-sm')}/>

		</View>
	);
}
