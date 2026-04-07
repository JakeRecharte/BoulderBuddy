import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    type TextInput as TextInputType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';

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


const destinations = {
    profilePage: '/(tabs)/profilePage',
    settingsPage: '/(tabs)/settingsPage',
} as const;

export default function LoginPage() {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState(false);
    const [authError, setAuthError] = useState('');
    const [loading, setLoading] = useState(false);
    const passwordRef = useRef<TextInputType>(null);
    const router = useRouter();

    useFocusEffect(useCallback(() => {
        return () => {
            setEmail('');
            setPassword('');
            resetErrors();
        };
    }, []));
    const { redirect } = useLocalSearchParams<{ redirect?: string }>();

    function resetErrors() {
        setEmailError('');
        setPasswordError(false);
        setAuthError('');
    }

    function switchMode() {
        resetErrors();
        setMode(mode === 'login' ? 'signup' : 'login');
    }

    async function handleSubmit() {
        const validEmail = isValidEmail(email);
        const validPassword = isValidPassword(password);

        setEmailError(validEmail ? '' : 'Invalid email');
        setPasswordError(!validPassword);
        setAuthError('');

        if (!validEmail || !validPassword) return;

        setLoading(true);

        if (mode === 'login') {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                setAuthError('Incorrect email or password');
                setLoading(false);
                return;
            }
        } else {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) {
                setAuthError(error.message);
                setLoading(false);
                return;
            }
        }

        setLoading(false);
        router.replace(redirect && redirect in destinations ? destinations[redirect as keyof typeof destinations] : '/(tabs)/homePage');
    }

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <Text style={styles.title}>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</Text>
                <Text style={styles.subtitle}>
                    {mode === 'login' ? 'Log in to Boulder Buddy' : 'Join Boulder Buddy'}
                </Text>

                {/* Toggle */}
                <View style={styles.toggle}>
                    <TouchableOpacity
                        style={[styles.toggleButton, mode === 'login' && styles.toggleActive]}
                        onPress={() => mode !== 'login' && switchMode()}
                    >
                        <Text style={[styles.toggleText, mode === 'login' && styles.toggleTextActive]}>Log In</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleButton, mode === 'signup' && styles.toggleActive]}
                        onPress={() => mode !== 'signup' && switchMode()}
                    >
                        <Text style={[styles.toggleText, mode === 'signup' && styles.toggleTextActive]}>Sign Up</Text>
                    </TouchableOpacity>
                </View>

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
                    {passwordError && <Text style={styles.errorText}>Invalid login credentials</Text>}
                </View>

                {!!authError && <Text style={styles.authError}>{authError}</Text>}

                <TouchableOpacity style={styles.button} onPress={handleSubmit} activeOpacity={0.85} disabled={loading}>
                    <Text style={styles.buttonText}>{loading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Sign Up'}</Text>
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
        marginBottom: 32,
    },
    toggle: {
        flexDirection: 'row',
        backgroundColor: '#1A1A1A',
        borderRadius: 10,
        padding: 4,
        marginBottom: 32,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    toggleActive: {
        backgroundColor: '#FFFFFF',
    },
    toggleText: {
        color: '#777777',
        fontSize: 14,
        fontWeight: '700',
    },
    toggleTextActive: {
        color: '#0D0D0D',
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
    authError: {
        color: '#FF4444',
        fontSize: 13,
        marginBottom: 16,
        textAlign: 'center',
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
