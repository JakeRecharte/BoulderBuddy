import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StyleSheet } from 'react-native';

export default function FeedPage() {
    return (
        <ThemedView style={styles.container}>
            <ThemedText type="title">Social Feed</ThemedText>
            <ThemedText>View posts from friends and climbers. (Coming soon)</ThemedText>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});