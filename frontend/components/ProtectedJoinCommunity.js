import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Button,
  Pressable,
  FlatList
} from 'react-native'
import Spinner from 'react-native-loading-spinner-overlay'

import tailwind from 'tailwind-rn'

export default function ProtectedJoinCommunity ({ route, navigation }) {
  let { username, password, circleName } = route.params
  //circleName = 'qui' // TODO: REMOVE
  const [loadingData, setloadingData] = useState(true)
  const [circleInfo, setcircleInfo] = useState('sample circle info')
  const [loadingFlairData, setloadingFlairData] = useState(true)
  const [flairInfo, setflairInfo] = useState(['sample flair info'])
  const [flairStatus, setflairStatus] = useState({})
  const [refresh, setRefresh] = useState(false)

  const [joinSuccessful, setJoinSuccessful] = useState(false)
  const [joinPending, setJoinPending] = useState(false)
  const [joinFailed, setJoinFailed] = useState(false)

  function getCircleInfo (username, password, circleName) {
      // TODO: header still says description
    // return new Promise((res, err) => {
    fetch(
      `http://flyyee-brainhackserver.herokuapp.com/get_circle_data?username=${username}&password=${password}&circleName=${circleName}`
    )
      .then(fetched => fetched.json())
      .then(ret => {
        if (ret.success == 1) {
          setcircleInfo(ret.circle.infoText)
        }
        setloadingData(false)
      })
    // .catch(caught => err(caught))
    // })
  }

  function getFlairs () {
    console.log('here')
    // return new Promise((res, err) => {
    fetch(
      `http://flyyee-brainhackserver.herokuapp.com/assign_flair_info?username=${username}&password=${password}&circleName=${circleName}&newuser=1`
    )
      .then(fetched => fetched.json())
      .then(ret => {
        console.log(ret.success)
        if (ret.success == 1) {
          let flairs = ret.availableFlairs
          console.log(flairs)
          for (let x = 0; x < flairs.length; x++) {
            flairs[x] = flairs[x].name
          }
          setflairInfo(flairs)
          let fs = {}
          for (let flair of flairs) {
            fs[flair] = false
          }
          setflairStatus(fs)
          setloadingFlairData(false)
        }
        // res()
      })
    // .catch(caught => err(caught))
    // })
  }

  useEffect(() => {
    getCircleInfo(username, password, circleName)
    getFlairs()
  }, [])

  function renderCircles ({ item }) {
    return (
      <TouchableOpacity onPress={() => {
          let fs = flairStatus
          fs[item] = !fs[item]
          setflairStatus(fs)
          console.log(flairStatus[item])
          setRefresh(!refresh)
      }}>
          <View style={tailwind(`mt-0.5 py-1.5 px-2 rounded-lg border-2 border-gray-500 ${flairStatus[item] ? 'bg-gray-500' : 'bg-white'}`)}>
              <Text style={tailwind(`w-5/6 ml-2 ${flairStatus[item] ? 'text-white' : 'text-gray-600'}`)}>{item}</Text>
          </View>
      </TouchableOpacity>
    )
  }

  // <View style={tailwind('rounded-lg px-2 flex-row border-2')}>
  //   <TouchableOpacity
  //     onPress={() => {
  //       let fs = flairStatus
  //       fs[item] = !fs[item]
  //       setflairStatus(fs)
  //       console.log(flairStatus[item])
  //       setRefresh(!refresh)
  //     }}
  //     style={tailwind(flairStatus[item] ? 'bg-blue-600' : 'bg-blue-100')}
  //   >
  //     <Text>{item}</Text>
  //   </TouchableOpacity>
  // </View>

  function separator () {
    return <View style={{ height: 5 }}></View>
  }
function returntohome(){
  navigation.navigate("Home", {
    username: username,
    password: password
})
}
  async function join() {
    // returntohome()
    await fetch(
        `http://flyyee-brainhackserver.herokuapp.com/join_circle?username=${username}&password=${password}&circleName=${circleName}`
    ).then(
        res => res.json()
    ).then(async res => {
        console.log('after joining circle')
        console.log(res)
        if (res.success || true) { // TODO: leakk
            if (res.info == "joined") {
                setJoinSuccessful(true)
                let flairs = []
                for (let flair in flairStatus) {
                    if (flairStatus[flair]) {
                        flairs.push(flair)
                    }
                }
                flairs = flairs.toString()
                await fetch(`http://flyyee-brainhackserver.herokuapp.com/assign_flair?username=${username}&password=${password}&circleName=${circleName}&flairnames=${flairs}&targetUsernames=${username}`)
                .then(assignRes => assignRes.json())
                .then(assignRes => {
                    // TODO: go to home
                    // console.log("HERE")
                })
            } else if (res.info == "pending") {
                setJoinPending(true)
            } else {
                setJoinFailed(true)
            }
        }
    })
  }

  return (
    <View style={tailwind('px-4 py-4')}>
      <Text style ={tailwind('text-2xl font-bold') }>{circleName}</Text>
      <Text style ={tailwind('mt-2 text-gray-700') }>{(!loadingData) && circleInfo}</Text>

      { joinSuccessful && <Text style={tailwind('mt-8 text-lg text-center py-1 px-2 bg-green-400 rounded-lg')}>Your request is successful.</Text>}
      { joinPending && <Text style={tailwind('mt-8 text-lg text-center py-1 px-2 bg-red-400 rounded-lg')}>Your request is pending.</Text>}
      { joinFailed && <Text style={tailwind('mt-8 text-lg text-center py-1 px-2 bg-red-400 rounded-lg')}>Your request is unsuccessful.</Text>}

      { ((!joinSuccessful) && (!joinPending) && (!joinFailed)) && (
          <>
              <Text style ={tailwind('text-lg mt-4 mb-2 font-bold' ) }>Select Flairs:</Text>
              <FlatList
                extraData={refresh}
                data={(loadingFlairData) ? [''] : flairInfo}
                renderItem={renderCircles}
                ItemSeparatorComponent={separator}
                keyExtractor={(item, index) => index.toString()}
              />
              <Pressable style={tailwind('mt-4 py-1 bg-blue-700 border-2 border-blue-700 rounded')} onPress={join}>
                  <Text style={tailwind('text-center text-white')}>Join</Text>
              </Pressable>
           </>
      )}

      <Spinner visible={((loadingData) || (loadingFlairData))} textContent='Loading...' textStyle={tailwind('text-white text-sm')}/>
    </View>
  )
}
