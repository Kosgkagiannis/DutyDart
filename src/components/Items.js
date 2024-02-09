import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Button,
  Alert,
} from "react-native"
import { fetchItems } from "../../database"
import db from "../../database"

export function Items({ done: doneHeading, onPressItem }) {
  const [items, setItems] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [editedText, setEditedText] = useState("")
  const [forceUpdate, setForceUpdate] = useState(0)

  useEffect(() => {
    fetchItems(doneHeading, setItems)
  }, [forceUpdate])

  const handleEdit = (id, value) => {
    setEditingItem(id)
    setEditedText(value)
  }

  const handleSaveEdit = (id) => {
    console.log("Save edited text:", editedText)

    db.transaction(
      (tx) => {
        tx.executeSql(
          "UPDATE items SET value = ? WHERE id = ?",
          [editedText, id],
          (_, { rows }) => {
            console.log("Task name updated successfully")
          }
        )
      },
      null,
      () => setForceUpdate((prev) => prev + 1)
    )

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, value: editedText } : item
      )
    )

    setEditingItem(null)
    setEditedText("")
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
    <View>
      {items.map(({ id, done, value }) => (
        <View key={id}>
          {editingItem === id ? (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TextInput
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: "#000",
                  padding: 8,
                  marginRight: 8,
                }}
                value={editedText}
                onChangeText={setEditedText}
              />
              <Button title="Save" onPress={() => handleSaveEdit(id)} />
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => onPressItem && onPressItem(id)}
              style={{
                backgroundColor: done ? "#1c9963" : "#fff",
                borderColor: "#000",
                borderWidth: 1,
                padding: 8,
                marginBottom: 8,
              }}
            >
              <Text style={{ color: done ? "#fff" : "#000" }}>{value}</Text>
              <Button
                title="Edit"
                onPress={() => handleEdit(id, value)}
                style={{ marginTop: 8 }}
              />
              {!done && (
                <>
                  <Button
                    title="Mark as completed"
                    onPress={() => handleMarkAsCompleted(id)}
                    style={{ marginTop: 8 }}
                  />
                  <Button
                    title="Delete"
                    onPress={() => handleDeleteConfirmation(id)}
                    style={{ marginTop: 8 }}
                  />
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  )
}
