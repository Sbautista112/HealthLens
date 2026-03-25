import { Text, View, StyleSheet, TextInput, Button } from "react-native";
import { Link, router } from "expo-router";
import React, { useState } from "react";
// Auth Imports
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function Index() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signIn = async () => {
    try {
      const user = await signInWithEmailAndPassword(auth, email, password);
      if (user) router.push("/(tabs)/Diagnose");
    } catch (error: any) {
      console.log(error);
      alert("Sign in failed: " + error.message);
    }
  };

  return (
    <View style={styles.overallContainer}>
      <View style={styles.centerContent}>
        <Text style={styles.header}>HealthLens</Text>
        <Text style={styles.signIn}>Sign In</Text>
        <View style={styles.loginBox}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoComplete="email"
          ></TextInput>

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            autoComplete="current-password"
          ></TextInput>

          <Button title="Sign in" onPress={signIn}></Button>
        </View>
      </View>

      <View style={styles.footer}>
        <Link href={"/forgot_password"} style={styles.help}>
          Forgot password?
        </Link>
        <Link href={"/create_account"} style={styles.help}>
          No account? Create one!
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overallContainer: {
    flex: 1,
  },

  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    fontSize: 30,
  },

  loginBox: {
    padding: 10,
    width: "65%",
  },

  signIn: {
    fontSize: 25,
  },

  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },

  footer: {
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 50,
  },

  help: {
    fontSize: 15,
    padding: 10,
    fontWeight: "bold",
  },
});
