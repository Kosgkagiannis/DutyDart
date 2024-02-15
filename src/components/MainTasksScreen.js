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
import RNPickerSelect from "react-native-picker-select"
import Icon from "react-native-vector-icons/FontAwesome"

const db = openDatabase()

const MainTasksScreen = ({ navigation }) => {
  const [text, setText] = useState(null)
  const [forceUpdate, forceUpdateId] = useForceUpdate()
  const [priority, setPriority] = useState("")
  const [sortByDateAscending, setSortByDateAscending] = useState(false)
  const [sortByDateDescending, setSortByDateDescending] = useState(false)
  const [sortByPriorityAscending, setSortByPriorityAscending] = useState(false)
  const [sortByPriorityDescending, setSortByPriorityDescending] =
    useState(false)
  const [isSortExpanded, setIsSortExpanded] = useState(false)

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "create table if not exists items (id integer primary key not null, done int, value text, date text, time text, priority text);"
      )
    })
  }, [])


  const toggleSortExpansion = () => {
    setIsSortExpanded(!isSortExpanded)
  }

  const toggleSortByDateAscending = () => {
    setSortByDateAscending(true)
    setSortByDateDescending(false)
    setSortByPriorityAscending(false)
    setSortByPriorityDescending(false)
  }

  const toggleSortByDateDescending = () => {
    setSortByDateDescending(true)
    setSortByDateAscending(false)
    setSortByPriorityAscending(false)
    setSortByPriorityDescending(false)
  }

  const toggleSortByPriorityAscending = () => {
    setSortByPriorityAscending(true)
    setSortByPriorityDescending(false)
    setSortByDateAscending(false)
    setSortByDateDescending(false)
  }

  const toggleSortByPriorityDescending = () => {
    setSortByPriorityDescending(true)
    setSortByPriorityAscending(false)
    setSortByDateAscending(false)
    setSortByDateDescending(false)
  }

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
    setPriority(null)
  }

  const priorityOptions = [
    { label: "Low", value: "Low" },
    { label: "Medium", value: "Medium" },
    { label: "High", value: "High" },
  ]

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          onChangeText={(text) => setText(text)}
          placeholder="Add Task"
          value={text}
        />
        <View style={styles.priorityContainer}>
          <RNPickerSelect
            onValueChange={(value) => setPriority(value)}
            items={priorityOptions}
            placeholder={{ label: "Priority", value: null }}
            value={priority}
          />
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => add(text)}>
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={toggleSortExpansion}
      >
        <Icon name="filter" size={30} color="#007bff" />
      </TouchableOpacity>
      {isSortExpanded && (
        <View style={styles.sortButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.sortButton,
              sortByDateAscending && styles.activeSortButton,
            ]}
            onPress={toggleSortByDateAscending}
          >
            <Text style={styles.sortButtonText}>Sort by Date Ascending </Text>
            <Icon name="arrow-up" size={15} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortButton,
              sortByDateDescending && styles.activeSortButton,
            ]}
            onPress={toggleSortByDateDescending}
          >
            <Text style={styles.sortButtonText}>Sort by Date Descending</Text>
            <Icon name="arrow-down" size={15} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortButton,
              sortByPriorityAscending && styles.activeSortButton,
            ]}
            onPress={toggleSortByPriorityAscending}
          >
            <Text style={styles.sortButtonText}>
              Sort by Priority Ascending
            </Text>
            <Icon name="arrow-up" size={15} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortButton,
              sortByPriorityDescending && styles.activeSortButton,
            ]}
            onPress={toggleSortByPriorityDescending}
          >
            <Text style={styles.sortButtonText}>
              Sort by Priority Descending
            </Text>
            <Icon name="arrow-down" size={15} color="white" />
          </TouchableOpacity>
        </View>
      )}
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
          sortByDateAscending={sortByDateAscending}
          sortByDateDescending={sortByDateDescending}
          sortByPriorityAscending={sortByPriorityAscending}
          sortByPriorityDescending={sortByPriorityDescending}
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
  priorityContainer: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "#ccc",
    marginRight: 2,
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
    height: 55,
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
  sortButtonsContainer: {
    flexDirection: "column",
    justifyContent: "center",
    gap: 5,
    marginBottom: 10,
  },
  sortButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    justifyContent: "center",
  },
  sortButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  activeSortButton: {
    backgroundColor: "#0056b3",
  },
})

function useForceUpdate() {
  const [value, setValue] = useState(0)
  return [() => setValue(value + 1), value]
}

export default MainTasksScreen
