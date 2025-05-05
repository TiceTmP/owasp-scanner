import { ref, computed } from 'vue';
import type { LoginResponse, User } from '~/types';

export const useAuth = () => {
    const { $api } = useNuxtApp();
    const router = useRouter();

    // State
    const user = ref<User | null>(null);
    const token = ref<string | null>(null);
    const loading = ref<boolean>(false);
    const error = ref<string | null>(null);

    // Computed
    const isAuthenticated = computed(() => !!token.value);
    const isAdmin = computed(() => user.value?.role === 'admin');

    // Initialize auth state from localStorage
    const initAuth = () => {
        if (process.client) {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (storedToken) {
                token.value = storedToken;

                if (storedUser) {
                    try {
                        user.value = JSON.parse(storedUser);
                    } catch (e) {
                        console.error('Failed to parse user data from localStorage');
                    }
                }
            }
        }
    };

    // Login
    const login = async (username: string, password: string) => {
        loading.value = true;
        error.value = null;

        try {
            const response = await $api.post<LoginResponse>('/auth/login', {
                username,
                password,
            });

            // Store token and user data
            token.value = response.data.token;
            user.value = response.data.user;

            // Save to localStorage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            // Redirect to dashboard
            router.push('/');

            return response.data;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
            throw error.value;
        } finally {
            loading.value = false;
        }
    };

    // Logout
    const logout = () => {
        token.value = null;
        user.value = null;

        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Redirect to login page
        router.push('/login');
    };

    // Check if user is authenticated
    const checkAuth = () => {
        if (!isAuthenticated.value && process.client) {
            router.push('/login');
        }
        return isAuthenticated.value;
    };

    // Initialize on setup
    initAuth();

    return {
        user,
        token,
        loading,
        error,
        isAuthenticated,
        isAdmin,
        login,
        logout,
        checkAuth,
    };
};