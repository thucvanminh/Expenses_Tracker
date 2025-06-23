import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Nếu dùng Clerk hoặc Auth khác, import hook lấy email
import { useUser } from '@clerk/clerk-expo';
import { useAppTheme } from '@/components/ThemeProvider';
import { useRouter, useFocusEffect } from 'expo-router';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { SignOutButton } from '@/components/SignOutButton';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../assets/styles/create.styles';
import { styles as stylesHome } from '../../assets/styles/home.styles';
import { API_URL } from '@/constants/api';
interface ScheduleHistory {
  goal: number;
  startDate: string;
  endDate: string;
  savedAt: string;
  savedStates?: boolean[];
  name?: string;
}

const Profile = () => {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress || 'user@example.com';
  const [password, setPassword] = useState('');
  const [history, setHistory] = useState<ScheduleHistory[]>([]);
  const { theme } = useAppTheme();
  const router = useRouter();
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const userId = user?.id;

  // useEffect(() => {
  //   const fetchHistory = async () => {
  //     const data = await AsyncStorage.getItem('schedule_history');
  //     if (data) setHistory(JSON.parse(data));
  //     else setHistory([]);
  //   };
  //   fetchHistory();
  // }, []);
  // useEffect(() => {
  //   const fetchHistory = async () => {
  //     if (!userId) return;
  //     try {
  //       const res = await fetch(`${API_URL}/schedules?user_id=${userId}`);
  //       if (!res.ok) throw new Error('Failed to fetch schedules');
  //       const data = await res.json();
  //       setHistory(data); // data là mảng schedule từ backend
  //     } catch (e) {
  //       setHistory([]);
  //     }
  //   };
  //   fetchHistory();
  // }, [userId]);

  // useFocusEffect(
  //   React.useCallback(() => {
  //     const fetchHistory = async () => {
  //       const data = await AsyncStorage.getItem('schedule_history');
  //       if (data) setHistory(JSON.parse(data));
  //       else setHistory([]);
  //     };
  //     fetchHistory();
  //   }, [])
  // );
  // useEffect(() => {
  //   const fetchHistory = async () => {
  //     if (!userId) return;
  //     try {
  //       const res = await fetch(`${API_URL}/schedules?user_id=${userId}`);
  //       if (!res.ok) throw new Error('Failed to fetch schedules');
  //       const data = await res.json();
  //       // Map lại dữ liệu cho đúng với UI
  //       const mapped = data.map((item: any) => ({
  //         id: item.id,
  //         goal: item.goal,
  //         startDate: item.start_date,
  //         endDate: item.end_date,
  //         savedAt: item.created_at,
  //         name: item.name,
  //       }));
  //       setHistory(mapped);
  //     } catch (e) {
  //       setHistory([]);
  //     }
  //   };
  //   fetchHistory();
  // }, [userId]);

  useEffect(() => {
    const fetchSchedules = async () => {
      if (!userId) return;
      try {
        const res = await fetch(`${API_URL}/schedules/${userId}`);
        if (!res.ok) throw new Error('Failed to fetch schedules');
        const data = await res.json();

        // Map backend fields to frontend structure
        const mappedSchedules = data.map((schedule: any) => ({
          id: schedule.id,
          goal: schedule.goal,
          startDate: schedule.start_date,
          endDate: schedule.end_date,
          savedAt: schedule.created_at,
          name: schedule.name || `Schedule ${new Date(schedule.created_at).toLocaleDateString()}`
        }));

        setHistory(mappedSchedules);
        console.log("Fetched schedules:", mappedSchedules);
      } catch (error) {
        console.error("Error fetching schedules:", error);
        setHistory([]);
      }
    };

    fetchSchedules();
  }, [userId]);

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please enter all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (!user) {
      Alert.alert('Error', 'User not found');
      return;
    }
    setLoading(true);
    try {
      await user.update({ password: newPassword });
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Success', 'Password updated!');
    } catch (e) {
      Alert.alert('Error', 'Failed to update password');
    }
    setLoading(false);
  };

  const handleOpenSchedule = async (item) => {
    // Gọi API lấy chi tiết schedule và các ngày
    const res = await fetch(`${API_URL}/schedules/${item.id}`);
    const data = await res.json();
    // data.days là mảng các ngày, mỗi ngày có is_checked
    const savedStates = data.days.map((d) => d.is_checked);
    // Điều hướng sang màn hình schedule, truyền savedStates
    router.push({
      pathname: '/(tabs)/schedule',
      params: {
        goal: item.goal.toString(),
        startDate: item.start_date,
        endDate: item.end_date,
        savedStates: JSON.stringify(savedStates),
        openSaved: '1',
      },
    });
  };

  const handleDeleteSchedule = async (idx: number) => {
    const newHistory = [...history];
    newHistory.splice(idx, 1);
    setHistory(newHistory);
    await AsyncStorage.setItem('schedule_history', JSON.stringify(newHistory));
    Alert.alert('Success', 'Schedule deleted!');
  };

  const handleEditName = (idx: number, currentName: string | undefined) => {
    setEditingIdx(idx);
    setEditingName(currentName || '');
  };

  const handleSaveName = async (idx: number) => {
    const newHistory = [...history];
    newHistory[idx].name = editingName.trim() || `Schedule ${new Date(newHistory[idx].savedAt).toLocaleDateString()}`;
    setHistory(newHistory);
    setEditingIdx(null);
    setEditingName('');
    await AsyncStorage.setItem('schedule_history', JSON.stringify(newHistory));
    Alert.alert('Success', 'Schedule name updated!');
  };

  const handleNewPassword = () => {
    setPassword('********');
    Alert.alert('Success', 'A new password has been generated!');
  };

  return (
    <KeyboardAwareScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderColor: theme.border }]}>
        <TouchableOpacity style={[styles.backButton, { borderColor: theme.border }]} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
        <Text></Text>
      </View>
      {/* <Text style={[stylesProfile.title, { color: theme.text }]}>Profile</Text> */}
      <View style={styles.card}>
        <View>
          <Text style={[stylesProfile.label, { color: theme.text }]}>Email:</Text>
          <Text style={[stylesProfile.value, { color: theme.text }]}>{email}</Text>
          <Text style={[stylesProfile.label, { color: theme.text }]}>Password:</Text>
          <Text style={[stylesProfile.value, { color: theme.text, letterSpacing: 4 }]}>********</Text>
          <Text style={[stylesProfile.label, { color: theme.text }]}>New Password:</Text>
          <TextInput
            style={{ borderWidth: 1, borderColor: theme.primary, borderRadius: 6, padding: 8, color: theme.text, marginBottom: 8 }}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password"
            secureTextEntry
          />
          <Text style={[stylesProfile.label, { color: theme.text }]}>Confirm Password:</Text>
          <TextInput
            style={{ borderWidth: 1, borderColor: theme.primary, borderRadius: 6, padding: 8, color: theme.text, marginBottom: 8 }}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            secureTextEntry
          />
          <TouchableOpacity style={[stylesProfile.button, { backgroundColor: theme.primary }]} onPress={handleUpdatePassword} disabled={loading}>
            <Text style={stylesProfile.buttonText}>{loading ? 'Updating...' : 'Update'}</Text>
          </TouchableOpacity>
          <View style={[{ alignSelf: 'flex-end', alignItems: 'center', flexDirection: 'row' }]}>
            <ThemeSwitcher />
            <SignOutButton />
          </View>
        </View>
      </View>
      <View style={stylesHome.content}>
        <View style={[stylesHome.transactionsHeaderContainer]}>
          <Text style={[stylesHome.sectionTitle, { color: theme.text }]}>Saved Schedules</Text>
        </View>
      </View>
      <View style={[styles.card]}>
        <FlatList
          data={history}
          keyExtractor={(_, idx) => idx.toString()}
          renderItem={({ item, index }) => (
            <View style={[stylesProfile.scheduleItem, { backgroundColor: theme.card }]}>
              {editingIdx === index ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <TextInput
                    style={{ flex: 1, borderWidth: 1, borderColor: theme.primary, borderRadius: 6, padding: 6, color: theme.textLight }}
                    value={editingName}
                    onChangeText={setEditingName}
                    placeholder="Schedule name"
                  />
                  <TouchableOpacity style={{ marginLeft: 8 }} onPress={() => handleSaveName(index)}>
                    <Text style={{ color: theme.primary, fontWeight: 'bold' }}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ marginLeft: 4 }} onPress={() => { setEditingIdx(null); setEditingName(''); }}>
                    <Text style={{ color: theme.expense, fontWeight: 'bold' }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={[stylesProfile.scheduleText, { fontWeight: 'bold', flex: 1, color: theme.text }]}>
                    {item.name || `Schedule ${new Date(item.savedAt).toLocaleDateString()}`}
                  </Text>
                  <TouchableOpacity onPress={() => handleEditName(index, item.name)}>
                    <Text style={{ color: theme.primary, fontWeight: 'bold' }}>Edit</Text>
                  </TouchableOpacity>
                </View>
              )}
              <Text style={[stylesProfile.scheduleText, { color: theme.text }]}>Goal: {item.goal.toLocaleString()} VND</Text>
              <Text style={[stylesProfile.scheduleText, { color: theme.text }]}>
                {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
              </Text>
              <Text style={[stylesProfile.scheduleText, { color: theme.text }]}>Saved at: {new Date(item.savedAt).toLocaleString()}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
                <TouchableOpacity style={[stylesProfile.openBtn, { backgroundColor: theme.primary }]} onPress={() => handleOpenSchedule(item)}>
                  <Text style={stylesProfile.openBtnText}>Open</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[stylesProfile.openBtn, { backgroundColor: theme.expense }]} onPress={() => handleDeleteSchedule(index)}>
                  <Text style={stylesProfile.openBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={{ color: theme.textLight, marginTop: 10 }}>No saved schedules.</Text>}
        />
      </View>



    </KeyboardAwareScrollView>
  );
};

const stylesProfile = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  label: { fontSize: 16, color: '#555', marginTop: 8 },
  value: { fontSize: 16, fontWeight: 'bold', color: '#222', marginBottom: 4 },
  button: { padding: 10, borderRadius: 8, marginTop: 10, alignSelf: 'flex-start' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  scheduleItem: { borderRadius: 12, padding: 14, marginBottom: 14, elevation: 1 },
  scheduleText: { fontSize: 15, color: '#333', marginBottom: 2 },
  openBtn: { marginTop: 8, paddingVertical: 6, paddingHorizontal: 18, borderRadius: 8, alignSelf: 'flex-end' },
  openBtnText: { color: '#fff', fontWeight: 'bold' },
});

export default Profile;
