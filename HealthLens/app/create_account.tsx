import { Text, View, StyleSheet, TextInput, Button } from "react-native";
import { Link, router } from "expo-router";
import React, { useState } from "react";
// Auth Imports.
import { auth } from "../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signUp = async () => {
    try {
      const user = await createUserWithEmailAndPassword(auth, email, password);
      if (user) router.push("/(tabs)/Diagnose");
    } catch (error: any) {
      console.log(error);
      alert("Sign up failed: " + error.message);
    }
  };

  return (
    <View style={styles.overallContainer}>
      <View style={styles.centerContent}>
        <Text style={styles.header}>HealthLens</Text>
        <Text style={styles.signIn}>Create an Account</Text>
        <Text style={styles.subtitle}>Enter your email to sign up for this app!</Text>
        <View style={styles.loginBox}>
          <TextInput
            style={styles.input}
            placeholder="email@domain.com"
            value={email}
            onChangeText={setEmail}
            autoComplete="email"
          ></TextInput>

          <TextInput
            style={styles.input}
            placeholder="password"
            value={password}
            onChangeText={setPassword}
            autoComplete="new-password"
          ></TextInput>

          <Button title="Continue" onPress={signUp}></Button>

          <View style={styles.orContainer}>
            <View style={styles.line} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.line} />
          </View>

          <Button title="Continue with Google"></Button>

          <Button title="Continue with Apple"></Button>

          <Text style={styles.footerText}>
            By clicking continue, you agree to our Terms of Service and Privacy Policy.
          </Text>
        </View>
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
    fontSize: 20,
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

  subtitle: {
    fontSize: 15,
  },

  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },

  orText: {
    marginHorizontal: 10,
    fontSize: 16,
    color: "#666",
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#D3D3D3",
  },

  footerText: {
    padding: 5,
    textAlign: "center",
    fontSize: 13,
    color: "#666",
  },
});
