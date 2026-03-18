import { useColorScheme } from "nativewind";
import { useSettingsStore } from "../store/useSettingsStore";
import { useEffect } from "react";

export function useThemeSync() {
    const { colorScheme, setColorScheme } = useColorScheme();
    const darkMode = useSettingsStore((state) => state.darkMode);

    useEffect(() => {
        setColorScheme(darkMode ? "dark" : "light");
    }, [darkMode]);
}
