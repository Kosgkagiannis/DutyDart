import React, { useState, useEffect } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import MainTasksScreen from "./src/components/MainTasksScreen"
import CompletedTasksScreen from "./src/components/CompletedTasksScreen"
import { openDatabase } from "./database"

const db = openDatabase()
const Tab = createBottomTabNavigator()

export default function App() {
  const [text, setText] = useState(null)
  const [forceUpdate, forceUpdateId] = useForceUpdate()

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
      <Tab.Navigator>
        <Tab.Screen name="MainTasks" component={MainTasksScreen} />
        <Tab.Screen name="CompletedTasks" component={CompletedTasksScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  )
}

function useForceUpdate() {
  const [value, setValue] = useState(0)
  return [() => setValue(value + 1), value]
}
