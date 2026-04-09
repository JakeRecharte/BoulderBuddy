import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/auth';

const GRADES = ['Ungraded','VB', 'V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'V11', 'V12', 'V13', 'V14', 'V15', 'V16', 'V17'];

type Gym = { id: string; name: string };

export default function RouteEntryPage() {
    const { user, isLoggedIn } = useAuth();
    const [mode, setMode] = useState<'3d' | 'basic'>('3d');
    const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
    const [gyms, setGyms] = useState<Gym[]>([]);
    const [gymId, setGymId] = useState<string>('');
    const [name, setName] = useState('');
    const [grade, setGrade] = useState('V0');
    const [setter, setSetter] = useState('');
    const [attempts, setAttempts] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        supabase.from('gyms').select('id, name').then(({ data }) => {
            if (data) setGyms(data);
        });
    }, []);

    async function pickImage() {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission required', 'Permission to access photos is required.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
        });
        if (!result.canceled) setPhotoUri(result.assets[0].uri);
    }

    async function takePhoto() {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission required', 'Permission to access camera is required.');
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
        });
        if (!result.canceled) setPhotoUri(result.assets[0].uri);
    }

    async function handleSubmit() {
        if (!name.trim()) {
            Alert.alert('Missing field', 'Please enter a route name.');
            return;
        }

        setLoading(true);

        const { error } = await supabase.from('routes').insert({
            name: name.trim(),
            gym_id: gymId || null,
            grade,
            setter: setter.trim() || null,
            attempts: attempts ? parseInt(attempts) : null,
            description: description.trim() || null,
            is_public: isPublic,
        });

        setLoading(false);

        if (error) {
            Alert.alert('Error', 'Could not save route.');
            console.error(error);
            return;
        }

        // Reset
        setPhotoUri(undefined);
        setName('');
        setGymId('');
        setGrade('V0');
        setSetter('');
        setAttempts('');
        setDescription('');
        setIsPublic(false);
        setMode('3d');

        Alert.alert('Saved', 'Route saved successfully!');
    }

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Add Route</Text>

                {/* Photo */}
                <View style={styles.photoSection}>
                    {photoUri ? (
                        <TouchableOpacity onPress={pickImage}>
                            <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.photoPlaceholder}>
                            <Text style={styles.photoPlaceholderText}>No photo selected</Text>
                        </View>
                    )}
                    <View style={styles.photoButtons}>
                        <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
                            <Text style={styles.photoButtonText}>Take Photo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                            <Text style={styles.photoButtonText}>Choose Photo</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Gym */}
                <Text style={styles.label}>Gym</Text>
                <View style={styles.pickerWrapper}>
                    <Picker
                        selectedValue={gymId}
                        onValueChange={setGymId}
                        style={styles.picker}
                        dropdownIconColor="#FFFFFF"
                    >
                        <Picker.Item label="Select a gym..." value="" color="#555555" />
                        {gyms.map((g) => (
                            <Picker.Item key={g.id} label={g.name} value={g.id} color="#FFFFFF" />
                        ))}
                    </Picker>
                </View>

                {/* Name */}
                <Text style={styles.label}>Route Name</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g. Crimpy Overhang"
                    placeholderTextColor="#555555"
                />

                {/* Grade */}
                <Text style={styles.label}>Grade</Text>
                <View style={styles.pickerWrapper}>
                    <Picker
                        selectedValue={grade}
                        onValueChange={setGrade}
                        style={styles.picker}
                        dropdownIconColor="#FFFFFF"
                    >
                        {GRADES.map((g) => (
                            <Picker.Item key={g} label={g} value={g} color="#FFFFFF" />
                        ))}
                    </Picker>
                </View>

                {/* Setter */}
                <Text style={styles.label}>Setter</Text>
                <TextInput
                    style={styles.input}
                    value={setter}
                    onChangeText={setSetter}
                    placeholder="e.g. Alex R."
                    placeholderTextColor="#555555"
                />

                {/* Attempts */}
                <Text style={styles.label}>Attempts</Text>
                <TextInput
                    style={styles.input}
                    value={attempts}
                    onChangeText={setAttempts}
                    placeholder="e.g. 5"
                    placeholderTextColor="#555555"
                    keyboardType="number-pad"
                />

                {/* Description */}
                <Text style={styles.label}>Description / Notes</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="How did it go?"
                    placeholderTextColor="#555555"
                    multiline
                />

                {/* 3D / Basic toggle */}
                <Text style={styles.label}>Scan Type</Text>
                <View style={styles.toggle}>
                    <TouchableOpacity
                        style={[styles.toggleButton, mode === '3d' && styles.toggleActive]}
                        onPress={() => setMode('3d')}
                    >
                        <Text style={[styles.toggleText, mode === '3d' && styles.toggleTextActive]}>3D Scan</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleButton, mode === 'basic' && styles.toggleActive]}
                        onPress={() => setMode('basic')}
                    >
                        <Text style={[styles.toggleText, mode === 'basic' && styles.toggleTextActive]}>Basic</Text>
                    </TouchableOpacity>
                </View>
                {mode === '3d' && (
                    <Text style={styles.scanNote}>3D scanning will detect holds from your photo and build a 3D model. (Coming soon)</Text>
                )}

                {/* Submit row */}
                <View style={styles.submitRow}>
                    <View style={styles.publicRow}>
                        <Text style={styles.publicLabel}>Make Public</Text>
                        <Switch
                            value={isPublic}
                            onValueChange={setIsPublic}
                            trackColor={{ false: '#333333', true: '#FFFFFF' }}
                            thumbColor={isPublic ? '#0D0D0D' : '#777777'}
                        />
                    </View>
                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
                        <Text style={styles.submitText}>{loading ? 'Saving...' : 'Save Route'}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.bottomSpacer} />
            </ScrollView>
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
        paddingTop: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 0.5,
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
        marginBottom: 20,
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    pickerWrapper: {
        backgroundColor: '#1A1A1A',
        borderWidth: 1,
        borderColor: '#333333',
        borderRadius: 10,
        marginBottom: 20,
        overflow: 'hidden',
    },
    picker: {
        color: '#FFFFFF',
    },
    photoSection: {
        marginBottom: 24,
    },
    photoPlaceholder: {
        height: 200,
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#333333',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    photoPlaceholderText: {
        color: '#555555',
        fontSize: 14,
    },
    photoPreview: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginBottom: 12,
    },
    photoButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    photoButton: {
        flex: 1,
        backgroundColor: '#1A1A1A',
        borderWidth: 1,
        borderColor: '#333333',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
    },
    photoButtonText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
    },
    toggle: {
        flexDirection: 'row',
        backgroundColor: '#1A1A1A',
        borderRadius: 10,
        padding: 4,
        marginBottom: 12,
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
    scanNote: {
        color: '#555555',
        fontSize: 12,
        marginBottom: 24,
        textAlign: 'center',
    },
    submitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    publicRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    publicLabel: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    submitButton: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        paddingVertical: 14,
        paddingHorizontal: 28,
        alignItems: 'center',
    },
    submitText: {
        color: '#0D0D0D',
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    bottomSpacer: {
        height: 40,
    },
});
