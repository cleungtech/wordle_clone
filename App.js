import { useState, useEffect } from "react";
import { StyleSheet, Text, View, SafeAreaView, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CLEAR, ENTER, colors, colorsToEmoji } from "./src/constants";
import Keyboard from "./src/components/Keyboard";
import * as Clipboard from 'expo-clipboard';

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

  const wordList = [
    "hello",
    "world"
  ]

  // States
  const [gameState, setGameState] = useState("IN_PROGRESS");   // WON, LOST, IN_PROGRESS
  const [letters, setLetters] = useState(null);
  const [rows, setRows] = useState(new Array(NUMBER_OF_TRIES).fill(
    new Array(wordList[0].length).fill("")
  ));
  const [currentRow, setCurrentRow] = useState(0);
  const [currentColumn, setCurrentColumn] = useState(0);

  /**
   * Pick a random word out of a list of words when the game is (re)started.
   * @param {Array} wordList - an array of words of the same length
   * @returns - an array of letters of a randomly chosen word
   */
  const pickRandomWord = (wordList) => {
    if (gameState !== "IN_PROGRESS") {
      return;
    }
    const word = wordList[Math.floor(Math.random() * wordList.length)];
    console.log(`The word is ${word}.`)
    const new_letters = word.split("");
    setLetters(new_letters);
  }

  // Pick a new word randomly when the game is (re)started
  useEffect(() => {
    pickRandomWord(wordList);
  }, [gameState])

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
    const isCorrectAnswer = previousRow.every((letter, i) => 
      letter === letters[i]);
    const isLastTry = currentRow === NUMBER_OF_TRIES;

    // Game won
    if (isCorrectAnswer && gameState !== "WON") {
      setGameState("WON");
      Alert.alert("You won!", 
                  `It took you ${currentRow} ` + 
                  `${currentRow === 1 ? "try" : "tries"}.`, 
                  [{ text: "Share", onPress: shareScore },
                   { text: "Restart", onPress: restartGame }]);

    // Game lost
    } else if (isLastTry && gameState !== "LOST") {
      setGameState("LOST");
      Alert.alert("You lost!",
                  `The word is ${letters.join("").toUpperCase()}!`,
                  [{ text: "Share", onPress: shareScore },
                   { text: "Restart", onPress: restartGame }]);
    }
  }

  /**
   * Handle restarting the game and reseting all game status.
   *   A new word will be randomly selected.
   */
  const restartGame = () => {
    setGameState("RESTART");
    setGameState("IN_PROGRESS");
    setRows(new Array(NUMBER_OF_TRIES).fill(
      new Array(wordList[0].length).fill("")
    ));
    setCurrentRow(0);
    setCurrentColumn(0);  
  }

  /**
   * Handle sharing of game score using emoji.
   *   Create a string of emoji representing the game progress and status and
   *   copy to the clipboard.
   */
  const shareScore = () => {
    const textMap = rows.map((row, i) => 
      row.map((cell, j) => colorsToEmoji[getCellBackGroundColor(i, j)]).join("")
    )
    .filter((row) => row)
    .join("\n")
    const textShare = `Wordle ${currentRow}/${NUMBER_OF_TRIES}\n\n${textMap}`;
    Clipboard.setString(textShare);
    Alert.alert("Copied! \n\n Paste anywhere to share!");
  }

  /**
   * Update the game status when a key is pressed on the keyboard,
   *   including the currentRow, currentColumn, and rows.
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
      return colors.black;
    }
    const letter = rows[row][column];
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
        return getCellBackGroundColor(i, j) === color;
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
    marginVertical: 10,
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
