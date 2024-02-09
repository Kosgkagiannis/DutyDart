import React, { useState, useEffect } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from "@expo/vector-icons"
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
        "create table if not exists items (id integer primary key not null, done int, value text, date text, time text);"
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
          "INSERT INTO items (done, value, date, time) VALUES (0, ?, ?, ?)",
          [text, currentDate, currentTime],
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
