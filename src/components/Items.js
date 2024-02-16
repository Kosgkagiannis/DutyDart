import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  Image,
} from "react-native"
import { fetchItems } from "../../database"
import db from "../../database"
import Icon from "react-native-vector-icons/FontAwesome"
import FlagGreen from "../img/flag-green.png"
import FlagYellow from "../img/flag-yellow.png"
import FlagRed from "../img/flag-red.png"
import DartHit from "../img/dart-hit.gif"
import RNPickerSelect from "react-native-picker-select"
import * as Animatable from "react-native-animatable"

export function Items({
  done: doneHeading,
  onPressItem,
  sortByDateAscending,
  sortByDateDescending,
  sortByPriorityAscending,
  sortByPriorityDescending,
  newlyAddedTaskId,
}) {
  const [items, setItems] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [editedText, setEditedText] = useState("")
  const [editedPriority, setEditedPriority] = useState("")
  const [forceUpdate, setForceUpdate] = useState(0)
  const [showGIF, setShowGIF] = useState(false)

  useEffect(() => {
    fetchItems(doneHeading, setItems)
  }, [forceUpdate])

  useEffect(() => {
    if (newlyAddedTaskId) {
      setShowGIF(true)
      setTimeout(() => {
        setShowGIF(false)
      }, 1500)
    }
  }, [newlyAddedTaskId])

  useEffect(() => {
    if (sortByDateAscending) {
      setItems((prevItems) => {
        if (prevItems && prevItems.length > 0) {
          return prevItems.slice().sort((a, b) => {
            const dateA = new Date(a.date + " " + a.time)
            const dateB = new Date(b.date + " " + b.time)
            return dateA - dateB
          })
        } else {
          return prevItems
        }
      })
    } else if (sortByDateDescending) {
      setItems((prevItems) => {
        if (prevItems && prevItems.length > 0) {
          return prevItems.slice().sort((a, b) => {
            const dateA = new Date(a.date + " " + a.time)
            const dateB = new Date(b.date + " " + b.time)
            return dateB - dateA
          })
        } else {
          return prevItems
        }
      })
    } else if (sortByPriorityAscending) {
      setItems((prevItems) => {
        if (prevItems && prevItems.length > 0) {
          return prevItems.slice().sort((a, b) => {
            const priorityOrder = { 0: 0, Low: 1, Medium: 2, High: 3 }
            // Need to assign the value of 0 in case the user didn't select a priority. Priority is an optional value
            const priorityA = a.priority || 0
            const priorityB = b.priority || 0
            return priorityOrder[priorityA] - priorityOrder[priorityB]
          })
        } else {
          return prevItems
        }
      })
    } else if (sortByPriorityDescending) {
      setItems((prevItems) => {
        if (prevItems && prevItems.length > 0) {
          return prevItems.slice().sort((a, b) => {
            const priorityOrder = { 0: 0, Low: 1, Medium: 2, High: 3 }
            // Need to assign the value of 0 in case the user didn't select a priority. Priority is an optional value
            const priorityA = a.priority || 0
            const priorityB = b.priority || 0
            return priorityOrder[priorityB] - priorityOrder[priorityA]
          })
        } else {
          return prevItems
        }
      })
    }
  }, [
    sortByDateAscending,
    sortByDateDescending,
    sortByPriorityAscending,
    sortByPriorityDescending,
  ])

  const handleEdit = (id, value, priority) => {
    setEditingItem(id)
    setEditedText(value)
    setEditedPriority(priority)
  }

  const handleSaveEdit = (id) => {
    console.log("Save edited text:", editedText)
    console.log("Save edited priority:", editedPriority)

    db.transaction(
      (tx) => {
        tx.executeSql(
          "UPDATE items SET value = ?, priority = ? WHERE id = ?",
          [editedText, editedPriority, id],
          (_, { rows }) => {
            console.log("Task name and priority updated successfully")
          }
        )
      },
      null,
      () => setForceUpdate((prev) => prev + 1)
    )

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id
          ? { ...item, value: editedText, priority: editedPriority }
          : item
      )
    )

    setEditingItem(null)
    setEditedText("")
    setEditedPriority("")
  }

  const handleMarkAsCompleted = (id) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `UPDATE items SET done = 1 WHERE id = ?;`,
          [id],
          (_, { rowsAffected }) => {
            if (rowsAffected > 0) {
              setForceUpdate((prev) => prev + 1)
            }
          }
        )
      },
      null,
      () => {
        console.log("Marked as completed successfully")
      }
    )
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
        setForceUpdate((prev) => prev + 1)
      }
    )
  }

  if (items === null || items.length === 0) {
    return null
  }

  return (
    <View style={styles.container}>
      {items.map(({ id, done, value, date, time, priority }) => (
        <View key={id} style={styles.itemContainer}>
          {id === newlyAddedTaskId && showGIF ? (
            <Image source={DartHit} style={styles.gif} />
          ) : (
            <View key={id} style={styles.itemContainer}>
              {editingItem === id ? (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TextInput
                    style={styles.input}
                    value={editedText}
                    onChangeText={setEditedText}
                  />
                  <View style={{ flex: 1 }}>
                    <RNPickerSelect
                      style={styles.input}
                      onValueChange={(value) => setEditedPriority(value)}
                      items={[
                        { label: "Low", value: "Low" },
                        { label: "Medium", value: "Medium" },
                        { label: "High", value: "High" },
                      ]}
                      value={editedPriority}
                      placeholder={{ label: "Priority", value: null }}
                    />
                  </View>
                  <Button title="Save" onPress={() => handleSaveEdit(id)} />
                </View>
              ) : (
                <View
                  style={[
                    styles.touchable,
                    { backgroundColor: done ? "#1c9963" : "#fff" },
                  ]}
                >
                  <Text style={styles.textContainer}>{value}</Text>
                  <Text style={styles.textContainer}>
                    {date} {time}
                  </Text>
                  {priority && (
                    <View
                      style={[
                        styles.textContainer,
                        { flexDirection: "row", alignItems: "center" },
                      ]}
                    >
                      <Text>Priority: {priority}</Text>
                      {priority === "Low" && (
                        <Image source={FlagGreen} style={styles.flagImage} />
                      )}
                      {priority === "Medium" && (
                        <Image source={FlagYellow} style={styles.flagImage} />
                      )}
                      {priority === "High" && (
                        <Image source={FlagRed} style={styles.flagImage} />
                      )}
                    </View>
                  )}

                  <View style={styles.buttonContainer}>
                    <Button
                      title="Edit"
                      onPress={() => handleEdit(id, value, priority)}
                    />
                    {!done && (
                      <>
                        <Button
                          title="Mark as completed"
                          onPress={() => handleMarkAsCompleted(id)}
                          color="green"
                        />
                        <Icon
                          name="trash"
                          size={20}
                          color="red"
                          onPress={() => handleDeleteConfirmation(id)}
                        />
                      </>
                    )}
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  itemContainer: {
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#000",
    padding: 8,
    marginRight: 8,
  },
  touchable: {
    borderWidth: 1,
    padding: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 8,
  },
  textContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingVertical: 12,
  },
  flagImage: {
    width: 20,
    height: 20,
    marginLeft: 5,
  },
  gif: {
    width: 100,
    height: 100,
    alignSelf: "center",
  },
})

export default Items
