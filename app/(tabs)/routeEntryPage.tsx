import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Alert, Button, Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type RouteEntry = {
    id: string;
    date: string;
    gym: string;
    routeName: string;
    grade: string;
    notes: string;
    photoUri?: string;
};

const STORAGE_KEY = '@boulderbuddy_routes';

export default function RouteEntryPage() {
    const [gym, setGym] = useState('');
    const [routeName, setRouteName] = useState('');
    const [grade, setGrade] = useState('V0');
    const [notes, setNotes] = useState('');
    const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
    const [savedCount, setSavedCount] = useState(0);

    useEffect(() => {
        loadSavedRoutes();
    }, []);

    async function loadSavedRoutes() {
        try {
            const json = await AsyncStorage.getItem(STORAGE_KEY);
            if (json) {
                const routes: RouteEntry[] = JSON.parse(json);
                setSavedCount(routes.length);
            } else {
                setSavedCount(0);
            }
        } catch (e) {
            console.warn('Failed to load routes', e);
        }
    }

    async function saveRoute() {
        if (!gym.trim() || !routeName.trim()) {
            Alert.alert('Missing required fields', 'Enter gym name and route name before saving.');
            return;
        }

        const newRoute: RouteEntry = {
            id: `${Date.now()}`,
            date: new Date().toISOString(),
            gym: gym.trim(),
            routeName: routeName.trim(),
            grade,
            notes: notes.trim(),
            photoUri,
        };

        try {
            const json = await AsyncStorage.getItem(STORAGE_KEY);
            const list = json ? (JSON.parse(json) as RouteEntry[]) : [];
            const updated = [newRoute, ...list];
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

            setGym('');
            setRouteName('');
            setGrade('V0');
            setNotes('');
            setPhotoUri(undefined);
            setSavedCount(updated.length);

            Alert.alert('Saved', 'Route saved successfully!');
        } catch (e) {
            console.error('Save failed', e);
            Alert.alert('Error', 'Could not save route.');
        }
    }

    async function pickImage() {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.status !== 'granted') {
            Alert.alert('Permission required', 'Permission to access photos is required.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
        });

        if (!result.canceled && result.assets.length > 0) {
            setPhotoUri(result.assets[0].uri);
        }
    }

    async function takePhoto() {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (permissionResult.status !== 'granted') {
            Alert.alert('Permission required', 'Permission to access camera is required.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
        });

        if (!result.canceled && result.assets.length > 0) {
            setPhotoUri(result.assets[0].uri);
        }
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <ThemedView style={styles.card}>
                <ThemedText type="title">Add Route</ThemedText>
                <Text style={styles.counter}>Saved routes: {savedCount}</Text>

                <TextInput
                    value={gym}
                    placeholder="Gym name"
                    onChangeText={setGym}
                    style={styles.input}
                />
                <TextInput
                    value={routeName}
                    placeholder="Route name"
                    onChangeText={setRouteName}
                    style={styles.input}
                />

                <TextInput
                    value={grade}
                    placeholder="Grade (e.g. V0, V1, V2)"
                    onChangeText={setGrade}
                    style={styles.input}
                />

                <TextInput
                    value={notes}
                    placeholder="Notes"
                    onChangeText={setNotes}
                    style={[styles.input, styles.textArea]}
                    multiline
                />

                <View style={styles.photoButtons}>
                    <Button title="Pick Photo" onPress={pickImage} />
                    <Button title="Take Photo" onPress={takePhoto} />
                </View>

                {photoUri ? <Image source={{ uri: photoUri }} style={styles.preview} /> : null}

                <View style={styles.saveButton}>
                    <Button title="Save Route" onPress={saveRoute} />
                </View>
            </ThemedView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#fff',
    },
    card: {
        gap: 12,
    },
    counter: {
        color: '#555',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f8f8f8',
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    photoButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    preview: {
        width: '100%',
        height: 220,
        borderRadius: 12,
        marginTop: 8,
    },
    saveButton: {
        marginTop: 16,
    },
});