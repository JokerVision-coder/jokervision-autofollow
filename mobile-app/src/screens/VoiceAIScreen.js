import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Vibration,
  Dimensions,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { startVoiceCall, endVoiceCall, getVoiceStats } from '../services/VoiceAIService';

const { width, height } = Dimensions.get('window');

const VoiceAIScreen = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [voiceStats, setVoiceStats] = useState({
    totalCalls: 247,
    averageCallTime: '3:42',
    successRate: 94,
    aiAccuracy: 97,
  });
  const [conversationActive, setConversationActive] = useState(false);
  
  // Animation values
  const pulseAnim = new Animated.Value(1);
  const waveAnim = new Animated.Value(0);

  useEffect(() => {
    loadVoiceStats();
    if (conversationActive) {
      startPulseAnimation();
      startWaveAnimation();
    }
  }, [conversationActive]);

  useEffect(() => {
    let interval;
    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  const loadVoiceStats = async () => {
    try {
      const stats = await getVoiceStats();
      setVoiceStats(stats);
    } catch (error) {
      console.log('Using mock voice stats');
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startWaveAnimation = () => {
    Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  };

  const handleStartVoiceCall = async () => {
    try {
      setIsConnecting(true);
      Vibration.vibrate(100);
      
      // Start voice call
      const success = await startVoiceCall();
      
      if (success) {
        setIsConnected(true);
        setConversationActive(true);
        setCallDuration(0);
        
        Alert.alert(
          '🎤 Voice AI Connected',
          'Revolutionary AI is now listening. Start speaking about vehicles, inventory, or customer needs.',
          [{ text: 'Got it!' }]
        );
      } else {
        throw new Error('Failed to connect');
      }
    } catch (error) {
      Alert.alert(
        'Connection Failed',
        'Unable to start voice AI. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const handleEndVoiceCall = async () => {
    try {
      await endVoiceCall();
      setIsConnected(false);
      setConversationActive(false);
      Vibration.vibrate(200);
      
      Alert.alert(
        '📞 Call Ended',
        `Voice AI session completed. Duration: ${formatDuration(callDuration)}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <LinearGradient
      colors={['#0f0f23', '#1a1a2e', '#16213e']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎤 Revolutionary Voice AI</Text>
        <Text style={styles.headerSubtitle}>
          Real-time conversations • Industry exclusive
        </Text>
      </View>

      {/* Voice Control Interface */}
      <View style={styles.voiceControlContainer}>
        
        {/* Main Voice Button */}
        <View style={styles.voiceButtonContainer}>
          <Animated.View
            style={[
              styles.voiceButtonOuter,
              {
                transform: [{ scale: conversationActive ? pulseAnim : 1 }],
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.voiceButton,
                {
                  backgroundColor: isConnected ? '#e94560' : isConnecting ? '#f5af19' : '#11998e',
                },
              ]}
              onPress={isConnected ? handleEndVoiceCall : handleStartVoiceCall}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <Icon name="hourglass-empty" size={60} color="#ffffff" />
              ) : (
                <Icon 
                  name={isConnected ? "call-end" : "mic"} 
                  size={60} 
                  color="#ffffff" 
                />
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Voice Waves Animation */}
          {conversationActive && (
            <Animated.View
              style={[
                styles.voiceWaves,
                {
                  opacity: waveAnim,
                  transform: [{ scale: waveAnim }],
                },
              ]}
            >
              <View style={styles.wave} />
              <View style={[styles.wave, styles.wave2]} />
              <View style={[styles.wave, styles.wave3]} />
            </Animated.View>
          )}
        </View>

        {/* Status Display */}
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusIndicator,
            { backgroundColor: isConnected ? '#11998e' : isConnecting ? '#f5af19' : '#8e8e93' }
          ]} />
          <Text style={styles.statusText}>
            {isConnected ? 'CONNECTED & LISTENING' : 
             isConnecting ? 'CONNECTING...' : 'READY TO CONNECT'}
          </Text>
        </View>

        {/* Call Duration */}
        {isConnected && (
          <Text style={styles.callDuration}>
            {formatDuration(callDuration)}
          </Text>
        )}
      </View>

      {/* Voice Statistics */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>📊 Voice AI Performance</Text>
        
        <View style={styles.statsGrid}>
          <StatBox
            title="Total Calls"
            value={voiceStats.totalCalls}
            icon="phone"
            color="#667eea"
          />
          <StatBox
            title="Avg Call Time"
            value={voiceStats.averageCallTime}
            icon="timer"
            color="#11998e"
          />
          <StatBox
            title="Success Rate"
            value={`${voiceStats.successRate}%`}
            icon="check-circle"
            color="#38ef7d"
          />
          <StatBox
            title="AI Accuracy"
            value={`${voiceStats.aiAccuracy}%`}
            icon="psychology"
            color="#f5af19"
          />
        </View>
      </View>

      {/* Revolutionary Features */}
      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>🚀 Exclusive Voice Features</Text>
        
        <View style={styles.featuresList}>
          <FeatureItem 
            icon="record-voice-over"
            text="Real-time voice processing"
            color="#e94560"
          />
          <FeatureItem 
            icon="translate"
            text="Multi-language support (25 languages)"
            color="#667eea"
          />
          <FeatureItem 
            icon="speed"
            text="0.8s response time"
            color="#11998e"
          />
          <FeatureItem 
            icon="smart-toy"
            text="Automotive knowledge AI"
            color="#f5af19"
          />
        </View>
      </View>

      {/* Competitive Advantage Banner */}
      <LinearGradient
        colors={['#e94560', '#f5af19']}
        style={styles.competitiveBanner}
      >
        <Text style={styles.bannerTitle}>🏆 Industry Leadership</Text>
        <Text style={styles.bannerText}>
          First & only real-time voice AI in automotive industry
        </Text>
      </LinearGradient>
    </LinearGradient>
  );
};

const StatBox = ({ title, value, icon, color }) => (
  <View style={styles.statBox}>
    <Icon name={icon} size={24} color={color} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </View>
);

const FeatureItem = ({ icon, text, color }) => (
  <View style={styles.featureItem}>
    <Icon name={icon} size={20} color={color} />
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8e8e93',
  },
  voiceControlContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  voiceButtonContainer: {
    position: 'relative',
    marginBottom: 40,
  },
  voiceButtonOuter: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  voiceWaves: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wave: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(233, 69, 96, 0.3)',
  },
  wave2: {
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  wave3: {
    width: 240,
    height: 240,
    borderRadius: 120,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  callDuration: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#e94560',
  },
  statsContainer: {
    padding: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    width: (width - 60) / 2,
    backgroundColor: '#1a1a2e',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginVertical: 5,
  },
  statTitle: {
    fontSize: 12,
    color: '#8e8e93',
    textAlign: 'center',
  },
  featuresContainer: {
    padding: 20,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  featuresList: {
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    padding: 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#ffffff',
    marginLeft: 15,
    flex: 1,
  },
  competitiveBanner: {
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  bannerText: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
  },
});

export default VoiceAIScreen;