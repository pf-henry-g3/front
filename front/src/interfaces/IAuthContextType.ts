import IUser from "./IUser"

export default interface AuthContextType {
    user: IUser | null;
    token: string | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (user: IUser) => void;
    logout: () => void;
    refreshUser: () => void;
}
