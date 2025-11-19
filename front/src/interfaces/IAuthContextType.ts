import IUser from "./IUser"

export default interface AuthContextType {
    user: IUser | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (user: IUser) => void;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}
