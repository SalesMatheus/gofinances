import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Welcome } from './src/Components/Welcome';

export default function App() {
  return (
    <View style={styles.container}>
      <Welcome title={"Hello World!"}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9955d8',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
  },
});
