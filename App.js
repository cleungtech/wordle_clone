import { useState } from "react";
import { StyleSheet, Text, View, SafeAreaView, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors, CLEAR, ENTER } from "./src/constants";
import Keyboard from "./src/components/Keyboard";
import { color } from 'react-native/Libraries/Components/View/ReactNativeStyleAttributes';

const NUMBER_OF_TRIES = 5;
/**
 * Make a copy of 2D array
 * @param {Array} originalArray - the 2D array to be copied
 * @returns a copy of the original array
 */
const copyArray = (originalArray) => {
  return [...originalArray.map((row) => [...row])];
};

export default function App() {

  const word = "HELLO";
  const letters = word.split("");

  const [rows, setRows] = useState(new Array(NUMBER_OF_TRIES).fill(
    new Array(letters.length).fill("")
  ));

  const [currentRow, setCurrentRow] = useState(0);
  const [currentColumn, setCurrentColumn] = useState(0);

  /**
   * Update the game status when a key is pressed on the keyboard,
   *  including the currentRow, currentColumn, and rows.
   * @param {string} key - the key being pressed
   */
  const onKeyPressed = (key) => {

    const updatedRows = copyArray(rows);

    // Handle clear button
    if (key === CLEAR) {
      const previousColumn = currentColumn - 1;
      if (previousColumn >= 0) {
        updatedRows[currentRow][previousColumn] = "";
        setRows(updatedRows);
        setCurrentColumn(previousColumn);
      }
      return;
    }

    // Handle enter button
    if (key === ENTER) {
      if (currentColumn === rows[0].length) {
        setCurrentRow(currentRow + 1);
        setCurrentColumn(0);
      }
      return;
    }

    // Handle character keys
    if (currentColumn < rows[0].length) {
      updatedRows[currentRow][currentColumn] = key;
      setRows(updatedRows);
      setCurrentColumn(currentColumn + 1);
    }
  }

  /**
   * Determine if the current cell (row, column) is active.
   * @param {*} row - the row (i)
   * @param {*} column - the column (j)
   * @returns - true if the cell is current active, false otherwise.
   */
  const isCellActive = (row, column) => {
    return row === currentRow && column === currentColumn;
  }

  return (
    
    <SafeAreaView style={styles.container}>
      <StatusBar style="light"/>
      <Text style={styles.title}>WORDLE</Text>
      <ScrollView style={styles.map}>
        {rows.map((row, i) => (
          <View key={`row-${i}`} style={styles.row}>
          {row.map((letter, j) => (
            <View key={`cell-${i}-${j}`} style={[styles.cell, 
              { 
                borderColor: isCellActive(i, j) 
                ? colors.lightgrey 
                : colors.darkgrey,
              }]}>
              <Text style={styles.cellText}>{letter.toUpperCase()}</Text>
            </View>
          ))}          
        </View>
        ))}
      </ScrollView>
      <Keyboard onKeyPressed={onKeyPressed}/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
    alignItems: 'center',
  },
  title: {
    color: colors.lightgrey,
    fontSize: 32,
    fontWeight: "bold",
    letterSpacing: 7,
  },
  map: {
    alignSelf: "stretch",
    marginVertical: 20,
    height: 100,
  },
  row: {
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "center",
  },
  cell: {
    borderWidth: 3,
    borderColor: colors.darkgrey,
    flex: 1,
    aspectRatio: 1,
    margin: 5,
    maxWidth: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  cellText: {
    color: colors.lightgrey,
    fontWeight: "bold",
    fontSize: 28,
  }
});
