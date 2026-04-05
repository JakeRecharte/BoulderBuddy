import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/auth';

export default function SettingsPage() {
    const { logout } = useAuth();
    const router = useRouter();

    async function handleLogout() {
        await logout();
        router.replace('/(tabs)/homePage');
    }

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <Text style={styles.title}>Settings</Text>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.85}>
                    <Text style={styles.logoutText}>Log Out</Text>
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
        marginBottom: 40,
    },
    logoutButton: {
        backgroundColor: '#FF4444',
        borderRadius: 10,
        paddingVertical: 16,
        alignItems: 'center',
    },
    logoutText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
});
