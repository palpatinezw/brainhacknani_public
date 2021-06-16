
import React, {useState, useEffect} from 'react'
import { View, Text, TextInput, TouchableOpacity, Keyboard, Button, Pressable,FlatList } from "react-native";
import { createStackNavigator } from "@react-navigation/stack"
import { NavigationContainer } from '@react-navigation/native';
import tailwind from 'tailwind-rn';

import ProtectedCreateCommunity from './ProtectedCreateCommunity';
import ProtectedJoinCommunity from './ProtectedJoinCommunity';

import AntDesign from "react-native-vector-icons/AntDesign";



const ProtectedExplore = ({ route, navigation }) => {
    const { username, password } = route.params;
    const [search, setSearch]=useState();
    const [textvalue, settextvalue]=useState("Recommendations");
    const [results, setresults]=useState();
    const [ShowRecommended,setShowRecommended]= useState()
    const [ShowRecommended1,setShowRecommended1]= useState()
    const [ShowRecommended2,setShowRecommended2]= useState()
    const [ShowSearch,setShowSearch]=useState()

    const [isSearching, setIsSearching] = useState(false)

    function addCommunity() {
      navigation.navigate("Create");
    }

    useEffect(() => {

      if (search == null || search == ""){
        settextvalue("Recommendations")
        setShowRecommended(true)
        setShowRecommended1(true)
        setShowRecommended2(true)
        setShowSearch(false)
      }
      else{
        settextvalue("Search Results")
        setShowRecommended(false)
        setShowRecommended1(false)
        setShowRecommended2(false)
        setShowSearch(true)
      }
     });


  function search2(){
      setIsSearching(true)

    fetch(`http://flyyee-brainhackserver.herokuapp.com/search_circles?username=`+username+`&password=`+password+`&searchstring=`+search)
   .then(response => response.json())
    .then(data => {
        setIsSearching(false)
        if (data.success === 1) {
          setresults(data.results);
        } else {
            console.log(false)
        }
    })
  }

  function renderCircles( {item} ) {
    return (
        <TouchableOpacity style={tailwind('px-4 py-2 bg-white rounded-lg text-xl')} onPress={() => {
            navigation.navigate("Join", {username: username, password: password, circleName: item})
        }}>
            <Text style={tailwind('ml-2 text-lg text-blue-600')}>{item}</Text>
        </TouchableOpacity>
    )
}

function RenderCircles( {item} ) {
  return (
      <TouchableOpacity style={tailwind('mb-2 px-4 py-2 bg-white rounded-lg text-xl')} onPress={() => {
          navigation.navigate("Join", {username: username, password: password, circleName: item})
      }}>
          <Text style={tailwind('ml-2 text-lg text-blue-600')}>{item}</Text>
      </TouchableOpacity>
  )
}

function separator() {
    return (
     <View style={{height:8}}></View>
    )
}

    return (
        <View style={tailwind('px-4 py-4')}>
            <View style={tailwind('flex flex-row')}>
            <TextInput
                style={tailwind('flex-grow px-4 py-2 rounded-lg bg-white border-2 border-gray-500')} placeholder={'Search'} value = {null}
                onChangeText ={(text) => {setSearch(text); search2()}}
            />

           <TouchableOpacity onPress={search2}>
            <AntDesign name="search1" size={24} color="black"style={{marginRight: 10,marginTop: 10,marginLeft:10}} />
            </TouchableOpacity>

        <TouchableOpacity onPress={addCommunity}>
            <AntDesign name="plus" size={24} color="black" style={{color: "#f55", marginRight: 10, marginTop: 10}} />
          </TouchableOpacity>
          </View>

          <Text style = {tailwind('text-xl mt-6 mb-4 font-bold text-black')}>{textvalue}</Text>

          {ShowRecommended ? (
              <>
                  <RenderCircles item='govdenier HQ' />
                  <RenderCircles item='nature lovers' />
                  <RenderCircles item='fight club' />
              </>
          )  : (null)}

          {ShowSearch ? (
              <>
                  { isSearching ? (
                      <Text style={tailwind('text-gray-500 italic')}>Loading...</Text>
                  ) : (
                      <FlatList data={results} renderItem={renderCircles} ItemSeparatorComponent={separator} keyExtractor={(item, index) => index.toString()}/>
                  )}


              </>
          ) : <Text></Text>}
        </View>
            );
      }

const Stack = createStackNavigator()

export default function ProtectedExploreStack({route}){
  let {username, password} = route.params
  return (
    <Stack.Navigator>
    <Stack.Screen name="Explore" component={ProtectedExplore} initialParams={{username, password}} />
    <Stack.Screen name="Join" component={ProtectedJoinCommunity} initialParams={{username, password}} />
    <Stack.Screen name="Create" component={ProtectedCreateCommunity} initialParams={{username, password}} />
    </Stack.Navigator>
  )
}

// <TouchableOpacity
//   onPress={ () => navigation.navigate("Join",{username, password, circleName: "govdenier HQ"})}
// >
//   <Text style = {tailwind('text-lg mt-3 rounded-lg text-blue-500')}>govdenier HQ</Text>
// </TouchableOpacity>
// <TouchableOpacity
//   onPress={ () => navigation.navigate("Join",{username, password, circleName: "nature lovers"})}
// >
//   <Text style = {tailwind('text-lg mt-3 rounded-lg text-blue-500')}>nature lovers</Text>
// </TouchableOpacity>
// <TouchableOpacity
//   onPress={ () => navigation.navigate("Join",{username, password, circleName: "fight club"})}
// >
//   <Text style = {tailwind('text-lg mt-3 rounded-lg text-blue-500')}>fight club</Text>
// </TouchableOpacity>
// </>
