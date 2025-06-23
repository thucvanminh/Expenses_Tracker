import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '@/assets/styles/auth.styles';
import { COLORS } from '@/constants/Colors';
import { Image } from 'expo-image';
import { useAppTheme } from '@/components/ThemeProvider';
import { API_URL } from '@/constants/api';

export default function SignUp() {
    const { isLoaded, signUp, setActive } = useSignUp();
    const router = useRouter();
    const { theme } = useAppTheme();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [pendingVerification, setPendingVerification] = useState(false);

    const handleSignUp = async () => {
        if (!isLoaded) return;

        try {
            await signUp.create({ emailAddress: email, password });
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
            setPendingVerification(true);
        } catch (err) {
            console.error(JSON.stringify(err, null, 2));
        }
    };


    //////
    // const createProfile = async (profile_id: string, username: string) => {
    //     try {
    //         console.log("CALLING API", profile_id, username);
    //         const res = await fetch(`${API_URL}/profiles`, {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify(
    //                 profile_id,
    //                 username,
    //                 custom_startmonth: 1  // Adding the required field
    //             })
    //         });
    //
    //         let data;
    //         try {
    //             data = await res.json();
    //         } catch (jsonError) {
    //             console.error("Failed to parse response as JSON");
    //             if (!res.ok) {
    //                 throw new Error(`Server responded with status: ${res.status}`);
    //             }
    //             return null;
    //         }
    //
    //         if (!res.ok) {
    //             console.error("Server error:", data);
    //             throw new Error(`Server responded with status: ${res.status}`);
    //         }
    //
    //         console.log("Profile response:", data);
    //         return data;
    //     } catch (err) {
    //         console.error("Failed to create profile:", err);
    //         throw err;
    //     }
    // }
    //////////

    const handleVerify = async () => {
        if (!isLoaded) return;

        try {
            const attempt = await signUp.attemptEmailAddressVerification({ code });
            if (attempt.status === 'complete') {
                await setActive({ session: attempt.createdSessionId });
                const username = email.split('@')[0];
                if (attempt.createdUserId) {
                    console.log("Creating profile with ID:", attempt.createdUserId, "Username:", username);
                    try {
                        // await createProfile(attempt.createdUserId, username);
                        console.log("Profile created successfully");
                    } catch (profileErr) {
                        console.error("Error creating profile:", profileErr);
                        // Continue with navigation even if profile creation fails
                    }
                }
                router.replace('/');
            } else {
                console.error(JSON.stringify(attempt, null, 2));
            }
        } catch (err) {
            const code = (err as any)?.errors?.[0]?.code;
            setError(code === 'form_identifier_exists' ? 'Email already exists.' : 'An error occurred.');
        }
    };

    if (pendingVerification) {
        return (
            <View style={[styles.verificationContainer, { backgroundColor: theme.background }]}>
                <Text style={[styles.verificationTitle, { color: theme.text }]}>Verify your email</Text>

                {error && (
                    <View style={styles.errorBox}>
                        <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity onPress={() => setError('')}>
                            <Ionicons name="close" size={20} color={COLORS.textLight} />
                        </TouchableOpacity>
                    </View>
                )}

                <TextInput style={[styles.verificationInput, { color: theme.text }, { borderColor: theme.border }, error && styles.errorInput]} placeholder="Verification Code" value={code} onChangeText={setCode} />
                <TouchableOpacity onPress={handleVerify} style={[styles.button, { backgroundColor: theme.primary }]}>
                    <Text style={[styles.buttonText]}>Verify</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <KeyboardAwareScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <Image source={require('@/assets/images/logosaving1.png')} style={styles.illustration} />
                <Text style={[styles.title, { color: theme.primary }]}>Create Account</Text>

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
                <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleSignUp}>
                    <Text style={styles.buttonText}>Sign Up</Text>
                </TouchableOpacity>

                <View style={styles.footerContainer}>
                    <Text style={[styles.footerText, { color: theme.text }]}>Already have an account?</Text>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={[styles.linkText, { color: theme.text }]}>Sign In</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAwareScrollView>
    );
}
