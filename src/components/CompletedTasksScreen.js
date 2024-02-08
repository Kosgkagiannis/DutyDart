import React, { useState, useEffect } from "react"
import { View, Text, ScrollView, Button, StyleSheet, Alert } from "react-native"
import { openDatabase } from "../../database"

const db = openDatabase()

const CompletedTasksScreen = () => {
  const [completedTasks, setCompletedTasks] = useState([])

  useEffect(() => {
    fetchCompletedTasks()
  }, [])

  const fetchCompletedTasks = () => {
    db.transaction((tx) => {
      tx.executeSql(
        `select * from items where done = ?;`,
        [1],
        (_, { rows: { _array } }) => setCompletedTasks(_array)
      )
    })
  }

  const handleDeleteConfirmation = (id) => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => handleDelete(id),
          style: "destructive",
        },
      ],
      { cancelable: true }
    )
  }

  const handleDelete = (id) => {
    db.transaction(
      (tx) => {
        tx.executeSql(`DELETE FROM items WHERE id = ?;`, [id])
      },
      null,
      () => {
        fetchCompletedTasks()
      }
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {completedTasks.map(({ id, value }) => (
          <View style={styles.taskContainer} key={id}>
            <Text style={styles.taskText}>{value}</Text>
            <Button
              title={`Delete`}
              onPress={() => handleDeleteConfirmation(id)}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  taskContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  taskText: {
    flex: 1,
    fontSize: 16,
    marginRight: 8,
  },
})

export default CompletedTasksScreen
