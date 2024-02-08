import React, { useState, useEffect } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from "@expo/vector-icons" // Import Ionicons from Expo
import MainTasksScreen from "./src/components/MainTasksScreen"
import CompletedTasksScreen from "./src/components/CompletedTasksScreen"
import { openDatabase } from "./database"

const db = openDatabase()
const Tab = createBottomTabNavigator()

export default function App() {
  const [forceUpdate] = useForceUpdate()

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "create table if not exists items (id integer primary key not null, done int, value text);"
      )
    })
  }, [])

  const add = (text) => {
    if (text === null || text === "") {
      return false
    }

    db.transaction(
      (tx) => {
        tx.executeSql("insert into items (done, value) values (0, ?)", [text])
        tx.executeSql("select * from items", [], (_, { rows }) =>
          console.log(JSON.stringify(rows))
        )
      },
      null,
      forceUpdate
    )
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
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
          options={{ tabBarLabel: "Current Tasks" }}
        />
        <Tab.Screen
          name="Completed Tasks"
          component={CompletedTasksScreen}
          options={{ tabBarLabel: "Completed Tasks" }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  )
}
function useForceUpdate() {
  const [value, setValue] = useState(0)
  return [() => setValue(value + 1), value]
}
