import { useSignIn } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { Text, TextInput, TouchableOpacity, View, Image } from 'react-native';
import { useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '@/assets/styles/auth.styles';
import { COLORS } from '@/constants/Colors';
import { useAppTheme } from '@/components/ThemeProvider';

export default function SignIn() {
    const { signIn, setActive, isLoaded } = useSignIn();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { theme } = useAppTheme();

    const handleSignIn = async () => {
        if (!isLoaded) return;

        try {
            const attempt = await signIn.create({ identifier: email, password });

            if (attempt.status === 'complete') {
                await setActive({ session: attempt.createdSessionId });
                router.replace('/');
            } else {
                console.error(JSON.stringify(attempt, null, 2));
            }
        } catch (err) {
            const code = err.errors?.[0]?.code;
            setError(code === 'form_password_incorrect' ? 'Incorrect password.' : 'An error occurred.');
        }
    };

    return (
        <KeyboardAwareScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <Image source={require('@/assets/images/logosaving2.png')} style={styles.illustration} />
                <Text style={[styles.title, { color: theme.primary }]}>Welcome Back</Text>

                {error && (
                    <View style={styles.errorBox}>
                        <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity onPress={() => setError('')}>
                            <Ionicons name="close" size={20} color={COLORS.textLight} />
                        </TouchableOpacity>
                    </View>
                )}

                <TextInput style={[styles.input, { color: theme.text }, { borderColor: theme.border }, error && styles.errorInput]} placeholder="Enter email" autoCapitalize="none" value={email} onChangeText={setEmail} />
                <TextInput style={[styles.input, { color: theme.text }, { borderColor: theme.border }, error && styles.errorInput]} placeholder="Enter password" secureTextEntry value={password} onChangeText={setPassword} />
                <View style={{ marginTop: 8 }}>
                    <TouchableOpacity onPress={() => router.push('/(auth)/forget-password')}>
                        <Text style={[styles.linkText, { color: theme.text, alignSelf: 'flex-end' }]}>Forget Password?</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleSignIn}>
                    <Text style={[styles.buttonText]}>Sign In</Text>
                </TouchableOpacity>

                <View style={styles.footerContainer}>
                    <Text style={[styles.footerText, { color: theme.text }]}>Don't have an account?</Text>
                    <Link href="/(auth)/sign-up" asChild>
                        <TouchableOpacity><Text style={[styles.linkText, { color: theme.text }]}>Sign Up</Text></TouchableOpacity>
                    </Link>
                </View>
            </View>
        </KeyboardAwareScrollView>
    );
}