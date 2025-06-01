import {colors} from "@/app/ui/config/colors";
import {SearchNormal} from "iconsax-react-native";
import {Pressable, Text} from "react-native";
import {StyleSheet} from "react-native-unistyles";

type Props = {
	openSearch: () => void;
	currentMonth: string | null;
};

export function Search({openSearch, currentMonth}: Props) {
	return (
		<Pressable style={styles.container} onPress={openSearch}>
			<Text style={styles.header}>{currentMonth}</Text>
			<SearchNormal size="25" color={colors.white} variant="Outline" />
		</Pressable>
	);
}

const styles = StyleSheet.create(({colors, sizes}) => ({
	container: {
		backgroundColor: colors.primary,
		padding: sizes["10px"],
		flexDirection: "row",
		justifyContent: "space-between",
	},
	header: {
		fontSize: 24,
		fontWeight: "600",
		color: colors.white,
	},
}));
