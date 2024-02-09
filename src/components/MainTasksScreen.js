import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native"
import { Items } from "../components/Items"
import moment from "moment"
import { openDatabase } from "../../database"

const db = openDatabase()

const MainTasksScreen = ({ navigation }) => {
  const [text, setText] = useState(null)
  const [forceUpdate, forceUpdateId] = useForceUpdate()

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
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          onChangeText={(text) => setText(text)}
          placeholder="Add Task"
          value={text}
        />
        <TouchableOpacity style={styles.addButton} onPress={() => add(text)}>
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>
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
  container: {
    flex: 1,
    padding: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: "#007bff",
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
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
