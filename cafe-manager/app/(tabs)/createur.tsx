import { useEffect } from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

export default function AboutScreen() {
  const colorAnim = useSharedValue(0);

  useEffect(() => {
    colorAnim.value = withRepeat(withTiming(1, { duration: 8000 }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const interpolate = (start: string, end: string) =>
      colorAnim.value < 0.5 ? start : end;

    return {
      backgroundColor: interpolate('#89f7fe', '#66a6ff'),
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <LinearGradient
        colors={['#89f7fe', '#66a6ff']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <Ionicons name="person-circle-outline" size={100} color="#fff" style={styles.avatar} />
      <Text style={styles.name}>theta_robin</Text>
      <Text style={styles.location}>📍 Erquelinnes, Belgique</Text>

      <TouchableOpacity
        onPress={() => Linking.openURL('mailto:robin.developper.pro@gmail.com')}
        style={styles.emailButton}
      >
        <Ionicons name="mail-outline" size={20} color="#fff" />
        <Text style={styles.emailText}>robin.developper.pro@gmail.com</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Application créée  par theta_robin</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    marginBottom: 16,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  location: {
    fontSize: 16,
    color: '#f0f0f0',
    marginBottom: 20,
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    marginTop: 12,
  },
  emailText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
  footer: {
    marginTop: 40,
  },
  footerText: {
    color: '#ddd',
    fontSize: 14,
    textAlign: 'center',
  },
});
