import { View, Text, Pressable } from "react-native";
import { keys, ENTER, CLEAR, colors } from "../../constants";
import styles, { keyWidth } from "./Keyboard.styles";

const Keyboard = ({
  onKeyPressed = () => {},
  greenCaps = [],
  yellowCaps = [],
  greyCaps = [],
}) => {

  /**
   * Whether or not the key should be wider than others
   * @param {string} key - name of the key
   * @returns {boolean} - true if the key should be longer; false otherwise
   */
  const isLongButton = (key) => {
    return key === ENTER || key === CLEAR;
  };

  /**
   * Determine the color of the key
   * @param {string} key - name of the key
   * @returns {string} - the color of the key based on previous attempt:
   *                       primary - in the word at the correct position
   *                       secondary - in the word but at the incorrect position
   *                       dark grey - not in the word
   *                       grey - not attempted before
   */
  const getKeyBGColor = (key) => {
    if (greenCaps.includes(key)) {
      return colors.primary;
    }
    if (yellowCaps.includes(key)) {
      return colors.secondary;
    }
    if (greyCaps.includes(key)) {
      return colors.darkgrey;
    }
    return colors.grey;
  };

  return (
    <View style={styles.keyboard}>

      {/* Every row of the keyboard */}
      {keys.map((keyRow, i) => (
        <View style={styles.row} key={`row-${i}`}>
          {/* Every key in each row */}
          {keyRow.map((key) => (
            // Create a pressable button
            <Pressable
              onPress={() => onKeyPressed(key)}
              disabled={greyCaps.includes(key)}
              key={key}
              style={[
                styles.key,
                isLongButton(key) ? { width: keyWidth * 1.4 } : {},
                { backgroundColor: getKeyBGColor(key) },
              ]}
            >
              <Text style={styles.keyText}>{key.toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
};

export default Keyboard;
