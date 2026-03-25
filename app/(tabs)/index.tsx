import { Image } from 'expo-image';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Boulder Buddy</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Track Your Climbs</ThemedText>
        <ThemedText>
          Welcome to Boulder Buddy! Start by adding your first route or exploring nearby gyms.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.buttonContainer}>
        <Link href="/routeEntryPage" asChild>
          <TouchableOpacity style={styles.button}>
            <ThemedText style={styles.buttonText}>Add New Route</ThemedText>
          </TouchableOpacity>
        </Link>
        <Link href="/profilePage" asChild>
          <TouchableOpacity style={styles.button}>
            <ThemedText style={styles.buttonText}>View Profile</ThemedText>
          </TouchableOpacity>
        </Link>
        <Link href="/feedPage" asChild>
          <TouchableOpacity style={styles.button}>
            <ThemedText style={styles.buttonText}>Social Feed</ThemedText>
          </TouchableOpacity>
        </Link>
        <Link href="/nearbyGymPage" asChild>
          <TouchableOpacity style={styles.button}>
            <ThemedText style={styles.buttonText}>Nearby Gyms</ThemedText>
          </TouchableOpacity>
        </Link>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#A1CEDC',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#1D3D47',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
