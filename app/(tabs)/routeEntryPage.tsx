import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';

const GRADES = ['Ungraded', 'VB', 'V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'V11', 'V12', 'V13', 'V14', 'V15', 'V16', 'V17'];

type Gym = { id: string; name: string };

type DropdownProps = {
    label: string;
    value: string;
    options: { label: string; value: string }[];
    placeholder?: string;
    onChange: (value: string) => void;
};

function Dropdown({ label, value, options, placeholder = 'Select...', onChange }: DropdownProps) {
    const [open, setOpen] = useState(false);
    const selected = options.find(o => o.value === value);

    return (
        <View style={{ marginBottom: 20 }}>
            <Text style={dropdownStyles.label}>{label}</Text>
            <TouchableOpacity style={dropdownStyles.trigger} onPress={() => setOpen(true)}>
                <Text style={selected ? dropdownStyles.triggerText : dropdownStyles.triggerPlaceholder}>
                    {selected ? selected.label : placeholder}
                </Text>
                <Text style={dropdownStyles.chevron}>›</Text>
            </TouchableOpacity>

            <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
                <TouchableOpacity style={dropdownStyles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
                    <View style={dropdownStyles.sheet}>
                        <Text style={dropdownStyles.sheetTitle}>{label}</Text>
                        <FlatList
                            data={options}
                            keyExtractor={item => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[dropdownStyles.option, item.value === value && dropdownStyles.optionActive]}
                                    onPress={() => { onChange(item.value); setOpen(false); }}
                                >
                                    <Text style={[dropdownStyles.optionText, item.value === value && dropdownStyles.optionTextActive]}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const dropdownStyles = StyleSheet.create({
    label: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.8,
        marginBottom: 8,
    },
    trigger: {
        backgroundColor: '#1A1A1A',
        borderWidth: 1,
        borderColor: '#333333',
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    triggerText: {
        color: '#FFFFFF',
        fontSize: 15,
    },
    triggerPlaceholder: {
        color: '#555555',
        fontSize: 15,
    },
    chevron: {
        color: '#777777',
        fontSize: 20,
        transform: [{ rotate: '90deg' }],
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: '#1A1A1A',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        maxHeight: '60%',
        paddingBottom: 32,
    },
    sheetTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
        textAlign: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
    },
    option: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#222222',
    },
    optionActive: {
        backgroundColor: '#2A2A2A',
    },
    optionText: {
        color: '#AAAAAA',
        fontSize: 15,
    },
    optionTextActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
});

export default function RouteEntryPage() {
    const [mode, setMode] = useState<'3d' | 'basic'>('3d');
    const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
    const [gyms, setGyms] = useState<Gym[]>([]);
    const [gymId, setGymId] = useState<string>('');
    const [name, setName] = useState('');
    const [grade, setGrade] = useState('');
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
            mediaTypes: 'images',
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
            mediaTypes: 'images',
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
            grade: grade || 'Ungraded',
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

        setPhotoUri(undefined);
        setName('');
        setGymId('');
        setGrade('');
        setSetter('');
        setAttempts('');
        setDescription('');
        setIsPublic(false);
        setMode('3d');

        Alert.alert('Saved', 'Route saved successfully!');
    }

    const gymOptions = [
        { label: 'Select a gym...', value: '' },
        ...gyms.map(g => ({ label: g.name, value: g.id })),
    ];

    const gradeOptions = GRADES.map(g => ({ label: g, value: g }));

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

                <Dropdown
                    label="Gym"
                    value={gymId}
                    options={gymOptions}
                    placeholder="Select a gym..."
                    onChange={setGymId}
                />

                <Text style={styles.label}>Route Name</Text>
                <TextInputField value={name} onChangeText={setName} placeholder="e.g. Crimpy Overhang" />

                <Dropdown
                    label="Grade"
                    value={grade}
                    options={gradeOptions}
                    placeholder="Select a grade..."
                    onChange={setGrade}
                />

                <Text style={styles.label}>Setter</Text>
                <TextInputField value={setter} onChangeText={setSetter} placeholder="e.g. Alex R." />

                <Text style={styles.label}>Attempts</Text>
                <TextInputField value={attempts} onChangeText={setAttempts} placeholder="e.g. 5" keyboardType="number-pad" />

                <Text style={styles.label}>Description / Notes</Text>
                <TextInputField value={description} onChangeText={setDescription} placeholder="How did it go?" multiline />

                {/* Scan type toggle */}
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

// Simple inline text input to keep styles consistent
function TextInputField({ value, onChangeText, placeholder, multiline, keyboardType }: any) {
    const { TextInput } = require('react-native');
    return (
        <TextInput
            style={[styles.input, multiline && styles.textArea]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#555555"
            multiline={multiline}
            keyboardType={keyboardType}
        />
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
