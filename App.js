import { useState, useEffect } from "react";
import { StyleSheet, Text, View, SafeAreaView, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors, CLEAR, ENTER } from "./src/constants";
import Keyboard from "./src/components/Keyboard";

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

  // The answer word
  const word = "HELLO";
  const letters = word.split("");

  // States
  const [rows, setRows] = useState(new Array(NUMBER_OF_TRIES).fill(
    new Array(letters.length).fill("")
  ));
  const [currentRow, setCurrentRow] = useState(0);
  const [currentColumn, setCurrentColumn] = useState(0);
  const [gameState, setGameState] = useState("IN_PROGRESS");   // WON, LOST, IN_PROGRESS

  // Check game state when entering a new row
  useEffect(() => {
    if (currentRow > 0) {
      checkGameState();
    }
  }, [currentRow]);

  /**
   * Determine the game status based on the previous row.
   *   Should only be used when currentRow is greater than 0.
   */
  const checkGameState = () => {
    const previousRow = rows[currentRow - 1];
    if (previousRow.every((letter, i) => letter.toUpperCase() === letters[i])) {
      setGameState("WON");
      Alert.alert("You won!");
    } else if (currentRow === NUMBER_OF_TRIES) {
      setGameState("LOST");
      Alert.alert("You lost!");
    }
  }

  /**
   * Update the game status when a key is pressed on the keyboard,
   *  including the currentRow, currentColumn, and rows.
   * @param {string} key - the key being pressed
   */
  const onKeyPressed = (key) => {

    // Disable keyboard if the game is over
    if (gameState !== "IN_PROGRESS") {
      return;
    }

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
   * @param {number} row - the row (i)
   * @param {number} column - the column (j)
   * @returns - true if the cell is current active, false otherwise.
   */
  const isCellActive = (row, column) => {
    return row === currentRow && column === currentColumn;
  }

  /**
   * Evaluate the letter in the cell and determine the background color.
   * @param {number} row - the row number (i) of the cell
   * @param {number} column - the column number (j) of the cell
   * @returns - appropriate background color of the cell:
   *              primary - letter in the word at the correct position
   *              secondary - in the word but at the incorrect position
   *              dark grey - not in the word, 
   *                          or the cell is at the current row
   */
  const getCellBackGroundColor = (row, column) => {
    if (row >= currentRow) {
      return colors.darkgrey;
    }
    const letter = rows[row][column].toUpperCase();
    if (letter === letters[column]) {
      return colors.primary;
    }
    if (letters.includes(letter)) {
      return colors.secondary;
    }
    return colors.darkgrey;
  }

  /**
   * Evaluate all previous attempts and 
   *   return a list of letter for a specified color to be shown on keyboard.
   * @param {string} color - the specified color to be used for filter
   * @returns - an array of previously attempted letter for the specified color
   */
  const getAllLettersWithColor = (color) => {

    return rows.flatMap((row, i) => 
      row.filter((cell, j) => {
        return getCellBackGroundColor(i, j) === color && i < currentRow;
      })
    );
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
                backgroundColor: getCellBackGroundColor(i, j),
              }]}>
              <Text style={styles.cellText}>{letter.toUpperCase()}</Text>
            </View>
          ))}          
        </View>
        ))}
      </ScrollView>
      <Keyboard 
        onKeyPressed={onKeyPressed}
        greenCaps = {getAllLettersWithColor(colors.primary)}
        yellowCaps = {getAllLettersWithColor(colors.secondary)}
        greyCaps = {getAllLettersWithColor(colors.darkgrey)}
        />
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
