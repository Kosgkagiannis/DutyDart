import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Button,
  TouchableOpacity,
  StyleSheet,
} from "react-native"
import { Items } from "../components/Items"
import { openDatabase } from "../../database"

const db = openDatabase()

const MainTasksScreen = ({ navigation }) => {
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
    setText(null)
  }

  return (
    <View>
      <Text>Main Tasks</Text>
      <TextInput
        onChangeText={(text) => setText(text)}
        placeholder="Add Task"
        value={text}
      />
      <TouchableOpacity style={styles.addButton} onPress={() => add(text)}>
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>
      <ScrollView>
        <Items
          key={`forceupdate-todo-${forceUpdateId}`}
          done={false}
          onPressItem={(id) =>
            db.transaction(
              (tx) => {
                tx.executeSql(`update items set done = 1 where id = ?;`, [id])
              },
              null,
              forceUpdate
            )
          }
          navigation={navigation}
        />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: "#007bff",
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
})

function useForceUpdate() {
  const [value, setValue] = useState(0)
  return [() => setValue(value + 1), value]
}

export default MainTasksScreen
