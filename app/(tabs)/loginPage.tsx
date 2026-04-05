import { useAuth } from '@/context/auth';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    type TextInput as TextInputType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function isValidPassword(password: string): boolean {
    return (
        password.length >= 9 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password)
    );
}

const PASSWORD_RULES = [
    'At least 9 characters',
    'At least one uppercase letter',
    'At least one lowercase letter',
    'At least one number',
];

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState(false);
    const passwordRef = useRef<TextInputType>(null);
    const router = useRouter();
    const { redirect } = useLocalSearchParams<{ redirect?: string }>();
    const { login } = useAuth();

    function handleSubmit() {
        const validEmail = isValidEmail(email);
        const validPassword = isValidPassword(password);

        setEmailError(validEmail ? '' : 'Invalid email');
        setPasswordError(!validPassword);

        if (validEmail && validPassword) {
            login();
            const destinations = {
                profilePage: '/(tabs)/profilePage',
                settingsPage: '/(tabs)/settingsPage',
            } as const;
            router.replace(redirect && redirect in destinations ? destinations[redirect as keyof typeof destinations] : '/(tabs)/homePage');
        }
    }

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Log in to Boulder Buddy</Text>

                <View style={styles.field}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={[styles.input, emailError ? styles.inputError : null]}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="you@example.com"
                        placeholderTextColor="#555555"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="next"
                        onSubmitEditing={() => passwordRef.current?.focus()}
                        submitBehavior="submit"
                    />
                    {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        ref={passwordRef}
                        style={[styles.input, passwordError ? styles.inputError : null]}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="••••••••"
                        placeholderTextColor="#555555"
                        secureTextEntry
                        returnKeyType="done"
                        onSubmitEditing={handleSubmit}
                    />
                    {passwordError && (
                        <View style={styles.passwordRules}>
                            <Text style={styles.errorText}>Invalid password. Requirements:</Text>
                            {PASSWORD_RULES.map((rule) => (
                                <Text key={rule} style={styles.ruleText}>· {rule}</Text>
                            ))}
                        </View>
                    )}
                </View>

                <TouchableOpacity style={styles.button} onPress={handleSubmit} activeOpacity={0.85}>
                    <Text style={styles.buttonText}>Log In</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#0D0D0D',
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 0.5,
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 15,
        color: '#777777',
        marginBottom: 40,
    },
    field: {
        marginBottom: 24,
    },
    label: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.8,
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#1A1A1A',
        borderWidth: 1,
        borderColor: '#333333',
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 14,
        color: '#FFFFFF',
        fontSize: 15,
    },
    inputError: {
        borderColor: '#FF4444',
    },
    errorText: {
        color: '#FF4444',
        fontSize: 12,
        marginTop: 6,
    },
    passwordRules: {
        marginTop: 6,
        gap: 2,
    },
    ruleText: {
        color: '#FF4444',
        fontSize: 12,
    },
    button: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: '#0D0D0D',
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
});
