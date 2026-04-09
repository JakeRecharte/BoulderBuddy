import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Linking,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';

type Gym = {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    rating: number | null;
    has_bouldering: boolean;
    has_top_rope: boolean;
    has_lead: boolean;
    has_comp: boolean;
};

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3958.8; // miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function openDirections(lat: number, lon: number, name: string) {
    const encoded = encodeURIComponent(name);
    const url = Platform.OS === 'ios'
        ? `maps://maps.apple.com/?daddr=${lat},${lon}&q=${encoded}`
        : `geo:${lat},${lon}?q=${lat},${lon}(${encoded})`;
    Linking.openURL(url);
}

function ClimbingTags({ gym }: { gym: Gym }) {
    const tags = [
        gym.has_bouldering && 'Bouldering',
        gym.has_top_rope && 'Top Rope',
        gym.has_lead && 'Lead',
        gym.has_comp && 'Comp',
    ].filter(Boolean) as string[];

    return (
        <View style={styles.tags}>
            {tags.map(tag => (
                <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                </View>
            ))}
        </View>
    );
}

export default function NearbyGymPage() {
    const [gyms, setGyms] = useState<(Gym & { distance?: number })[]>([]);
    const [loading, setLoading] = useState(true);
    const [locationError, setLocationError] = useState('');

    useEffect(() => {
        loadGyms();
    }, []);

    async function loadGyms() {
        setLoading(true);

        const { data, error } = await supabase
            .from('gyms')
            .select('id, name, address, latitude, longitude, rating, has_bouldering, has_top_rope, has_lead, has_comp');

        if (error || !data) {
            setLoading(false);
            return;
        }

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setLocationError('Enable location to sort by distance.');
            setGyms(data);
            setLoading(false);
            return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        const sorted = data
            .map(g => ({ ...g, distance: getDistance(latitude, longitude, g.latitude, g.longitude) }))
            .sort((a, b) => a.distance - b.distance);

        setGyms(sorted);
        setLoading(false);
    }

    function renderGym({ item }: { item: Gym & { distance?: number } }) {
        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.cardInfo}>
                        <Text style={styles.gymName}>{item.name}</Text>
                        {item.address && <Text style={styles.gymAddress}>{item.address}</Text>}
                    </View>
                    <View style={styles.cardMeta}>
                        {item.rating && (
                            <Text style={styles.rating}>★ {item.rating.toFixed(1)}</Text>
                        )}
                        {item.distance !== undefined && (
                            <Text style={styles.distance}>{item.distance.toFixed(1)} mi</Text>
                        )}
                    </View>
                </View>

                <ClimbingTags gym={item} />

                <TouchableOpacity
                    style={styles.directionsButton}
                    onPress={() => openDirections(item.latitude, item.longitude, item.name)}
                >
                    <Text style={styles.directionsText}>Get Directions</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <Text style={styles.title}>Nearby Gyms</Text>
                {!!locationError && <Text style={styles.locationError}>{locationError}</Text>}
                {loading ? (
                    <ActivityIndicator color="#FFFFFF" style={{ marginTop: 40 }} />
                ) : (
                    <FlatList
                        data={gyms}
                        keyExtractor={g => g.id}
                        renderItem={renderGym}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.list}
                    />
                )}
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
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 0.5,
        marginBottom: 20,
    },
    locationError: {
        color: '#777777',
        fontSize: 12,
        marginBottom: 12,
    },
    list: {
        gap: 12,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: '#1A1A1A',
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: '#2A2A2A',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    cardInfo: {
        flex: 1,
        paddingRight: 12,
    },
    gymName: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 4,
    },
    gymAddress: {
        color: '#777777',
        fontSize: 12,
    },
    cardMeta: {
        alignItems: 'flex-end',
        gap: 4,
    },
    rating: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    distance: {
        color: '#777777',
        fontSize: 12,
    },
    tags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 14,
    },
    tag: {
        backgroundColor: '#2A2A2A',
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    tagText: {
        color: '#AAAAAA',
        fontSize: 11,
        fontWeight: '700',
    },
    directionsButton: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
    },
    directionsText: {
        color: '#0D0D0D',
        fontSize: 13,
        fontWeight: '800',
    },
});
