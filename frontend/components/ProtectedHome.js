import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, FlatList, Modal, ScrollView } from "react-native"
import tailwind from 'tailwind-rn'
import { createStackNavigator } from "@react-navigation/stack"
import Spinner from 'react-native-loading-spinner-overlay'
import Ionicons from 'react-native-vector-icons/Ionicons'

import Call from './Call'
import CircleInfoScreen from './CircleInfoScreen'

const ProtectedHomeMain = ({ route, navigation }) => {
	const { username, password } = route.params
	var [ selected, setSelected ] = useState([])
	var [ filter, setFilter ] = useState()
	const [ filterModalVisible, setFilterModalVisible ] = useState(false)
	const [ filterModal, setFilterModal ] = useState()
	const [ loading, setloading ] = useState(true)
	const [ circles, setCircles ] = useState()
	const [ refreshModal, setRefreshModal ] = useState(false);
	const [ donotInit,  setdonotInit ] = useState(false)

	//setting filters state - default all picked
	function initFilter() {
		if (!circles) {
			loadCircles()
			return
		}
		if (donotInit) return
		var tempFilter = []
		for (var i = 0; i < circles.length; i++) {
			tempFilter[circles[i].name] = [...circles[i].flairs]
		}
		setFilter(tempFilter)
		setdonotInit(true)
	}
	//loading circles from server
	function loadCircles() {
		setloading(true)
		// console.log(`http://flyyee-brainhackserver.herokuapp.com/my_circles?username=${username}&password=${password}`)
		fetch('http://flyyee-brainhackserver.herokuapp.com/my_circles?username='+username+'&password='+password)
		.then(response => response.json())
		.then(data => {
			if (data.success == 1) {
				setdonotInit(false)
				setCircles(data.results)
				setloading(false)
			} else console.log("load Circles Error")
		})

	}
	useEffect(() => {
		loadCircles()
	}, [])
	//changing filter when circles are updated
	useEffect(() => {
		initFilter()
	}, [circles])

	//changing selection of circles to call
	function makeSelection(circleName) {
		const tempSel = selected
		const curCircle = tempSel.indexOf(circleName)
		if (curCircle == -1) {
			tempSel.push(circleName)
		} else {
			tempSel.splice(curCircle, 1)
		}
		setSelected(tempSel)
		setCircles([
			...circles,
		])
	}
	//showing the page to edit filters for flairs
	function showFilter(circleName) {
		setFilterModal(circles.find(o => o.name === circleName))
		setFilterModalVisible(true)
	}
	//flatlist render for circles
	function renderCircles( {item} ) {
		return (
			<View style={tailwind('flex flex-row items-center px-4 py-2 bg-white rounded-lg')}>
				<TouchableOpacity style={tailwind('w-6/12 text-xl self-center')} onPress={() => navigation.navigate("Circle Info", {name:item.name})}>
					<Text style={tailwind('ml-2 font-bold')}>{item.name}</Text>
				</TouchableOpacity>
    				<TouchableOpacity style={tailwind('w-4/12')} onPress={() => showFilter(item.name)}>
    					<Text style={tailwind('text-center text-sm py-1 bg-blue-200 rounded-lg')}>Filter {filter ? '('+filter[item.name].length+')' : ''}</Text>
    				</TouchableOpacity>
    				<TouchableOpacity style={tailwind('w-2/12')} onPress={() => makeSelection(item.name)}>
    					<View style={tailwind(`h-7 w-7 border-2 border-blue-500 rounded-full self-end ${selected.includes(item.name) ? 'bg-blue-500':''}`)}>
    					</View>
    				</TouchableOpacity>
			</View>
		)
	}
	function separator() {
        return (<View style={{height:5}}></View>)
    }
	//toggling filters
	function toggleFilter(circleName, flair) {
		if (!filter[circleName]) return
		var tempfilter = filter
		var flairid = tempfilter[filterModal.name].findIndex(o => o === flair)

		if (flairid == -1) {
			tempfilter[filterModal.name].push(flair)
		} else {
			tempfilter[filterModal.name].splice(flairid, 1)
		}
		setFilter(tempfilter)
		setRefreshModal(!refreshModal)
	}
	//flatlist render for flairs
	function renderFilter({item}) {
		return (
            <View style={tailwind('flex flex-row items-center py-2 px-2 rounded-lg bg-gray-100')}>
				<Text style={tailwind('w-5/6 ml-2 text-lg')}>{item}</Text>
				<TouchableOpacity style={tailwind('w-1/6')} onPress={() => toggleFilter(filterModal.name, item)}>
					<View style={tailwind(`h-7 w-7 border-2 border-blue-500 rounded-full ${filter[filterModal.name]?.find(o => o === item) ? 'bg-blue-500':''}`)}>
					</View>
				</TouchableOpacity>
			</View>
		)
        // <View style={tailwind('h-14 rounded-lg px-2 flex-row border-2')}>
        //     <Text style={tailwind('w-5/6 text-xl self-center')}>{item}</Text>
        //     <TouchableOpacity style={tailwind('w-1/6 justify-center')} onPress={() => toggleFilter(filterModal.name, item)}>
        //         <View style={tailwind(`h-7 w-7 border-2 rounded-full self-end justify-center ${filter[filterModal.name]?.find(o => o === item) ? 'bg-blue-600':''}`)}>
        //         </View>
        //     </TouchableOpacity>
        // </View>
	}
	//all and none flair functions
	function filterNone() {
		let circleName = filterModal.name
		var tempfilter = filter
		tempfilter[circleName] = []
		setFilter(tempfilter)
		setRefreshModal(!refreshModal)
	}
	function filterAll() {
		let circleName = filterModal.name
		var tempFilter = filter
		tempFilter[circleName] = [...circles.find(o => o.name===circleName).flairs]
		setFilter(tempFilter)
		setRefreshModal(!refreshModal)
	}

	return (
		<View style={tailwind('px-6 py-4')}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={filterModalVisible}
                onRequestClose={() => {
                    setFilterModalVisible(!filterModalVisible);
                }}
            >
                <View style={tailwind('px-4 py-8 h-full w-full justify-center')}>
                    <View style={{...tailwind('px-4 py-4 h-5/6 w-full bg-white self-center rounded-lg'), ...{shadowRadius: 4, shadowColor: '#000', elevation: 5}}}>
                        <Ionicons style={tailwind('self-end')} name={'close'} size={30} color={'black'} onPress={() => setFilterModalVisible(!filterModalVisible)} />
                        <View style={tailwind('px-2')}>
                            <Text style={tailwind('text-3xl font-bold mb-2')}>Filter Flairs</Text>
                            <Text style={tailwind('mb-4')}>Choose the flairs you would like to match with.</Text>
                            {filterModal ? <FlatList data={ filterModal.flairs } extraData={ refreshModal } renderItem={renderFilter} ItemSeparatorComponent={separator} keyExtractor={(item, index) => index.toString()}/> : <Text>Error</Text>}
                        </View>
                    </View>
                </View>
            </Modal>
            <Spinner visible={loading} textContent='Loading...' textStyle={tailwind('text-white text-sm')}/>
			<View style={tailwind('h-full')}>
                <Text style={tailwind('text-3xl font-bold')}>Home</Text>
                <View style={tailwind('mt-4 px-4 py-2 bg-blue-700 rounded-lg')}>
                    <Text style={tailwind('text-2xl font-bold text-white')}>Find a Call</Text>
                    <Text style={tailwind('text-white mt-1')}>Select the communities you want to call by clicking the circle.</Text>
                    <TouchableOpacity style={tailwind('w-4/5 self-center py-1 my-4 rounded-lg bg-white')} onPress={() => navigation.navigate("Call", {username, password})}>
    					<Text style={tailwind('text-xl self-center text-blue-600')}>Start Call ({selected.length})</Text>
    				</TouchableOpacity>
                </View>
				<View style={tailwind('flex-1 mt-4')}>
					{ (!loading) && (
                        <>
                            <View style={tailwind('flex flex-row items-center mb-2')}>
                                <Text style={tailwind('text-xl font-bold pr-3 mb-1.5')}>My Communities</Text>
                                <Ionicons name={'refresh-circle'} size={30} color={'#1D4ED8'} onPress={loadCircles} />
                            </View>

                            <FlatList
                                data={circles} renderItem={renderCircles}
                                ItemSeparatorComponent={separator}
                                keyExtractor={(item, index) => index.toString()}
                            />
                        </>
                    )}
				</View>
			</View>
		</View>
	);
}

const Stack = createStackNavigator();
export default function ProtectedHome({route}) {
	const { username, password } = route.params

	return (
		<Stack.Navigator>
			<Stack.Screen name="Protected Home Main" options={{headerShown: false}} component={ProtectedHomeMain} initialParams={{username, password}}/>
			<Stack.Screen name="Circle Info" component={CircleInfoScreen} initialParams={{username, password}} options={{ title: 'Community Info' }}/>
			<Stack.Screen name="Call" component={Call} initialParams={{username, password}} />
		</Stack.Navigator>
	)
}

// <View style={tailwind('flex-1 justify-center items-center')}>
//     <View style={tailwind('mx-8 my-8 bg-white items-center')}>
//         <Text style={tailwind('text-3xl')}>{filterModal ? filterModal.name : ''}</Text>
//         {filterModal ? <FlatList data={ filterModal.flairs } extraData={ refreshModal } renderItem={renderFilter} ItemSeparatorComponent={separator} keyExtractor={(item, index) => index.toString()}/> : <Text>Error</Text>}
//         <TouchableOpacity style={tailwind('mx-1 rounded-lg px-2 border-2')} onPress={() => setFilterModalVisible(!filterModalVisible)}>
//             <Text style={tailwind('w-full text-xl self-center text-center')}>CLOSE</Text>
//         </TouchableOpacity>
//     </View>
// </View>
