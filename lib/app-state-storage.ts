import AsyncStorage from '@react-native-async-storage/async-storage';

const APP_STATE_KEY = 'courtly:app-state';

interface AppState {
    lastRoute?: string;
    lastVisited?: string;
}

export const AppStateStorage = {
    async saveRoute(route: string) {
        try {
            const currentState = await this.getState();
            const newState: AppState = {
                ...currentState,
                lastRoute: route,
                lastVisited: new Date().toISOString(),
            };
            await AsyncStorage.setItem(APP_STATE_KEY, JSON.stringify(newState));
            console.log('📍 Saved route:', route);
        } catch (error) {
            console.error('Failed to save route:', error);
        }
    },

    async getState(): Promise<AppState> {
        try {
            const stateJson = await AsyncStorage.getItem(APP_STATE_KEY);
            if (stateJson) {
                return JSON.parse(stateJson);
            }
        } catch (error) {
            console.error('Failed to get app state:', error);
        }
        return {};
    },

    async getLastRoute(): Promise<string | null> {
        const state = await this.getState();
        return state.lastRoute || null;
    },

    async clearState() {
        try {
            await AsyncStorage.removeItem(APP_STATE_KEY);
            console.log('🧹 Cleared app state');
        } catch (error) {
            console.error('Failed to clear app state:', error);
        }
    },
};
