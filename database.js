import * as SQLite from "expo-sqlite"
import { Platform } from "react-native"

const db = SQLite.openDatabase("db.db")

export const openDatabase = () => {
  if (Platform.OS === "web") {
    return {
      transaction: () => {
        return {
          executeSql: () => {},
        }
      },
    }
  }

  return db
}

export const fetchItems = (done, setItems) => {
  db.transaction((tx) => {
    tx.executeSql(
      `SELECT * FROM items WHERE done = ? ORDER BY id DESC;`,
      [done ? 1 : 0],
      (_, { rows }) => setItems(rows._array)
    )
  })
}

export default db
