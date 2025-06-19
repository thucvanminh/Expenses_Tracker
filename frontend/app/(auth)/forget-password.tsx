import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/components/ThemeProvider';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const ForgetPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme } = useAppTheme();
  const router = useRouter();

  const handleSendReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    setLoading(true);
    try {
      // Giả lập gửi email reset, thực tế dùng API của hệ thống auth
      // await sendPasswordResetEmail(email);
      setLoading(false);
      Alert.alert('Success', 'If this email exists, a reset link has been sent.');
      router.replace('/(auth)/sign-in');
    } catch (e) {
      setLoading(false);
      Alert.alert('Error', 'Failed to send reset email');
    }
  };

  return (
    <KeyboardAwareScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.primary }]}>Forgot Password</Text>
        <Text style={[styles.label, { color: theme.text }]}>Enter your email to receive a reset link:</Text>
        <TextInput
          style={[styles.input, { color: theme.text, borderColor: theme.text }]}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleSendReset} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send Reset Link'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ marginTop: 18 }} onPress={() => router.replace('/(auth)/sign-in')}>
          <Text style={{ color: theme.primary, fontWeight: 'bold', textAlign: 'center' }}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>

  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 18, textAlign: 'center' },
  label: { fontSize: 16, marginBottom: 10 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 18, fontSize: 16 },
  button: { padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default ForgetPassword;