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

export const fetchItems = (doneHeading, setItems) => {
  db.transaction((tx) => {
    tx.executeSql(
      `select * from items where done = ?;`,
      [doneHeading ? 1 : 0],
      (_, { rows: { _array } }) => setItems(_array)
    )
  })
}

export default db
