import IUser from "./IUser"

export default interface AuthContextType {
    user: IUser | null;
    token: string | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (user: IUser, token: string) => void;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    getToken?: () => string | null;
}
