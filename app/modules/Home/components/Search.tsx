import {SearchNormal} from "iconsax-react-native";
import {useTranslation} from "react-i18next";
import {Pressable} from "react-native";
import {StyleSheet} from "react-native-unistyles";

import {settings$} from "@/app/store/settings";
import {Text} from "@/app/ui/components/Text";
import {colors} from "@/app/ui/config/colors";
import {hapticToTrigger} from "@/app/utils/haptics";
import {use$} from "@legendapp/state/react";

type Props = {
	openSearch: () => void;
	currentMonth: string | null;
};

export function Search({openSearch, currentMonth}: Props) {
	const {t} = useTranslation();
	const haptic = hapticToTrigger("impactMedium");
	const hapticsEnabled = use$(settings$.haptics);

	const handleOpenSearch = () => {
		openSearch();
		if (hapticsEnabled) {
			haptic.impactMedium();
		}
	};

	return (
		<Pressable style={styles.container} onPress={handleOpenSearch}>
			<Text variant="header">
				{currentMonth ? t(`months.${currentMonth}`) : ""}
			</Text>
			<SearchNormal size="25" color={colors.white} variant="Outline" />
		</Pressable>
	);
}

const styles = StyleSheet.create(({colors, sizes}) => ({
	container: {
		backgroundColor: colors.primary,
		paddingHorizontal: sizes["10px"],
		height: 50,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
}));
