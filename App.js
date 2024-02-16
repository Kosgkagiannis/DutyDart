import React, { useState, useEffect } from "react"
import { Image, View, Text } from "react-native"
import { NavigationContainer } from "@react-navigation/native"
import * as Animatable from "react-native-animatable"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from "@expo/vector-icons"
import MainTasksScreen from "./src/components/MainTasksScreen"
import CompletedTasksScreen from "./src/components/CompletedTasksScreen"
import { openDatabase } from "./database"
import DutyDart from "./src/img/DutyDart.png"

const db = openDatabase()
const Tab = createBottomTabNavigator()

export default function App() {
  const [forceUpdate] = useForceUpdate()
  const [showLogo, setShowLogo] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setShowLogo(false)
    }, 1300)
  }, [])

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "create table if not exists items (id integer primary key not null, done int, value text, date text, time text, priority text);"
      )
    })
  }, [])

  const add = (text) => {
    if (text === null || text === "") {
      return false
    }

    const currentDate = moment().format("YYYY-MM-DD")
    const currentTime = moment().format("HH:mm:ss")

    db.transaction(
      (tx) => {
        tx.executeSql(
          "INSERT INTO items (done, value, date, time, priority) VALUES (0, ?, ?, ?, ?)",
          [text, currentDate, currentTime, priority],
          () => {
            console.log("Task added successfully")
          },
          (_, error) => {
            console.log("Error adding task:", error)
          }
        )
      },
      null,
      forceUpdate
    )

    setText(null)
  }

  return (
    <NavigationContainer>
      <View style={{ flex: 1 }}>
        {showLogo ? (
          <Animatable.View
            animation="fadeIn"
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text
              style={{
                fontFamily: "monospace",
                fontWeight: "bold",
                fontSize: 48,
              }}
            >
              DutyDart
            </Text>
            <Image
              source={DutyDart}
              style={{ width: 200, height: 200, marginLeft: 25 }}
            />
          </Animatable.View>
        ) : (
          <Tab.Navigator
            animation="fadeIn"
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName

                if (route.name === "Current Tasks") {
                  iconName = focused ? "home" : "home-outline"
                } else if (route.name === "Completed Tasks") {
                  iconName = focused
                    ? "checkmark-circle"
                    : "checkmark-circle-outline"
                }

                return <Ionicons name={iconName} size={size} color={color} />
              },
              tabBarActiveTintColor: "tomato",
              tabBarInactiveTintColor: "gray",
            })}
          >
            <Tab.Screen
              name="Current Tasks"
              component={MainTasksScreen}
              options={{
                title: "Current Tasks",
                headerTitle: () => (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={{
                        marginRight: 5,
                        fontWeight: "bold",
                        fontSize: 20,
                      }}
                    >
                      Current Tasks
                    </Text>
                    <Image
                      source={DutyDart}
                      style={{ width: 40, height: 40 }}
                    />
                  </View>
                ),
              }}
            />
            <Tab.Screen
              name="Completed Tasks"
              component={CompletedTasksScreen}
              options={{
                title: "Completed Tasks",
                headerTitle: () => (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text
                      style={{
                        marginRight: 5,
                        fontWeight: "bold",
                        fontSize: 20,
                      }}
                    >
                      Completed Tasks
                    </Text>
                    <Image
                      source={DutyDart}
                      style={{ width: 40, height: 40 }}
                    />
                  </View>
                ),
              }}
            />
          </Tab.Navigator>
        )}
      </View>
    </NavigationContainer>
  )
}
function useForceUpdate() {
  const [value, setValue] = useState(0)
  return [() => setValue(value + 1), value]
}
