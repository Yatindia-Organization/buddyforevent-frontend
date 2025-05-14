import React, {
    createContext,
    useState,
    useContext,
    useEffect,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { loginUser } from '../../data/api/Login';
import { Alert } from 'react-native';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigation = useNavigation();

    const login = async ({ email, password }) => {
        try {
            const response = await loginUser({ email, password });
            if (response?.token) {
                await AsyncStorage.setItem(
                    'userDetails',
                    JSON.stringify(response.user)
                );
                setUser(response.user);

                if (response?.user?.user_role === 'super_admin') {
                    navigation.navigate('SuperAdminTabNavigation');
                } else if (response?.user.user_role === 'school_admin') {
                    navigation.navigate('AdminTabNavigation');
                } else if (response?.user.user_role === 'user') {
                    navigation.navigate('UserTabNavigation');
                }
            }
        } catch (error) {
            Alert.alert('Login Error', 'Failed to login. Please try again.');
        }
    };

    const getToken = async () => {
        const userString = await AsyncStorage.getItem('userDetails');
        if (userString) {
            const userData = JSON.parse(userString);
            return userData.token || null;
        }
        return null;
    };

    const getUser = async () => {
        const userString = await AsyncStorage.getItem('userDetails');
        if (userString) {
            const userData = JSON.parse(userString);
            return userData || null;
        }
        return null;
    };

    const logout = async () => {
        navigation.navigate('LoginScreen');
        await AsyncStorage.clear();
        setUser(null);
    };

    useEffect(() => {
        const fetchUser = async () => {
            const userString = await AsyncStorage.getItem('userDetails');
            if (userString) {
                const userData = JSON.parse(userString);
                setUser(userData || null);
            }
        };

        fetchUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, logout, login, getToken, getUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
